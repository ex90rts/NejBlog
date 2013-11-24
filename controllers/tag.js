var tagModel = require('../models/tag');

exports.view = function(req, res){
    var tag = decodeURIComponent(req.params.tag);
    var tagData = tagModel.readTagData(tag);
    if (!tagData){
	    res.redirect('/404');
    }

    res.render('tag_view', {tag: tag, postList: tagData, pageTitle: tag});
}
    
