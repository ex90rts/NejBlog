var http = require('http');
var express = require('express');
var fs = require('fs');
var path = require('path');
var routes = require('./routes');
var global = require('./global');

var app = express();

app.set('port', 3000);
app.set('encoding', 'utf8');
app.set('title', 'NX Blog');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('salt', '2dtwy02t');
app.set('admin cookie', 'token');
app.set('admin username', 'samoay');
app.set('admin password', '123456');
app.configure('development', function(){
    app.locals.pretty = true;
    app.set('title', 'NX Blog Dev');
    app.use(express.errorHandler());
});

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser(app.get('salt')));
app.use(express.cookieSession());

app.engine('jade', require('jade').__express);

app.all('*', global.siteRelevant);
app.all('*', global.currentNav);
app.all('/*/add', routes.user.checkLogin);
app.all('/*/update/*', routes.user.checkLogin);
app.all('/*/delete/*', routes.user.checkLogin);

app.get('/', routes.index);
app.get('/index.html', routes.index);
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
