var Agent = require('socks5-http-client/lib/Agent');
var request = require('request');

request({
    url: '',
    agentClass: Agent,
    agentOptions: {
        socksHost: 'localhost', // Defaults to 'localhost'.
        socksPort: 9050 // Defaults to 1080.
    }
}, function(err, res) {
    console.log(err || res.body);
});