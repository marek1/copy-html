
//DI
var fs = require('fs');
var _events = [];

var checkForDoubles = function(){


    for (var i=0; i < _events.length; i++) {


        // console.log('name : ',_events[i].name, ' url : ',_events[i].url);


        for (var j=0; j < _events.length; j++) {

            if (_events[j].url === _events[i].url && i != j) {

                console.log('double url : for ',_events[i].name, ' ( ' + _events[i].url + ') ', _events[j].name , ' ( ' + _events[j].url + ') ');

            }

        }
    }

};

var openFile = function(_fileName, callback) {
    fs.readFile(_fileName, function (err, data) {
        if (err) {
            return console.error(err);
        }
        _events = JSON.parse(data);
        callback();
    });
};

openFile('all_laufs.json', checkForDoubles);