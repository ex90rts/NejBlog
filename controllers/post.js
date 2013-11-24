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
    res.render('post_view', {post: post, mdContent: mdContent, pageTitle: post.title});    
};

exports.admin = function(req, res){
    var page = req.params.page;
    if (page == undefined || /^\d+$/.test(page) == false){
        page = 1;
    }
    page = parseInt(page);
    if ( postModel.checkPostPage(page) == false ){
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
    res.render('post_admin', {postList: postList, pageTitle: req.app.locals.langs.nav_admin_myposts, olderPage: olderPage, newerPage: newerPage});
};

exports.add = function(req, res){
    res.render('post_add', {pageTitle: req.app.locals.langs.nav_admin_addpost});
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
        res.render('post_update', {post: postData, pageTitle: req.app.locals.langs.pagetitle_updatepost});
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

    res.render('post_trash', {postList: postList, pageTitle: req.app.locals.langs.pagetitle_trash});
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
