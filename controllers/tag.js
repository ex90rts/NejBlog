var global = require('../global');
var tagModel = require('../models/tag');

exports.view = function(req, res){
    var tag = decodeURIComponent(req.params.tag);
    var tagData = tagModel.readTagData(tag);
    if (!tagData){
	    res.redirect('/404');
    }

    global.sendResponse({
    	res : res,
    	view : 'tag_view', 
    	data : {
    		tag: tag, 
    		postList: tagData, 
    		pageTitle: tag
    	}
    });
}
    
