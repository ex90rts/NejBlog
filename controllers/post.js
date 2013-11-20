var fs = require('fs');
var marked = require('marked');
var global = require('../global');
var postModel = require('../models/post');
var tagModel = require('../models/tag');

var marksumm = require('markdown-summary');

exports.view = function(req, res){
    var id = req.params.id;
    var post = postModel.readPostData(id);
    if (!post){
        res.redirect(404, '/404');
	return;
    }

    //var mdContent = marked(post.content);
    var mdContent = marksumm.summ(post.content);
    res.render('post_view', {post: post, mdContent: mdContent});    
};

exports.admin = function(req, res){
    var postList = false;
    try{
        postList = postModel.readPostList();
        if (JSON.stringify(postList).length == 2){
            postList = false;
        }
    }catch(e){}

    if (postList){
        var tempList = [];
        for(var year in postList){
            tempList = tempList.concat(postList[year]);
        }
        postList = tempList;
    }

    res.render('post_admin', {postList: postList});
};

exports.add = function(req, res){
    res.render('post_add', {title: 'Add New Post'});
};

exports.doAdd = function(req, res){
    var postId = postModel.savePostIds();
    var date = new Date();
    var created = req.body.created;
    if (created.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(created)){
        date = new Date(created);
    }
    var tags = tagModel.parseTags(req.body.tags);
    var post = {
        _id: postId,
        title: req.body.title,
        content: req.body.content,
        tags: tags,
        created: date.toJSON()
    };
   
    var createdYear = date.getFullYear();
    var createdDate =  ('0'+(date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2);
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
    postModel.savePostSumm(postId, listItem);

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
    
    var date = new Date(oldPost.created);
    var created = req.body.created;
    if (created.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(created)){
        date = new Date(created);
    }

    var post = {
        _id: id,
        title: req.body.title,
        content: req.body.content,
        tags: tags,
        created: date.toJSON()
    };

    var createdYear = date.getFullYear();
    var createdDate =  ('0'+(date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2);
    var listItem = {
        _id: id,
        title: req.body.title,
        tags: req.body.tags,
        created: post.created,
        year: createdYear,
        date: createdDate
    }
    
    postModel.savePostData(post);
    postModel.savePostList(createdYear, listItem, 'update');
    postModel.savePostSumm(id, listItem);
    
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

exports.upload = function(req, res){
    res.render('post_upload');
};

exports.doUpload = function(req, res){
    var fileurl = req.headers.origin + global.uploadFile(req.files, 'filedata');
	var script = '<script>parent.document.getElementById("linkField").value="' + fileurl + '";</script>';
	res.send(script);
};

exports.delete = function(req, res){
    var id = req.params.id;
    try{
        var summ = postModel.readPostSumm(id);
        var post = postModel.readPostData(id);
	    if (postModel.removePostData(id)){
            postModel.removePostSumm(id);
            postModel.updatePostId(id, 'remove');

            for(var i=0; i<post.tags.length; i++){
	            var tag = post.tags[i];
	            tagModel.saveTagData(tag, post, 'remove');
            }
	        tagModel.saveTagList(post.tags, 'remove');

	        var createdYear = new Date(post.created).getFullYear();
	        postModel.savePostList(createdYear, summ, 'remove');
            postModel.saveTrashList(summ, 'add');
        }
    }catch(e){
        console.log('Remove post data file failed');
    }
    
    res.redirect('/post/admin');
};
