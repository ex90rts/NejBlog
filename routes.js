var controller = require('./controller');

exports.index = function(req, res){
    controller.index.view(req, res);
};

exports.about = function(req, res){
    controller.index.about(req, res);
};

exports.rss = function(req, res){
    controller.index.rss(req, res);
};

exports.post = {
    view: function(req, res){
        controller.post.view(req, res);
    },
    add: function(req, res){
        controller.post.add(req, res);
    },
    doAdd: function(req, res){
        controller.post.doAdd(req, res);
    },
    update: function(req, res){
        controller.post.update(req,res);
    },
    doUpdate: function(req, res){
        controller.post.doUpdate(req, res);
    },
    upload: function(req, res){
        controller.post.upload(req, res);
    },
    doUpload: function(req, res){
        controller.post.doUpload(req, res);
    },
    delete: function(req, res){
        controller.post.delete(req, res);
    },
    admin: function(req, res){
        controller.post.admin(req, res);
    }
};

exports.tag = {
    view: function(req, res){
        controller.tag.view(req, res);
    }
};

exports.user = {
    login: function(req, res){
        controller.user.login(req, res);
    },
    doLogin: function(req, res){
        controller.user.doLogin(req, res);
    },
    logout: function(req, res){
        controller.user.logout(req, res);
    },
    checkLogin: function(req, res, next){
        controller.user.checkLogin(req, res, next);
    },
    passwd: function(req, res){
        controller.user.passwd(req, res);
    },
    doPasswd: function(req, res){
        controller.user.doPasswd(req, res);
    }
};

exports.admin = {
    setting: function(req, res){
        controller.admin.setting(req, res);
    },
    doSetting: function(req, res){
        controller.admin.doSetting(req, res);
    }
};

exports.errors = {
    pageNotFound: function(req, res){
        res.render('404.jade');
    },
    userError: function(req, res){
        res.render('400.jade');
    },
    serverError: function(req, res){
        res.render('500.jade');
    }
};
