exports.config = {
    env : 'development', //production
    port : 3000,
    encoding : 'utf8',
    siteinfo : {
	lang : 'zh_CN',
        name : "NejBlog by Samoay",
	desc : "A simple personal blog system powered by node.js and express framework",
        keywords : "blog,node.js,javascript,express,jade,html5",
        footer : 'Copyright © 2013 Created By <a href="/page/about.html">Samoay</a>, Theme Inspired By <a href="http://jser.me/">jser.me</a>',
    },
    salt : 'xew24igjs',
    admin : {
        cookie : 'token',
        username : 'admin',
        password : '123456' //Please remember to change this password!!!
    },
    foo : ''
};
