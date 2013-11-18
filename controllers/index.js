var fs = require('fs');
var marked = require('marked');
var postModel = require('../models/post');
var adminModel = require('../models/admin');

exports.view = function(req, res){
    var postList = false;
    try{
        postList = postModel.readPostList();
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
    var postList = {};
    try{
        postList = postModel.readPostList();
    }catch(e){}
        
    var list = [];
    for(var year in postList){
        var subList = postList[year];
        for(var i=0; i<subList.length; i++){
           list.unshift(subList[i]); 
	}	
    }
    
    res.set('Content-Type', 'application/rss+xml');
    res.render('rss', {posts: list});
};
