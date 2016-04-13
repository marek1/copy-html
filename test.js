
//DI
var fs = require('fs');
var _events = [];

var checkForDoubles = function(){


    console.log('length : ',_events.length);

    var _haveDesc = 0;

    for (var i=0; i < _events.length; i++) {
    //
    //
    //     // console.log('name : ',_events[i].name, ' url : ',_events[i].url);

        if (_events[i].description.length>0){
            _haveDesc++;
        }

        for (var j=0; j < _events.length; j++) {

            if (_events[j].url === _events[i].url && i != j) {

                console.log('double url : for ',_events[i].name, ' ( ' + _events[i].url + ') ', _events[j].name , ' ( ' + _events[j].url + ') ');

            }

        }
    }

    // console.log('we have a description for '+_haveDesc);

};

var openFile = function(_fileName, callback) {
    fs.readFile(_fileName, function (err, data) {
        if (err) {
            return console.error(err);
        }
        console.log('data : ',typeof data);
        _events = JSON.parse(data);
        callback();
    });
};

openFile('data/all_laufs.json', checkForDoubles);