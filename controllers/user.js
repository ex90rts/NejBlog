var crypto = require('crypto');
var global = require('../global');
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

    var user = userModel.readUserData();
    if (username==user.username && password==user.password){
        createToken(req, res);
    }else{
        global.setMessage(req, req.app.locals.langs.login_failed);
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
    do{
        if (req.session.loginStatus){
            res.locals.loginStatus = true;
            break;
        }

        var c_key = req.app.get('admin cookie');
        var token = '';
        try{
            token = req.cookies[c_key];
        }catch(e){}

        if (token == createToken(req, res)){
            req.session.loginStatus = true;
            res.locals.loginStatus = true;
            break;
        }
    }while(false);

    if (req.session.loginStatus == false || req.session.loginStatus == undefined){
        if (/\/*\/(add|update|delete|passwd|setting)(\/*)?/.test(req.path)){
	        req.session.referer = req.path;
            res.redirect('/user/login');
        }
    }else{
        if (req.path == '/user/login' && req.method == 'GET'){
            res.redirect('/post/admin');
        }
    }
    next();
};

exports.passwd = function(req, res){
    var user = userModel.readUserData();
    res.render('user_passwd', {username: user.username});
};

exports.doPasswd = function(req, res){
    var username = req.body.username;
    var oldPassword = req.body.oldPassword;
    var password = req.body.password;
    var password2 = req.body.password2;

    var user = userModel.readUserData();
    var langs = req.app.locals.langs;

    var error = '';
    do{
        if (/^\w{5,16}$/.test(username) == false){
            error = langs.password_failed_username;
            break;
        }
        if (password.length < 6){
            error = langs.password_failed_newpassword;
            break;
        }
        if (password != password2){
            error = langs.password_failed_match;
            break;
        }

        if (crypto.createHash('md5').update(oldPassword).digest('hex') != user.password){
            error = langs.password_failed_oldpassword;
            break;
        }
        
        user.username = username;
        user.password = crypto.createHash('md5').update(password).digest('hex');
        userModel.saveUserData(user);
    }while(false); 
    
    if (error != ''){
        global.setMessage(req, error);
        res.render('user_passwd', {username: user.username});
    }else{
        global.setMessage(req, langs.password_changed);
        res.redirect('/');
    }
};

function createToken(req, res){
    var c_salt = req.app.get('salt');

    var user = userModel.readUserData();
    var c_key = user.cookie;
    var c_username = user.username;
    var c_password = user.password;
    var c_token = crypto.createHash('md5').update(c_username + c_password + c_salt).digest('hex');
    if (req.path == '/user/login' && req.method == 'POST'){
        var hashPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
        var token = crypto.createHash('md5').update(req.body.username + hashPassword + c_salt).digest('hex');
        if (token !== c_token){
            return false;
        }
        res.cookie(c_key, token, {expires: new Date(Date.now() + 900000), httpOnly: true});
        req.session.loginStatus = true;
        res.locals.loginStatus = true;
    }

    return c_token;
}
