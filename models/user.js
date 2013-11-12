var fs = require('fs');
var config = require('../config').config;

function userDataFile(){
    return './data/user.json';
};

exports.readUserData = function(){
    var filePath = userDataFile();
    var user = config.user;

    if (fs.existsSync(filePath)){
        var _user = JSON.parse(fs.readFileSync(filePath));
        for(var k in _user){
            user[k] = _user[k];
        }
    }

    return user;
};

exports.saveUserData = function(user){
    var filePath = userDataFile();
    return fs.writeFileSync(filePath, JSON.stringify(user));
};
