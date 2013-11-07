var crypto = require('crypto');

exports.default = function(req, res){
    res.send('Hello, User Controller!');
};

exports.login = function(req, res){
    var referer = req.session.referer ? req.session.referer : '';
    res.render('user_login', {referer: referer});
};

exports.doLogin = function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var referer = req.body.referer=='' ? '/' : req.body.referer;
    if (username==req.app.get('admin username') && password==req.app.get('admin password')){
        createToken(req, res);
    }
    res.redirect(referer);
};

exports.logout = function(req, res){
    var c_key = req.app.get('admin cookie');
    req.session.loginStatus = false;
    req.session.referer = '';
    res.cookie(c_key, '', {expires: new Date(Date.now() - 900000)});
    res.redirect('/');
};

exports.checkLogin = function(req, res, next){
    if (req.session.loginStatus){
	res.locals.loginStatus = true;
	next();
	return;
    }

    var c_key = req.app.get('admin cookie');
    var token = '';
    try{
	token = req.cookies[c_key];
    }catch(e){}

    if (token == createToken(req, res)){
	req.session.loginStatus = true;
	res.locals.loginStatus = true;
	next();
	return;
    }

    if (/\/*\/(add|update|delete)(\/*)?/.test(req.path)){
	req.session.referer = req.path;
        res.redirect('/user/login');
    }else{
        next();
    }
}

function createToken(req, res){
    var c_salt = req.app.get('salt');
    var c_key = req.app.get('admin cookie');
    var c_username = req.app.get('admin username');
    var c_password = req.app.get('admin password');
    var c_token = crypto.createHash('md5').update(c_username + c_password + c_salt).digest('hex');
    if (req.path == '/user/login'){
	var token = crypto.createHash('md5').update(req.body.username + req.body.password + c_salt).digest('hex');
	if (token !== c_token){
            return false;
	}
	res.cookie(c_key, token, {expires: new Date(Date.now() + 900000), httpOnly: true});
    }

    return c_token;
}
