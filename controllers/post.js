var fs = require('fs');
var marked = require('marked');
var global = require('../global');
var postModel = require('../models/post');
var tagModel = require('../models/tag');

exports.view = function(req, res){
    var id = req.params.id;
    var post = postModel.readPostData(id);
    if (!post){
        res.redirect('/404');
        return;
    }

    var mdContent = marked(post.content);
    global.sendResponse({
    	res : res,
    	view : 'post_view', 
    	data : {
    		post: post, 
    		mdContent: mdContent, 
    		pageTitle: post.title
    	}
    });    
};

exports.admin = function(req, res){
    var page = req.params.page;
    if (page == undefined || /^\d+$/.test(page) == false){
        page = 1;
    }
    page = parseInt(page);
    if ( page > 1 && postModel.checkPostPage(page) == false ){
        res.redirect('/post/admin/1');
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
    global.sendResponse({
    	res : res,
    	view : 'post_admin',
    	data : {
    		postList: postList, 
    		pageTitle: req.app.locals.langs.nav_admin_myposts, 
    		olderPage: olderPage, newerPage: newerPage
    	}
    });
};

exports.add = function(req, res){
    global.sendResponse({
    	res : res,
    	view : 'post_add', 
    	data : {pageTitle: req.app.locals.langs.nav_admin_addpost}
    });
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
    var summ = {
        _id: postId,
        title: req.body.title,
        summary: markedSummary(req.body.content),
        tags: tags,
        created: post.created,
        year: createdYear,
        date: createdDate
    }
    
    postModel.savePostData(post);
    postModel.savePostList(summ, 'add');
    postModel.savePostSumm(postId, summ);

    for(var i=0; i<tags.length; i++){
        tagModel.saveTagData(tags[i], summ, 'add');
    }
    tagModel.saveTagList(tags, 'add');

    res.redirect('/post/view/' + postId);
};

exports.update = function(req, res){
    var postData = postModel.readPostData(req.params.id);
    if (postData){
        global.sendResponse({
        	res : res,
        	view : 'post_update', 
        	data : {
        		post: postData, 
        		pageTitle: req.app.locals.langs.pagetitle_updatepost
        	}
        });
    }else{
        res.redirect('/404');
    }
};

exports.doUpdate = function(req, res){
    var id = req.params.id;
    var oldPost = postModel.readPostData(id);
    if (!oldPost){
        res.redirect('/404');
        return;
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
    var summ = {
        _id: id,
        title: req.body.title,
        summary: markedSummary(req.body.content),
        tags: tags,
        created: post.created,
        year: createdYear,
        date: createdDate
    }
    
    postModel.savePostData(post);
    postModel.savePostList(summ, 'update');
    postModel.savePostSumm(id, summ);
    
    var oldTags = oldPost.tags;
    var delTags = [];
    var newTags = [];
    for(var i=0; i<oldTags.length; i++){
        if (tags.indexOf(oldTags[i]) == -1){
            delTags.push(oldTags[i]);
            tagModel.saveTagData(oldTags[i], summ, 'remove');
        }
    }
    for (var i=0; i<tags.length; i++){
        if (oldTags.indexOf(tags[i]) == -1){
            newTags.push(tags[i]);
            tagModel.saveTagData(tags[i], summ, 'add');
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

exports.trash = function(req, res){
    var postList = [];

    var trashList = postModel.readTrashList();
    if (trashList){
        postList = trashList;
    }

    global.sendResponse({
    	res : res,
    	view : 'post_trash', 
    	data : {
    		postList: postList, 
    		pageTitle: req.app.locals.langs.pagetitle_trash
    	}
    });
};

exports.doTrash = function(req, res){
    var id = req.params.id;
    try{
        var summ = postModel.readPostSumm(id);
        var post = postModel.readPostData(id);
	    if (postModel.removePostData(id)){
            postModel.removePostSumm(id);
            postModel.updatePostIds(id, 'remove');

            for(var i=0; i<post.tags.length; i++){
	            var tag = post.tags[i];
	            tagModel.saveTagData(tag, post, 'remove');
            }
	        tagModel.saveTagList(post.tags, 'remove');

	        postModel.savePostList(summ, 'remove');
            postModel.saveTrashList(summ, 'add');
        }
    }catch(e){
        console.log('Remove post data file failed: ' + e);
    }
    
    res.redirect('/post/admin');
};

exports.remove = function(req, res){
    var id = req.params.id;
    try{
        var summ = postModel.readPostSumm(id, true);
        if (summ){
            postModel.removeSummTrash(id);
            postModel.removePostTrash(id);
            postModel.saveTrashList(summ, 'remove');
        }
    }catch(e){
        console.log('Remove post data failed: ' + e);
    }

    res.redirect('/post/trash');
};

exports.restore = function(req, res){
    var id = parseInt(req.params.id);
    try{
        var summ = postModel.readPostSumm(id, true);
        if (summ){
            postModel.savePostList(summ, 'restore');
            postModel.restorePostSumm(id);
            postModel.restorePostData(id);
            postModel.saveTrashList(summ);
            postModel.updatePostIds(id, 'add');

            var tags = summ.tags; 
            for(var i=0; i<tags.length; i++){
                tagModel.saveTagData(tags[i], summ, 'add');
            }
            tagModel.saveTagList(tags, 'add');
        }
    }catch(e){
        console.log('Restore post data failed: ' + e);
    }

    res.redirect('/post/admin');
};

function markedSummary(text, lineLimit){
	if (lineLimit == undefined || /^\d+$/.test(lineLimit)==false){
		var lineLimit = 10;
	}

    var symbols = {
        newline: /(\n)+/,
	    hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	    code: /^( {4}[^\n]+\n*)+/,
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
        table: /^ *\|(.*[^\|])+\|{1}(.*?)$/
    };

    text = text.replace(/\r\n|\r/g, '\n')
               .replace(/\t/g, '    ')
               .replace(/\u00a0/g, ' ')
               .replace(/\u2424/g, '\n')
               .replace(/^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/gm, '');
 
    var lines = text.split(symbols.newline);
   
    var summary = '';
    var deflines = '';
    var linecount = 0;
    var linebreak = 0;
    var intable = false;
    for(var i=0; i<lines.length; i++){
    	//if line breaks, only append but do not count line number
    	if (/^\n+$/.test(lines[i])){
    		if (linebreak == 0){
    			summary += '\n\n';
    		}
    		linebreak++;
    		continue;
    	}
    	
    	//ignore hr lines
        if (symbols.hr.test(lines[i])){
            continue;
        }
        
        //ignore codes
        if (symbols.code.test(lines[i])){
            continue;
        }
        
        //append def data separately
        if (symbols.def.test(lines[i])){
        	deflines += lines[i] + '\n';
            continue;
        }
        
        //if former line is table and current line also table, append, otherwise, continue
        if (linecount>lineLimit && (intable==false || symbols.table.test(lines[i])==false)){
        	intable = false;
        	continue;
        }
        
        //save table status
        if (linecount<=lineLimit && symbols.table.test(lines[i])){
        	intable = true;
        }
        
        //append current line and increase line count
        summary += lines[i];
        linebreak = 0;
        linecount++;
    }

    return marked(summary + '\n' + deflines);
}
