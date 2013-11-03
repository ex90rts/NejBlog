var fs = require('fs');

exports.view = function(req, res){
    var listDataFile = './data/postList.json';
    var postList = '';
    try{
        if (fs.existsSync(listDataFile)){
            postList = JSON.parse(fs.readFileSync(listDataFile, 'utf8')); 
        }
    }catch(e){
	console.log('Read post list data file failed: ' + e.toString());
	postList = '';
    }
    res.render('index', {pageTitle: 'Index', postList: postList});
};
