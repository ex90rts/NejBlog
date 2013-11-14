var crypto = require('crypto');
var userModel = require('../models/user');

exports.default = function(req, res){
    res.send('Hello, User Controller!');
};

exports.login = function(req, res){
    var referer = req.session.referer ? req.session.referer : '';
    res.render('user_login', {referer: referer});
};

exports.doLogin = function(req, res){
    var username = req.body.username;
    var password = crypto.createHash('md5').update(req.body.password).digest('hex');
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

    if (req.method == 'POST' && token == createToken(req, res)){
        req.session.loginStatus = true;
        res.locals.loginStatus = true;
        next();
        return;
    }

    if (/\/*\/(add|update|delete|passwd)(\/*)?/.test(req.path)){
	    req.session.referer = req.path;
        res.redirect('/user/login');
    }else{
        next();
    }
};

exports.passwd = function(req, res){
    var user = userModel.readUserData();
    res.render('user_passwd', {username: user.username, message: 'Test Message'});
};

exports.doPasswd = function(req, res){
    var username = req.body.username;
    var oldPassword = req.body.oldPassword;
    var password = req.body.password;
    var password2 = req.body.password2;

    var user = userModel.readUserData();
    
    var error = '';
    do{
        if (/^\w{5,16}$/.test(username) == false){
            error = 'Username Not Valid';
            break;
        }
        if (password.length < 6){
            error = 'New Password Is To Short, At Least 6 Chars';
            break;
        }
        if (password != password2){
            error = 'Tow New Password Not Match';
            break;
        }

        if (crypto.createHash('md5').update(oldPassword).digest('hex') != user.password){
            error = 'Old Password Not Match';
            break;
        }
        
        user.username = username;
        user.password = crypto.createHash('md5').update(password).digest('hex');
        userModel.saveUserData(user);
    }while(false); 
    
    if (error != ''){
        res.render('user_passwd', {username: user.username, message: error});
    }else{
        res.redirect('/');
    }
};

function createToken(req, res){
    var c_salt = req.app.get('salt');
    var c_key = req.app.get('admin cookie');
    var c_username = req.app.get('admin username');
    var c_password = req.app.get('admin password');
    var c_token = crypto.createHash('md5').update(c_username + c_password + c_salt).digest('hex');
    if (req.path == '/user/login'){
        var hashPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
        var token = crypto.createHash('md5').update(req.body.username + hashPassword + c_salt).digest('hex');
        if (token !== c_token){
            return false;
        }
        res.cookie(c_key, token, {expires: new Date(Date.now() + 900000), httpOnly: true});
    }

    return c_token;
}
