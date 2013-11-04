var fs = require('fs');

function postIdsFile(){
    return './data/postIds.json';
}

exports.savePostIds = function(){
    var filePath = postIdsFile();
    var postId = 1;
    if (fs.existsSync(filePath)){
        var postIds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	postId = parseInt(postIds[0])+1;
        postIds.unshift(postId);
    }else{
        var postIds = new Array();
	postIds[0] = postId;
    }
    fs.writeFileSync(filePath, JSON.stringify(postIds)); 

    return postId;
};

function postListFile(){
    return './data/postList.json';
}

exports.readPostList = function(){
    var filePath = postListFile();
    var postList = {};
    if (fs.existsSync(filePath)){
        postList = JSON.parse(fs.readFileSync(filePath));
    }
    return postList;
};

exports.savePostList = function(createdYear, listItem, verb){
    var filePath = postListFile();
    var postList = this.readPostList();
    if (postList[createdYear]){
	var yearSublist = postList[createdYear];
    	if (verb == 'add'){
            yearSublist.unshift(listItem);
	    postList[createdYear] = yearSublist;
        }else{
            var idx = -1;
            for(var i=0; i<yearSublist.length; i++){
		if (yearSublist[i]['_id'] == listItem._id){
		    idx = i;
		}
	    }
            yearSublist.splice(idx, 1);
	    if (yearSublist.length <= 0){
                delete postList[createdYear];
            }else{
                postList[createdYear] = yearSublist;
            }
	}
    }else if(verb == 'add'){
        postList[createdYear] = [listItem];
    }

    return fs.writeFileSync(filePath, JSON.stringify(postList));
};

function postDataFile(id){
    return './data/post/post-' + id + '.json';
}

exports.readPostData = function(id, encoding){
    var filePath = postDataFile(id);
    if (!fs.existsSync(filePath)){
        return false;
    }

    try{
        return JSON.parse(fs.readFileSync(filePath, encoding));
    }catch(e){
	console.log('Read post data file failed: ' + e);
	return false;
    }
};

exports.savePostData = function(post){
    var filePath = postDataFile(post._id);
    return fs.writeFileSync(filePath, JSON.stringify(post));
};

exports.removePostData = function(id){
    var filePath = postDataFile(id);
    if (fs.existsSync(filePath)){
	fs.unlinkSync(filePath);
    }
    return true;
};
