### NejBlog

NejBlog is a simple personal blog system which powered by node.js, express framework and jade template engine. The name "Nej" comes from the first letter of each three main basic technical parts.

#### Directories and files

| Name           | Description                                                                    |
|------------    | ------------------------------------------------------------------------------ | 
| /controllers   | the C part of MVC, all logic code suppose to be here                           |
| /data          | the static data folder for blog data                                           |
| /models        | the M part of MVC, for saving json data to file system                         |
| /node_modules  | npm modules                                                                    |
| /public        | public website resources such as css, images, static html files                |
| /views jade    | the V part of MVC, jade template file folder                                   |
| /README.md     | this file                                                                      |
| /controller.js | the gate of all controllers                                                    |
| /global.js     | global environment functions of this project                                   |
| /package.json  | npm packages configuration file                                                |
| /routes.js     | site request routes                                                            |
| /server.js     | server script, include basic configuration                                     |

#### Install

Simply clone this repo to your webroot and start the node server:

    $ git clone git@github.com:samoay/NejBlog.git
    $ cd NejBlog
    $ node server.js &

As the default configuration, you can visit your blog via http://127.0.0.1:3000 now !!! 
    
#### Config your blog

The default site configuration is in the file called config.js under the project root directory. Remember to edit this file to personize your own blog, the content as following:

```javascript
exports.config = {
	env : 'development', //production
	port : 3000, //the listenning port number, default is 3000
	encoding : 'utf8', //data file encoding
	siteinfo : {
		lang : 'zh_CN', //your site language which will out put in views/layout.jade
		name : "NejBlog by Samoay", //your site name which will appear at the header section on the top of your site
		desc : "A simple personal blog system powered by node.js and express framework", //your simple site description which will apper under your site name as a sub-title
		keywords : "blog,node.js,javascript,express,jade,html5", //for your site meta keywords
		footer : 'Copyright © 2013 Created By <a href="/page/about.html">Samoay</a>, Theme Inspired By <a href="http://jser.me/">jser.me</a>', //appears at the bottom of your site
	},
	salt : 'xew24igjs', //keep your cookie content safe
	admin : {
		cookie : 'token', //no need to change at this moment
		username : 'admin', //administrator's user name
		password : '123456' //administrator's password, please remember to change this password!!!
	},
	foo : ''
};
```

