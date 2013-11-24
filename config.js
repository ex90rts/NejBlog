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
        comment_service: "",
        comment_id : "",
        gaid : "",
        footer : 'Copyright © 2013 Powered By <a href="http://nejblog.samoay.me" target="_blank">NejBlog</a>, <a href="https://github.com/samoay/NejBlog" target="_blank">Fork me on Github</a>',
    },
    comments : {
        'duoshuo' : 'duoshuo.com',
        'disqus' : 'disqus.com',
        'livefyre' : 'livefyre.com'
    },
    salt : 'xew24igjs',
    user : {
        cookie : 'token',
        username : 'admin',
        password : 'e10adc3949ba59abbe56e057f20f883e' //Current is 123456, please remember to change this password!!!
    },
    webinfo : {},
    links : {},
    foo : ''
};
