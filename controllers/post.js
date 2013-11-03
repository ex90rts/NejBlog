var fs = require('fs');
var markdown = require('markdown').markdown;
var postModel = require('../models/post');
var tagModel = require('../models/tag');

exports.view = function(req, res){
    var id = req.params.id;
    var post = postModel.readPostData(id);
    if (!post){
        res.redirect(404, '/404');
	return;
    }

    var mdContent = markdown.toHTML(post.content);
    res.render('post_view', {post: post, mdContent: mdContent});    
};

exports.add = function(req, res){
    res.render('post_add', {title: 'Add New Post'});
};

exports.doAdd = function(req, res){
    var postId = postModel.savePostIds();
    var date = new Date(); 
    var tags = tagModel.parseTags(req.body.tags);
    var post = {
        _id: postId,
        title: req.body.title,
        content: req.body.content,
        tags: tags,
        created: date.toJSON()
    };
   
    var createdYear = date.getFullYear();
    var createdDate = (date.getMonth() + 1) + '-' + date.getDate();
    var listItem = {
        _id: postId,
	title: req.body.title,
	tags: req.body.tags,
	created: post.created,
	year: createdYear,
	date: createdDate
    }
    
    postModel.savePostData(post); 
    postModel.savePostList(createdYear, listItem, 'add');

    for(var i=0; i<tags.length; i++){
	tagModel.saveTagData(tags[i], listItem, 'add');
    }
    tagModel.saveTagList(tags, 'add');

    res.redirect('/post/view/' + postId);
};

exports.update = function(req, res){
    var postData = postModel.readPostData(req.params.id, req.app.get('encoding'));
    if (postData){
        res.render('post_update', {post: postData});
    }else{
	res.redirect(404, '/404');
    }
};

exports.doUpdate = function(req, res){
    var id = req.params.id;
    var oldPost = postModel.readPostData(id);
    if (!oldPost){
	res.redirect(404, '/404');
    }

    var tags = tagModel.parseTags(req.body.tags);
    var date = new Date();    
    var post = {
        _id: id,
        title: req.body.title,
        content: req.body.content,
        tags: tags,
        created: oldPost.created
    };

    var createdYear = date.getFullYear();
    var createdDate = (date.getMonth() + 1) + '-' + date.getDate();
    var listItem = {
        _id: id,
	title: req.body.title,
	tags: req.body.tags,
	created: post.created,
	year: createdYear,
	date: createdDate
    }
    
    postModel.savePostData(post);
    
    var oldTags = oldPost.tags;
    var delTags = [];
    var newTags = [];
    for(var i=0; i<oldTags.length; i++){
        if (tags.indexOf(oldTags[i]) == -1){
	    delTags.push(oldTags[i]);
	    tagModel.saveTagData(oldTags[i], listItem, 'remove');
	}
    }
    for (var i=0; i<tags.length; i++){
	if (oldTags.indexOf(tags[i]) == -1){
	    newTags.push(tags[i]);
	    tagModel.saveTagData(tags[i], listItem, 'add');
	}
    }
    tagModel.saveTagList(delTags, 'remove');
    tagModel.saveTagList(newTags, 'add');

    res.redirect('/post/view/' + id);
};

exports.delete = function(req, res){
    var id = req.params.id;
    try{
	if (postModel.removePostData(id)){
            var post = postModel.readPostData(id); 
            for(var i=0; i<post.tags.length; i++){
	        var tag = post.tags[i];
	        tagModel.saveTagData(tag, post, 'remove');
            }
	    tagModel.saveTagList(post.tags, 'remove');
        }
    }catch(e){
        console.log('Remove post data file failed');
    }
    
    res.redirect('/');
};
