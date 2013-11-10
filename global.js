var crypto = require('crypto');
var jade = require('jade');
var tagModel = require('./models/tag');
var adminModel = require('./models/admin');

exports.siteRelevant = function(req, res, next){
    var tagList = tagModel.readTagList();
    var config = adminModel.readSetting();
    var relevant = jade.renderFile('views/relevant.jade', {
        loginStatus: req.session.loginStatus, 
        tagList: tagList, 
        webinfo: config.webinfo, 
        links: config.links
    });
    req.app.locals.relevant = relevant;
    next();
};

exports.currentNav = function(req, res, next){
    var nav = 'index';
    if (req.path == '/user/login'){
        nav = 'login';
    }else if(req.path == '/about' || req.path == '/about.html'){
        nav = 'about';
    }else if(/\/*\/(add|update|delete|setting)(\/*)?/.test(req.path)){
        nav = 'admin';
    }
    req.app.locals.currentNav = nav;
    next();
};

