var crypto = require('crypto');
var jade = require('jade');
var tagModel = require('./models/tag');

exports.siteRelevant = function(req, res, next){
    var tagList = tagModel.readTagList();
    var relevant = jade.renderFile('views/relevant.jade', {loginStatus: req.session.loginStatus, tagList: tagList});
    req.app.locals.relevant = relevant;
    next();
};

exports.currentNav = function(req, res, next){
    var nav = 'index';
    if (req.path == '/user/login'){
        nav = 'login';
    }else if(req.path == '/about.html'){
        nav = 'about';
    }
    req.app.locals.currentNav = nav;
    next();
};

