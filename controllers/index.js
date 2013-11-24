var fs = require('fs');
var marked = require('marked');
var postModel = require('../models/post');
var adminModel = require('../models/admin');

exports.view = function(req, res){
    var page = req.params.page;
    if (page == undefined || /^\d+$/.test(page) == false){
        page = 1;
    }
    page = parseInt(page);
    if ( page>1 && postModel.checkPostPage(page) == false ){
        res.redirect('/index/1');
    }
   
    var olderPage = false;
    var newerPage = false;
    var olderPageNum = page + 1;
    if ( postModel.checkPostPage(olderPageNum) ){
        olderPage = olderPageNum;
    }
    var newerPageNum = page - 1;
    if ( newerPageNum > 0 && postModel.checkPostPage(newerPageNum) ){
        newerPage = newerPageNum;
    }

    var postList = postModel.readPostList(page);
    res.render('index', {postList: postList, pageTitle: req.app.locals.langs.pagetitle_homepage, olderPage: olderPage, newerPage: newerPage});
};

exports.about = function(req, res){
    var about = adminModel.readAboutme();
    if (!about){
        about = req.app.locals.langs.tip_noaboutme;
    }

    res.render('about', {about: marked(about), pageTitle: req.app.locals.langs.pagetitle_aboutme});
};

exports.rss = function(req, res){
    var postList = postModel.readPostList(1);
    var list = postList.slice(0, 20);
    
    res.contentType('application/xml');
    res.render('rss', {posts: list});
};