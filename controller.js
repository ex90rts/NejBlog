var indexController = require('./controllers/index');
var userController = require('./controllers/user');
var postController = require('./controllers/post');
var tagController = require('./controllers/tag');
var adminController = require('./controllers/admin');

exports.index = indexController;
exports.user = userController;
exports.post = postController;
exports.tag = tagController;
exports.admin = adminController;
