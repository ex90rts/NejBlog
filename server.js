var VERSION = '0.1.0';

var http = require('http');
var express = require('express');
var fs = require('fs');
var path = require('path');
var config = require('./config').config;
var global = require('./global');
var routes = require('./routes');
var adminModel = require('./models/admin');

var app = express();

app.set('port', config.port);
app.set('encoding', config.encoding);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('salt', config.salt);
app.set('admin cookie', config.user.cookie);
app.set('admin username', config.user.username);
app.set('admin password', config.user.password);
app.configure('development', function(){
    app.locals.pretty = true;
    app.use(express.errorHandler());
});

app.use('/css', express.static(__dirname + '/public/css', { maxAge: 2592000000 }));
app.use('/js', express.static(__dirname + '/public/js', { maxAge: 2592000000 }));
app.use('/images', express.static(__dirname + '/public/images', { maxAge: 2592000000 }));
app.use('/upload', express.static(__dirname + '/public/upload', { maxAge: 2592000000 }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser(app.get('salt')));
app.use(express.cookieSession());

app.engine('jade', require('jade').__express);

app.locals.siteinfo = config.siteinfo;

var settings = adminModel.readSetting();
var langs = require('./langs/en_US');
if (settings.siteinfo.lang != 'en_US'){
    if (fs.existsSync('./langs/' + settings.siteinfo.lang + '.js')){
        langs = require('./langs/' + settings.siteinfo.lang);
    }
}
app.locals.langs = langs.content;

app.all('*', global.siteRelevant);
app.all('*', global.currentNav);
app.all('*', routes.user.checkLogin);

app.get('/', routes.index);
app.get('/index', routes.index);
app.get('/about', routes.about);
app.get('/rss', routes.rss);
app.get('/404', routes.errors.pageNotFound);
app.get('/post/view/:id', routes.post.view);
app.get('/post/add', routes.post.add);
app.get('/post/admin', routes.post.admin);
app.get('/post/update/:id', routes.post.update);
app.get('/post/trash', routes.post.trash);
app.get('/post/trash/:id', routes.post.doTrash);
app.get('/post/remove/:id', routes.post.remove);
app.get('/post/upload', routes.post.upload);
app.get('/tag/view/:tag', routes.tag.view);
app.get('/user/login', routes.user.login);
app.get('/user/logout', routes.user.logout);
app.get('/user/passwd', routes.user.passwd);
app.get('/admin/setting', routes.admin.setting);

app.post('/post/add', routes.post.doAdd);
app.post('/post/update/:id', routes.post.doUpdate);
app.post('/post/upload', routes.post.doUpload);
app.post('/user/login', routes.user.doLogin);
app.post('/user/passwd', routes.user.doPasswd);
app.post('/admin/setting', routes.admin.doSetting);

var dataDirs = ['data', 'data/post', 'data/tag', 'data/trash', 'public/upload'];
for(var i=0; i<dataDirs.length; i++){
    if (!fs.existsSync(dataDirs[i])){
        fs.mkdirSync(dataDirs[i], 0755);
    }
}

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
