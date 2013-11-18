var fs = require('fs');
var config = require('../config').config;

function settingFile(){
    return './data/setting.json';
}

exports.readSetting = function(){
    var filePath = settingFile();
    var setting = {
        siteinfo : config.siteinfo,
        links : config.links,
        webinfo: config.webinfo,
        comments: config.comments
    };
    
    if (fs.existsSync(filePath)){
        var _setting = JSON.parse(fs.readFileSync(filePath));
        if (_setting.siteinfo){
            for(var k in _setting.siteinfo){
                setting.siteinfo[k] = _setting.siteinfo[k];
            }
        }
        if (_setting.links){
            for(var k in _setting.links){
                setting.links[k] = _setting.links[k];
            }
        }
        if (_setting.webinfo){
            for(var k in _setting.webinfo){
                setting.webinfo[k] = _setting.webinfo[k];
            }
        }
    }

    return setting;
};

exports.saveSetting = function(setting){
    var filePath = settingFile();
    return fs.writeFileSync(filePath, JSON.stringify(setting));
};

function aboutmeFile(){
    return './data/aboutme.txt';
};

exports.readAboutme = function(){
    var filePath = aboutmeFile();
    var aboutme = '';
    if (fs.existsSync(filePath)){
        aboutme = fs.readFileSync(filePath, 'utf-8');
    }

    return aboutme;
};

exports.saveAboutme = function(aboutme){
    var filePath = aboutmeFile();
    return fs.writeFileSync(filePath, aboutme);
};
