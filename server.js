var http = require('http');
var express = require('express');
var fs = require('fs');
var path = require('path');
var config = require('./config').config;
var global = require('./global');
var routes = require('./routes');

var app = express();

app.set('port', config.port);
app.set('encoding', config.encoding);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('salt', config.salt);
app.set('admin cookie', config.admin.cookie);
app.set('admin username', config.admin.username);
app.set('admin password', config.admin.password);
app.configure('development', function(){
    app.locals.pretty = true;
    app.use(express.errorHandler());
});

app.use('/css', express.static(__dirname + '/public/css', { maxAge: 2592000000 }));
app.use('/images', express.static(__dirname + '/public/images', { maxAge: 2592000000 }));
app.use('/fonts', express.static(__dirname + '/public/fonts', { maxAge: 2592000000 }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser(app.get('salt')));
app.use(express.cookieSession());

app.engine('jade', require('jade').__express);

app.locals.siteinfo = config.siteinfo;

app.all('*', global.siteRelevant);
app.all('*', global.currentNav);
app.all('*', routes.user.checkLogin);

app.get('/', routes.index);
app.get('/index.html', routes.index);
app.get('/about(\.html)?', routes.about);
app.get('/404', routes.errors.pageNotFound);
app.get('/post/view/:id', routes.post.view);
app.get('/post/add', routes.post.add);
app.get('/post/update/:id', routes.post.update);
app.get('/post/delete/:id', routes.post.delete);
app.get('/tag/view/:tag', routes.tag.view);
app.get('/user/login', routes.user.login);
app.get('/user/logout', routes.user.logout);

app.post('/post/add', routes.post.doAdd);
app.post('/post/update/:id', routes.post.doUpdate);
app.post('/user/login', routes.user.doLogin);

var dataDirs = ['data', 'data/post', 'data/tag'];
for(var i=0; i<dataDirs.length; i++){
    if (!fs.existsSync(dataDirs[i])){
        fs.mkdirSync(dataDirs[i], 0755);
    }
}

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
