exports.config = {
    env : 'development', //production
    port : 3000,
    encoding : 'utf8',
    siteinfo : {
	lang : 'zh_CN',
        name : "NejBlog by Samoay",
	desc : "A simple personal blog system powered by node.js and express framework",
        keywords : "blog,node.js,javascript,express,jade,html5",
	logo : '/images/logo.jpg',
	duoshuo : 'samoay',
        footer : 'Copyright © 2013 Created By <a href="/page/about.html">Samoay</a>, Theme Inspired By <a href="http://jser.me/">jser.me</a>',
    },
    salt : 'xew24igjs',
    admin : {
        cookie : 'token',
        username : 'admin',
        password : '123456' //Please remember to change this password!!!
    },
    aboutme : {
	'About Me' : '/about.html',
	'Github' : 'http://github.com/samoay',
	'Google Plus' : 'https://plus.google.com/116034800456010545162',
	'微博(@惊鸿一瞥V)' : 'http://weibo.com/samoay'
    },
    links : {
	'草依山的Javascript世界' : 'http://jser.me/'
    },
    foo : ''
};
