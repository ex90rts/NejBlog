var fs = require('fs');
var marked = require('marked');
var global = require('../global');
var postModel = require('../models/post');
var tagModel = require('../models/tag');

exports.view = function(req, res){
    var id = req.params.id;
    var post = postModel.readPostData(id);
    if (!post){
        res.redirect(404, '/404');
        return;
    }

    var mdContent = marked(post.content);
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
        summary: markedSummary(req.body.content),
        tags: tags,
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
        summary: markedSummary(req.body.content),
        tags: tags,
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

exports.trash = function(req, res){
    var postList = [];

    var trashList = postModel.readTrashList();
    if (trashList){
        postList = trashList;
    }

    res.render('post_trash', {postList: postList});
};

exports.doTrash = function(req, res){
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
        console.log(e);
    }

    res.redirect('/post/trash');
};

exports.restore = function(req, res){
    var id = parseInt(req.params.id);
    try{
        var summ = postModel.readPostSumm(id, true);
        if (summ){
            postModel.savePostList(summ.year, summ, 'restore');
            postModel.restorePostSumm(id);
            postModel.restorePostData(id);
            postModel.saveTrashList(summ);
            postModel.updatePostId(id, 'add');

            var tags = summ.tags; 
            for(var i=0; i<tags.length; i++){
                tagModel.saveTagData(tags[i], summ, 'add');
            }
            tagModel.saveTagList(tags, 'add');
        }
    }catch(e){
        console.log(e);
    }

    res.redirect('/post/admin');
};

function markedSummary(marked, options){
    var _options = {
        words: 200,
        lines: 20,
        basehtml: true,
        linebreak: false,
        link: false,
        image: false
    };
    for(var k in options){
        _options[k] = options[k];
    }

    var symbols = {
        linebreak: /(\n)+/,
	    strong: /\*{2}(.*?)\*{2}/,
	    italic: /\*(.*?)\*/,
	    quote: /^ *>(.*?)/,
	    code: /^ {3,}(.*?)/,
        codeBlock: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/gm,
        ollist: /^\d\. /,
        ullist: /^[*|-] /,
        heading: /^#{1,6}(.*[^#])+#*$/,
        inLineLink: /\[(.*?)\]\((.*?)\)/g,
        endLink: /\[(.*?)\]\[\d+\]/g,
        inLineImage: /\!\[(.*?)\]\((.*?)\)/g,
        endImage: /\!\[(.*?)\]\[\d+\]/g,
        links: /^ *\[\d+\]: ?http(.*?)/,
        table: /^ *\|(.*[^\|])+\|{1}(.*?)$/
    };

    //remove code block
    marked = marked.replace(/\r\n|\r/g, '\n')
                   .replace(/\t/g, '    ')
                   .replace(/\u00a0/g, ' ')
                   .replace(/\u2424/g, '\n')
                   .replace(/\n{2,}/g, '\n')
                   .replace(symbols.codeBlock, '');
    
    var lines = marked.split(symbols.linebreak, _options.lines * 10);
    
    var summary = '';
    var linecount = 0;
    for(var i=0; i<lines.length; i++){
        if (linecount >= _options.lines || summary.length >= _options.words){
            break;
        }

        var text = lines[i];

        //ignore lines
        if (/^(\r?\n)+$/g.test(text)){
            continue;
        }
        if (symbols.code.test(text) && symbols.quote.test(text)==false){
            continue;
        }
        if (symbols.links.test(text)){
            continue;
        }
        if (symbols.table.test(text)){
            continue;
        }

        //remove spaces
        text = text.replace(/^\s*/g, "").replace(/\s*/g, "");

        //keep base html code if needed
        if (_options.basehtml){
            text = text.replace(symbols.strong, "<strong>$1</strong>");
            text = text.replace(symbols.italic, "<em>$1</em>");
            text = text.replace(symbols.heading, "<strong>$1: </strong>");
        }else{
            text = text.replace(symbols.strong, "$1");
            text = text.replace(symbols.italic, "$1");
            text = text.replace(symbols.heading, "$1: ");
        }
        if (_options.link){
            text = text.replace(symbols.inLineLink, "<a href='$2' target='_blank'>$1</a>");
        }
        if (_options.image){
            text = text.replace(symbols.inLineImage, "<img src='$2' alt='$1' />");
        }
        if (symbols.quote.test(text)){
            text = ' \"'+ text +'\" ';
        }

        //replace leftover symbols
        text = text.replace(/[\*#-]*/, '').replace(symbols.endImage, '').replace(symbols.endLink, ' $1 ');

        if (text == ''){
            continue;
        }

        //add line break
        if (_options.linebreak){
            text = text + '<br />';
        }else{
            text = text + ' ';
        }

        summary += text;

        linecount++;
    }

    return summary;
}
