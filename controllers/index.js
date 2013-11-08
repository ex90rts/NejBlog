var fs = require('fs');
var postModel = require('../models/post');

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
    var about = 'This is the default about content, you can create your own about content under Admin->Setting page after logged in.';
    var filePath = './data/about.md';
    if (fs.existsSync(filePath)){
	about = fs.readFileSync(filePath);
    }
    res.render('about', {about: about});
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
