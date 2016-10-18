
var http = require('http');

var _url = 'http://google.com';
console.log('getting url : ', _url);
var req = http.get(_url, function(res){
    console.log('request');
    res.on('data', function(chunk){
        console.log('chunk! ', chunk);
    });
    res.on('end', function(data){
        console.log('loaded! ', data);
    });
});
req.on('error', function (e) {
    console.log('Error accessing URL');
});