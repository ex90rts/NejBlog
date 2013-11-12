var adminModel = require('../models/admin');
var markdown = require('markdown').markdown;
var global = require('../global');

exports.setting = function(req, res){
    var setting = adminModel.readSetting();
    var aboutme = adminModel.readAboutme();
   
    var linksText = '';
    for(var k in setting.links){
        linksText += k + '|' + setting.links[k] + '\r\n';
    }

    var webinfoText = '';
    for(var k in setting.webinfo){
        webinfoText += k + '|' + setting.webinfo[k] + '\r\n';
    }

    res.render('admin_setting', {
        setting: setting, 
        aboutme: aboutme,
        linksText: linksText,
        webinfoText: webinfoText
    });
};

exports.doSetting = function(req, res){
    var links = {};
    var lines = req.body.links.split(/[\r\n]+/);
    for(var i=0; i<lines.length; i++){
        var rows = lines[i].split('|');
        if (rows.length == 2){
            links[rows[0]] = rows[1];
        }
    }
    
    var webinfo = {};
    var lines = req.body.webinfo.split(/[\r\n]+/);
    for(var i=0; i<lines.length; i++){
        var rows = lines[i].split('|');
        if (rows.length == 2){
            webinfo[rows[0]] = rows[1];
        }
    }

    var siteinfo = req.body.siteinfo;
    if (req.files.logofile && req.files.logofile.size > 0){
        siteinfo.logo = req.headers.origin + global.uploadFile(req.files, 'logofile');
    }

    var setting = {
        siteinfo: siteinfo,
        links: links,
        webinfo: webinfo
    };

    adminModel.saveSetting(setting);

    if (req.body.aboutme.length > 0){
        adminModel.saveAboutme(req.body.aboutme);
    }

    res.redirect('/about');
};
