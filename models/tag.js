var fs = require('fs');

exports.parseTags = function(tags){
    return tags.toString().replace(/ +/g, '').replace(/[;| |，|；]/g, ',').split(',');
};

function tagDataFile(tag){
    return './data/tag/tag-' + encodeURIComponent(tag) + '.json';
}

exports.readTagData = function(tag){
    var dataFile = tagDataFile(tag);
    var tagData = [];
    if (fs.existsSync(dataFile)){
	try{
	    tagData = JSON.parse(fs.readFileSync(dataFile));
	}catch(e){}
    }
    return tagData;
};

exports.saveTagData = function(tag, post, verb){
    var dataFile = tagDataFile(tag);
    var tagData = this.readTagData(tag);
    if (verb == 'add'){
        tagData.unshift(post);
    }else{
        var idx = -1;
	for(var i=0; i<tagData.length; i++){
            if (tagData[i]._id == post._id){
		idx = i;
	    }
	}
	if (idx > -1){
            tagData.splice(idx, 1);
	}
    }
    if (tagData.length > 0){
        return fs.writeFileSync(dataFile, JSON.stringify(tagData));
    }else{
	return fs.unlinkSync(dataFile);
    }
};

function tagListFile(){
    return './data/taglist.json';
}

exports.readTagList = function(){
    var listFile = tagListFile();
    var tagList = {};
    if (fs.existsSync(listFile)){
	try{
            tagList = JSON.parse(fs.readFileSync(listFile));
	}catch(e){}
    }
    return tagList;
};

exports.saveTagList = function(tags, verb){
    var listFile = tagListFile();
    var tagList = this.readTagList();
    var amount = verb=='add' ? 1 : -1;
    for(var i=0; i<tags.length; i++){
	var tag = tags[i];
        if (tagList[tag]){
	    tagList[tag] = tagList[tag] + amount;
        }else{
	    tagList[tag] = amount;
        }
        if (tagList[tag] <= 0){
	    delete tagList[tag];
        }
    }
    return fs.writeFileSync(listFile, JSON.stringify(tagList));
};
