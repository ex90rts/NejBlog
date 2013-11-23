var fs = require('fs');
var adminModel = require('../models/admin');
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

exports.data = function(req, res){
    res.render('admin_data');
};

exports.backup = function(req, res){
    var AdmZip = require('adm-zip');
    var zip = new AdmZip();
    zip.addLocalFolder('./data');
    var zipBuffer = zip.toBuffer();
    var date = new Date();
    var filename = 'blog-backup.' + date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2) + '.' +(Math.random()*1000 + '').substr(0, 3) + '.zip';
    var filePath = './temp/' + filename;
    zip.writeZip(filePath);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/zip');
    var filestream = fs.createReadStream(filePath);
    filestream.pipe(res);
    filestream.on('end', function(){
        fs.unlinkSync(filePath);
    });
};

exports.restore = function(req, res){
    var tempPath = req.files['filedata'].path;
    var date = new Date();
    var filename = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2) + '.' +(Math.random()*1000 + '').substr(0, 3) + '.zip';
    var filePath = './temp/blog-restore.' + filename;
    
    var is = fs.createReadStream(tempPath);
    var os = fs.createWriteStream(filePath);
    is.pipe(os);
    is.on('end', function(){
        fs.unlinkSync(tempPath);
    });

    res.render('admin_restore', {filePath: filePath});
};

exports.doRestore = function(req, res){
    var langs = req.app.locals.langs;
    var filePath = req.body.filePath;
    if (!fs.existsSync(filePath)){
        global.setMessage(req, langs.admindata_restorefilenotfound);
        res.redirect('/admin/data');
        return;
    }

    var AdmZip = require('adm-zip');
    var zip = new AdmZip(filePath);
    var zipValid = true;
    var zipEntries = zip.getEntries();
    zipEntries.forEach(function(zipEntry){
        if (zipEntry.entryName.substr(0, 5) != 'data/'){
            zipValid = false;
        }
    });

    if (!zipValid){
        global.setMessage(req, langs.admindata_restorezipnotvalid);
        res.redirect('/admin/data');
        return;
    }

    zip.extractAllTo('./', true);
    fs.unlinkSync(filePath);
    
    global.setMessage(req, langs.admindata_restore_succ);
    res.redirect('/admin/data');
};
