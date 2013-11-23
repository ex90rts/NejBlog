var fs = require('fs');
var marked = require('marked');
var postModel = require('../models/post');
var adminModel = require('../models/admin');

exports.view = function(req, res){
    var page = req.params.page;
    if (page == undefined || /^\d+$/.test(page) == false){
        page = 1;
    }

    var postList = false;
    try{
        postList = postModel.readPostList(page);
        if (JSON.stringify(postList).length == 2){
	        postList = false;
        }
    }catch(e){
        console.log('Read post list data file failed: ' + e.toString());
    }
    
    res.render('index', {pageTitle: 'Index', postList: postList});
};

exports.about = function(req, res){
    var about = adminModel.readAboutme();
    if (!about){
        about = req.app.locals.langs.tip_noaboutme;
    }

    res.render('about', {about: marked(about)});
};

exports.rss = function(req, res){
    var postIds = postModel.readPostIds();
    
    var list = [];
    for(var i=0; i<postIds.length; i++){
        var summ = postModel.readPostSumm(postIds[i]);
        list.unshift(summ); 
    }
    
    res.contentType('application/xml');
    res.render('rss', {posts: list});
};