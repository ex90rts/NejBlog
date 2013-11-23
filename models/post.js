var fs = require('fs');
var listMaxPost = 110;
var listCutPust = 10;
var dataFolderNum = 20;

function postIdsFile(){
    return './data/postIds.json';
}

function postMaxIdFile(){
    return './data/maxId.txt';
}

exports.savePostIds = function(){
    var postIds = [];
    var idsFile = postIdsFile();
    if (fs.existsSync(idsFile)){
        postIds = JSON.parse(fs.readFileSync(idsFile));
    }
    
    var maxId = 0;
    var maxIdFile = postMaxIdFile();
    if (fs.existsSync(maxIdFile)){
        maxId = parseInt(fs.readFileSync(maxIdFile));
    }
    
    var postId = maxId + 1;
    postIds.unshift(postId);
    
    maxId++;
    fs.writeFileSync(maxIdFile, maxId);
    fs.writeFileSync(idsFile, JSON.stringify(postIds));

    return postId;
};

exports.readPostIds = function(){
    var postIds = [];
    
    var idsFile = postIdsFile();
    if (fs.existsSync(idsFile)){
        var postIds = JSON.parse(fs.readFileSync(idsFile));
    }

    return postIds;
};

exports.updatePostIds = function(id, verb){
    var filePath = postIdsFile();
    if (fs.existsSync(filePath)){
        var postIds = JSON.parse(fs.readFileSync(filePath));
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

function postListFile(page){
    return './data/postList.'+ page +'.json';
}

function resetPostList(page, moveList){
    var listFile = postListFile(page);
    if(fs.existsSync(listFile)){
        var oldPostList = JSON.parse(fs.readFileSync(listFile));
        
        var listArray = oldPostList['list'];
        var listLength = listArray.length;
        var totalLength = listLength + moveList.length;
        
		if (totalLength > listMaxPost){
		    var nextMoveList = listArray.splice(listLength-listCutPost, listCutPost);
			var minId = listArray[listLength-1]['_id'];
			
			var newPostList = {
			    'minId' : minId,
			    'list' : moveList.concat(listArray)
			};
			fs.writeFileSync(listFile, JSON.stringify(newPostList));
			
			page++;
        	resetPostList(page, nextMoveList);
		}else{
			var newPostList = {
				'minId' : oldPostList.minId,
				'list' : moveList.concat(listArray)
			};
			fs.writeFileSync(listFile, JSON.stringify(newPostList));
		}
    }else{
        var minId = 0;
        if (moveList.length > 0){
            minId = moveList[moveList.length-1]['_id'];
        }
        var newPostList = {
        	'minId' : minId,
        	'list' : moveList
        };
        fs.writeFileSync(listFile, JSON.stringify(newPostList));
    }
}

exports.readPostList = function(page){
    var listFile = postListFile(page);
    var postList = [];
    if (fs.existsSync(listFile)){
        postList = JSON.parse(fs.readFileSync(listFile));
        if (postList){
            postList = postList['list'];
        }
    }
    
    return postList;
};

exports.savePostList = function(summ, verb){
    var fileIdx = 1;
    var listFile = postListFile(fileIdx), postList = {};
    while(fs.existsSync(listFile)){
        postList = JSON.parse(fs.readFileSync(listFile));
        if (summ._id > postList['minId']){
            break;
        }
        
        fileIdx++;
        listFile = postListFile(fileIdx);
    }
    
    //the start file is not exist
    if (!fs.existsSync(listFile)){
        postList['minId'] = summ._id;
    }

    var listArray = postList['list'];
	if (verb == 'add'){
		listArray.unshift(summ);
	}else if(verb == 'update'){
		for(var i=0; i<listArray.length; i++){
			if (listArray[i]['_id'] == summ._id){
				listArray[i] = summ;
			}
		}
	}else if(verb == 'restore'){
		var idx = 0;
		for(var i=0; i<listArray.length; i++){
			idx = i;
			if (summ._id > listArray[i]['_id']){
				break;
			}
			//if end to the last, need to plus 1
			if (i == listArray.length - 1){
				idx++;
			}
		}
		listArray.splice(idx, 0, summ);
	}else{
		var idx = -1;
		for(var i=0; i<listArray.length; i++){
			if (listArray[i]['_id'] == summ._id){
				idx = i;
			}
		}
		listArray.splice(idx, 1);
	}
	
	if (listArray.length > listMaxPost){
	    var moveList = listArray.splice(listArray.length-listCutPost, listCutPost);
	    resetPostList(2, moveList);
	}

	postList['list'] = listArray;
    fs.writeFileSync(listFile, JSON.stringify(postList));

    return true;
};

function summDataFile(id){
    var subDir = './data/post/' + (id % dataFolderNum);
    if (!fs.existsSync(subDir)){
        fs.mkdirSync(subDir, 0755);
    }
    return subDir + '/summ-' + id + '.json';
}

function summTrashFile(id){
    return './data/trash/summ-' + id + '.json';
}

exports.readPostSumm = function(id, trash){
    var dataFile = trash ? summTrashFile(id) : summDataFile(id);
    if (!fs.existsSync(dataFile)){
        return false;
    }

    try{
        return JSON.parse(fs.readFileSync(dataFile));
    }catch(e){
        console.log('Read post summary file failed: ' + e);
        return false;
    }
};

exports.savePostSumm = function(id, post){
    var dataFile = summDataFile(id);
    return fs.writeFileSync(dataFile, JSON.stringify(post));
};

exports.removePostSumm = function(id){
    var dataFile = summDataFile(id);
    if (fs.existsSync(dataFile)){
        var trashFile = summTrashFile(id);
        fs.renameSync(dataFile, trashFile);
    }
    return true;
};

exports.restorePostSumm = function(id){
    var trashFile = summTrashFile(id);
    if (fs.existsSync(trashFile)){
        var dataFile = summDataFile(id);
        fs.renameSync(trashFile, dataFile);
    }
    return true;
}

exports.removeSummTrash = function(id){
    var trashFile = summTrashFile(id);
    if (fs.existsSync(trashFile)){
        fs.unlinkSync(trashFile);
    }
    return true;
};

function postDataFile(id){
    var subDir = './data/post/' + (id % dataFolderNum);
    if (!fs.existsSync(subDir)){
        fs.mkdirSync(subDir, 0755);
    }
    return subDir + '/post-' + id + '.json';
}

function postTrashFile(id){
    return './data/trash/post-' + id + '.json';
}

exports.readPostData = function(id){
    var dataFile = postDataFile(id);
    if (!fs.existsSync(dataFile)){
        return false;
    }

    try{
        return JSON.parse(fs.readFileSync(dataFile));
    }catch(e){
        console.log('Read post data file failed: ' + e);
        return false;
    }
};

exports.savePostData = function(post){
    var dataFile = postDataFile(post._id);
    return fs.writeFileSync(dataFile, JSON.stringify(post));
};

exports.removePostData = function(id){
    var dataFile = postDataFile(id);
    if (fs.existsSync(dataFile)){
        var trashFile = postTrashFile(id);
        fs.renameSync(dataFile, trashFile);
    }
    return true;
};

exports.restorePostData = function(id){
    var trashFile = postTrashFile(id);
    if (fs.existsSync(trashFile)){
        var dataFile = postDataFile(id);
        fs.renameSync(trashFile, dataFile);
    }
    return true;
};

exports.removePostTrash = function(id){
    var trashFile = postTrashFile(id);
    if (fs.existsSync(trashFile)){
        fs.unlinkSync(trashFile);
    }
    return true;
};

function trashListFile(){
    return './data/postTrash.json';
}

exports.readTrashList = function(){
    var listFile = trashListFile();
    if (!fs.existsSync(listFile)){
        return false;
    }

    try{
        return JSON.parse(fs.readFileSync(listFile));
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

    var listFile = trashListFile();
    return fs.writeFileSync(listFile, JSON.stringify(trashList));
};
