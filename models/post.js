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

exports.readPostIds = function(){
    var postIds = [];
    
    var filePath = postIdsFile();
    if (fs.existsSync(filePath)){
        var postIds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    return postIds;
};

exports.updatePostId = function(id, verb){
    var filePath = postIdsFile();
    if (fs.existsSync(filePath)){
        var postIds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (verb == 'add'){
            postIds.push(id);
        }else{
            var idx = -1;
            for(var i=0; i<postIds.length; i++){
                if (postIds[i] == id){
                    idx = i;
                }
            }
            if (idx >= 0){
                postIds.splice(idx, 1);
            }
        }
        postIds.sort().reverse();
        fs.writeFileSync(filePath, JSON.stringify(postIds));
    }

    return true;
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
        }else if(verb == 'update'){
            for(var i=0; i<yearSublist.length; i++){
                if (yearSublist[i]['_id'] == listItem._id){
                    yearSublist[i] = listItem;
                }
            }
        }else if(verb == 'restore'){
            var idx = 0;
            for(var i=0; i<yearSublist.length; i++){
                idx = i;
                if (listItem._id > yearSublist[i]['_id']){
                    break;
                }
                //if end to the last, need to plus 1
                if (i == yearSublist.length - 1){
                    idx++;
                }
            }
            yearSublist.splice(idx, 0, listItem);
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
    }else{
        if(verb == 'add' || verb == 'restore'){
            postList[createdYear] = [listItem];
        }
    }

    return fs.writeFileSync(filePath, JSON.stringify(postList));
};

function summDataFile(id){
    return './data/post/summ-' + id + '.json';
}

function summTrashFile(id){
    return './data/trash/summ-' + id + '.json';
}

exports.readPostSumm = function(id, trash){
    var filePath = trash ? summTrashFile(id) : summDataFile(id);
    if (!fs.existsSync(filePath)){
        return false;
    }

    try{
        return JSON.parse(fs.readFileSync(filePath));
    }catch(e){
        console.log('Read post summary file failed: ' + e);
        return false;
    }
};

exports.savePostSumm = function(id, post){
    var filePath = summDataFile(id);
    return fs.writeFileSync(filePath, JSON.stringify(post));
};

exports.removePostSumm = function(id){
    var filePath = summDataFile(id);
    if (fs.existsSync(filePath)){
        var trashPath = summTrashFile(id);
        fs.renameSync(filePath, trashPath);
    }
    return true;
};

exports.restorePostSumm = function(id){
    var trashPath = summTrashFile(id);
    if (fs.existsSync(trashPath)){
        var filePath = summDataFile(id);
        fs.renameSync(trashPath, filePath);
    }
    return true;
}

exports.removeSummTrash = function(id){
    var filePath = summTrashFile(id);
    if (fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
    }
    return true;
};

function postDataFile(id){
    return './data/post/post-' + id + '.json';
}

function postTrashFile(id){
    return './data/trash/post-' + id + '.json';
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
        var trashPath = postTrashFile(id);
        fs.renameSync(filePath, trashPath);
    }
    return true;
};

exports.restorePostData = function(id){
    var trashPath = postTrashFile(id);
    if (fs.existsSync(trashPath)){
        var filePath = postDataFile(id);
        fs.renameSync(trashPath, filePath);
    }
    return true;
};

exports.removePostTrash = function(id){
    var filePath = postTrashFile(id);
    if (fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
    }
    return true;
};

function trashListFile(){
    return './data/postTrash.json';
}

exports.readTrashList = function(){
    var filePath = trashListFile();
    if (!fs.existsSync(filePath)){
        return false;
    }

    try{
        return JSON.parse(fs.readFileSync(filePath));
    }catch(e){
        return false;
    }
};

exports.saveTrashList = function(post, verb){
    var trashList = this.readTrashList();
    if (!trashList){
        trashList = [];
    }

    if (verb == 'add'){
        trashList.unshift(post);
    }else{
        var idx = -1;
        for(var i=0; i<trashList.length; i++){
            if (trashList[i]['_id'] == post._id){
                idx = i;
            }
        }
        if (idx >= 0){
            trashList.splice(idx, 1);
        }
    }

    var filePath = trashListFile();
    return fs.writeFileSync(filePath, JSON.stringify(trashList));
};
