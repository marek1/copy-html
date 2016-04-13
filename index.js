var states = [
	{ id : 'BW' , name : 'Baden-Wuerttemberg'},
	{ id : 'BY' , name : 'Bayern'},
	{ id : 'BE' , name : 'Berlin'},
	{ id : 'BB' , name : 'Brandenburg'},
	{ id : 'HB' , name : 'Bremen'},
	{ id : 'HH' , name : 'Hamburg'},
	{ id : 'HE' , name : 'Hessen'},
	{ id : 'MV' , name : 'Mecklenburg-Vorpommern'},
	{ id : 'NI' , name : 'Niedersachsen'},
	{ id : 'NW' , name : 'Nordrhein-Westfalen'},
	{ id : 'RP' , name : 'Rheinland-Pfalz'},
	{ id : 'SL' , name : 'Saarland'},
	{ id : 'SN' , name : 'Sachsen'},
	{ id : 'ST' , name : 'Sachsen-Anhalt'},
	{ id : 'SH' , name : 'Schleswig-Holstein'},
	{ id : 'TH' , name : 'Thueringen'}
];
var findInState = function(_whichName) {
	console.log('_whichName : ',_whichName);
	var returnState = '';
	for (var i = 0; i < states.length; i++) {
		// for everything that has max 7 chars
		if (_whichName.toLowerCase().indexOf(states[i].name.toLowerCase())>-1){
			returnState=states[i].id;
		}
	}
	return returnState;
};
var types = [
	{ id: 'DU', name : 'Duathlon'},
	{ id: 'XD', name : 'Cross-Duathlon'},
	{ id: 'TR', name : 'Triathlon'},
	{ id: 'XT', name : 'Cross-Triathlon'},
	{ id: 'WT', name : 'Wintertriathlon'},
	{ id: 'PT', name : 'Paratriathlon'},
	{ id: 'AQ', name : 'Aquathlon (Swim&Run)'},
	{ id: 'BR', name : 'Bike&Run'},
	{ id: 'LF', name : 'Lauf'},
	{ id: 'XL', name : 'Cross-Lauf'},
	{ id: 'RR', name : 'Radrennen'},
	{ id: 'EZF', name : 'Einzelzeitfahren'},
	{ id: 'RTF', name : 'Radtourenfahrt'},
	{ id: 'XR', name : 'Cyclocross'},
	{ id: 'SC', name : 'Schwimmen'}
];
var findInType = function(_whichName){
	var returnType = 'TR';
	for (var i = 0; i < types.length; i++) {
		if (types[i].name.toLowerCase() === _whichName.toLowerCase()){
			returnType=types[i].id;
		}
	}
	return returnType;
};
var returnIsoDate = function(_whichDate) {
	var _date = _whichDate.replace(/ /g,'');
	var splitDate = _date.split('.');
	console.log(splitDate[2]+'-'+splitDate[1]+'-'+splitDate[0]);
	return new Date(splitDate[2],splitDate[1]-1,splitDate[0]);
};
var returnEmail = function(_email){
	return _email.replace(/aet/g,'@').replace(/at/g,'').replace('(','').replace(')','');
};
var writeFile = {
	href: 'href.json',
	temp: 'temp.json',
	fin : 'outcome.json'
};

var url = '';
// save all article hrefs
var hrefArray = [];
var hrefCounter = 0;
// save all events
var _events = [];
var _events1 = [];
// count number of updated objects
var counter = 0;

//DI
var http = require('http');
var https = require('https');
var Agent = require('socks5-http-client/lib/Agent');
var request = require('request');

var cheerio = require('cheerio');
var fs = require('fs');
var iconv  = require('iconv-lite');
var encoding = require("encoding");

/**
 * take final json to add image
 */
var getImg = function(_rawHtml, _index){

	// console.log('_rawHtml : ',_rawHtml);

	if (_rawHtml){

		var $ = cheerio.load(_rawHtml);

		// overwrite image only if not already has content
		if (_events[_index].image.length<1) {

			var imgs = $('img');

			if (imgs.length > 0) {
				var _imgUrl = imgs[0].attribs.src;
				console.log('_imgUrl : ',_imgUrl);
				if (_imgUrl) {
					if (_imgUrl.indexOf('http') > -1) {
						_events[_index].image = _imgUrl;
					} else {
						_events[_index].image = _events[_index].website + _imgUrl;
					}
				}
			}

		}

	}

	counter++;

	console.log(counter + ' / '+ _events.length);

	if (counter === _events.length-1) {
		// getMapData();
		writeToFile(writeFile.fin,_events);
	}



};


var makeUrl = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		_events[i].url = _events[i].name.toString().toLowerCase().replace(/\s/g, '-');
		writeToFile(writeFile.fin,_events[i]);
	}
};

var prettifyUrl = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		if (_events[i].url.indexOf('--') > -1 ){
			console.log('before : ',_events[i].url);
			_events[i].url = _events[i].url.substring(0, _events[i].url.indexOf('--')-1);
			console.log('after : ',_events[i].url);
		}
		_events[i].url = _events[i].url.replace(/\s/g, '-').replace(/'/g, '').replace('(','').replace(')','').replace('.','').replace('/','-').replace('---','-').replace('--','-');
		_events[i].url = replaceUmlaute(_events[i].url);
		writeToFile(writeFile.fin,_events[i]);
	}
};

var prettifyPlace = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		_events[i].place = _events[i].place.replace(/\s/g, '-').replace(/'/g, '').replace('(','').replace(')','').replace('.','').replace('/','-').replace('---','-').replace('--','-');
		_events[i].place = replaceUmlaute(_events[i].place);
		writeToFile(writeFile.fin,_events[i]);
	}
};
var prettifyImageUrl = function(){

	for (var i=0; i<_events.length; i++) { //_events.length

		if (_events[i].image.indexOf('.de') > -1 || _events[i].image.indexOf('.at') > -1 || _events[i].image.indexOf('.ch') > -1 || _events[i].image.indexOf('.nl') > -1 || _events[i].image.indexOf('.it') > -1 || _events[i].image.indexOf('.be') > -1 || _events[i].image.indexOf('.cz') > 0) {
			//get next char
			var _de = _events[i].image.charAt(_events[i].image.indexOf('.de')+3);
			if (_de !== '/' ){
				_events[i].image = _events[i].image.replace('.de', '.de/');
			}
			var _at = _events[i].image.charAt(_events[i].image.indexOf('.at')+3);
			if (_at !== '/' ){
				_events[i].image = _events[i].image.replace('.at', '.at/');
			}
			var _ch = _events[i].image.charAt(_events[i].image.indexOf('.ch')+3);
			if (_ch !== '/' ){
				_events[i].image = _events[i].image.replace('.ch', '.ch/');
			}
			var _nl = _events[i].image.charAt(_events[i].image.indexOf('.nl')+3);
			if (_nl !== '/' ){
				_events[i].image = _events[i].image.replace('.nl', '.nl/');
			}
			var _it = _events[i].image.charAt(_events[i].image.indexOf('.it')+3);
			if (_it !== '/' ){
				_events[i].image = _events[i].image.replace('.it', '.it/');
			}
			var _be = _events[i].image.charAt(_events[i].image.indexOf('.be')+3);
			if (_be !== '/' ){
				_events[i].image = _events[i].image.replace('.be', '.be/');
			}
			var _cz = _events[i].image.charAt(_events[i].image.indexOf('.cz')+3);
			if (_cz !== '/' ){
				_events[i].image = _events[i].image.replace('.cz', '.cz/');
			}

		}
		writeToFile(writeFile.fin,_events[i]);
	}
};
var checkIfPlaceExists = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		if (_events[i].place.length<1){
			console.log('no place for ',_events[i].name);
		}
	}
};
var checkIfPlaceIsBad = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		if (_events[i].place.indexOf('@')>-1){
			console.log('no place for ',_events[i].name);
		}
	}
};
var checkIfMapDataExists = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		if (typeof _events[i].lat === 'undefined'){
			console.log('no map data for ',_events[i].name);
		}
	}
};
var removeAllNoNames = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		if (_events[i].name.length>0){
			writeToFile(writeFile.fin,_events[i]);
		}
	}
};


var getEventDetail = function() {


	var hrefs = [];

	for (var i=0; i<hrefs.length; i++) { //_events.length

		getEventDetails(hrefs[i].href);

		hrefCounter++;

	}

};

var getDescription = function(_returnedJSON, _index){

	var _json = JSON.parse(_returnedJSON);

	console.log('_json : ',_json);

	var _desc = '';

	if (typeof _json.items !== 'undefined') {

		if (_json.items.length>0){

			for (var i = 0; i < _json.items.length; i++) {

				if (i>0){
					_desc += '\n\n';
				}
				_desc += _json.items[i].snippet;

			}

		}

	}

	_events[_index].description = _desc;

	counter++;

	console.log(counter + ' / '+ _events.length);

	if (counter === _events.length-1) {
		writeToFile(writeFile.fin,_events);
	}


};
var _iCounter = 0;
var goToGoogle = function() {
	console.log('_events : ',_events.length);
	for (var i=0; i<_events.length; i++) { //_events.length
		console.log(i);
		if (_events[i].description.length<1 && _iCounter < 1) {
			var query = _events[i].url.toString().replace(/-/g,'+')+'+strecke+2016';
			console.log('query : ',query);
			getJson('https://www.googleapis.com/customsearch/v1?key=AIzaSyCImlw7srUktwyVIXi4Xmxt-N6xmpNCBGI&cx=001406886050860568432:bpvx-xmuvz8&q='+query, getDescription, i);
			_iCounter++;
		} else {
			console.log('we already have a description');
			counter++;
			// writeToFile(writeFile.fin,_events[i]);
		}
	}
};

var goToWebsite = function(){

	// console.log('_json[0] : ',_json[0]);
	for (var i=0; i<_events.length; i++) { //_events.length
		console.log('get website : ',_events[i].website);
		if (_events[i].website.length>7) {
			getUrl(_events[i].website, getImg, i);
		} else {
			counter++;
			writeToFile(writeFile.fin,_events[i]);
		}
	}

};

/**
 * by calling openmaps
 * and mapping result to states (above)
 */

var getCountry = function(_rawData, _index){


	try
	{
		var mapData = JSON.parse(_rawData);

		// var display_name = mapData[0]['display_name'];

		_events[_index].state = findInState(mapData[0]['display_name']);

		_events[_index].lat = mapData[0]['lat'];

		_events[_index].lon = mapData[0]['lon'];
	}
	catch(e)
	{
		console.log('invalid json');
	}


	console.log(_index + ' : ' +_events[_index]);

	writeToFile(writeFile.fin,_events[_index]);

};


var getMapData = function() {

	for (var i=0; i<_events.length; i++) { //_events.length

		if (typeof _events[i].lat === 'undefined') {
			console.log(' no map data for : ', _events[i].name);
			var zip = '';
			if ( _events[i].zip.length > 0){
				zip = _events[i].zip;
			}
			var country = 'Deutschland';
			if ( _events[i].country === 'AT'){
				country = 'Oesterreich';
			}
			if ( _events[i].country === 'CH'){
				country = 'Schweiz';
			}
			if ( _events[i].country === 'NL'){
				country = 'Niederlande';
			}
			if ( _events[i].country === 'CZ'){
				country = 'Tschechische+Republik';
			}
			if ( _events[i].country === 'IT'){
				country = 'Italien';
			}
			if ( _events[i].country === 'BE'){
				country = 'Belgien';
			}
			getJson('http://nominatim.openstreetmap.org/search.php?q='+zip+'+'+_events[i].place +'+'+country+'&format=json&limit=1', getCountry, i);

		} else {
			writeToFile(writeFile.fin,_events[i]);
		}
	}

};

var filterLinks = function(){
	for (var i=0; i<_events.length; i++) { //_events.length
		// if (_events[i].href.indexOf('')>-1){
			writeToFile(writeFile.temp, _events[i]);
		// }
	}
};
var compare = function(){

	for (var i=0; i<_events.length; i++) { //_events.length
		var found = false;
		for (var j=0; j<_events1.length; j++) { //_events.length

			if (_events[i].name === _events[j].name){
				found = true;
				break;
			}
		}
		if (!!found) {
			console.log('this  : ',_events[i].name);
		}
	}

};
var compareWith = function() {
	openFile('outcome.json', compare, _events1);
};

var openFile = function(_fileName, callback, _saveAs) {
	fs.readFile(_fileName, function (err, data) {
		if (err) {
			return console.error(err);
		}
		if (typeof _saveAs === 'undefined') {

			_events = JSON.parse(data);

		} else {

			_saveAs = JSON.parse(data);
		}
		callback();
	});
};

/**
 * STEP 1
 * fill the object
 */
var filterHtml = function(_rawHtml){

	console.log('_rawHtml : ',_rawHtml);

	var finalObject = {
		"name": "",
		"url": "",
		"sport_type": "LF",
		"organiser": "",
		"contact_person": "",
		"date_from": "",
		"date_till": "",
		"address": "",
		"zip": "",
		"place": "",
		"country": "DE",
		"state": "",
		"website": "",
		"tel": "",
		"email": "",
		"image": "",
		"description": ""
	};

	// var filteredHtml = iconv.decode(_rawHtml, 'utf8');
	var $ = cheerio.load(_rawHtml);

	var eventDetails = $('#ausgabe1')[0];

	if (typeof eventDetails !== 'undefined') {

		$(eventDetails).each( function(index, element) {

			var _el = $(element).find('td');

			if (typeof _el !== 'undefined') {

				_el.each(function (_i, _e) {

					var _data = $(_e)[0].children[0];

					if (_i === 0){
						var _date = returnIsoDate(_data.data);
						finalObject.date_from = _date;
						finalObject.date_till = _date;
					}

					if (_i === 1){
						finalObject.name = _data.children[0].data;
						finalObject.url = _data.children[0].data.replace(/\s/g, '-');
					}

					if (_i === 2){
						finalObject.place = replaceUmlaute(_data.data);
						finalObject.name = finalObject.name + ' ' + finalObject.place;
						finalObject.url = replaceUmlaute(finalObject.name).toLowerCase();
					}

				});

			}

		});
	}

	// Event Details : Email + Website

	var addressDetails = $('#ausgabe2')[0];

	if (typeof addressDetails !== 'undefined') {

		$(addressDetails).each( function(index, element) {

			var _el = $(element).find('td');

			if (typeof _el !== 'undefined') {

				_el.each(function(_i,_e){

					var _data = $(_e)[0].children[0];

					if (_data.data.toString().toLowerCase().indexOf('email') > -1) {
						finalObject.email = returnEmail(_data.data.toString().toLowerCase().replace('email', '').replace(':', '').replace(/\s/g, ''));
					}
					if (_data.data.toString().toLowerCase().indexOf('homepage') > -1) {
						var _website = _data.next.attribs.href;
						finalObject.website = _website;
					}
				});

			}

		});


		console.log('finalObject : ',finalObject);

	}
	_events.push(finalObject);

	console.log(_events.length + ' / ' +hrefCounter);
	if (_events.length === hrefCounter){
		// get
		// get Image
		goToWebsite();
	}

	// console.log('_events.length : ',_events.length);
	//remove in a bit
	writeToFile(writeFile.temp, finalObject);

};

var removeFile = function(_fileName) {
	fs.exists(_fileName, function(exists) {
		if(exists) {
			//Show in green
			fs.unlink(_fileName);
		} else {
			console.log('Unable to delete');
		}
	});
};
var writeToFile = function(_writeFile, _content){
	/**
	 * write to file
	 */
	fs.appendFile(_writeFile, JSON.stringify(_content) + ',\n\n', function(err) {
		if(err) {
			return console.log(err);
		}
	});
};

var closeFile = function() {
	fs.appendFile(prodFolder + writeFile, '</body>', function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
};

var getEventDetails = function(_url){

	/**
	 * get article
	 */

	//console.log('_url : ',_url);

	getUrl(url+_url, filterHtml);

};


var getEvents = function(_html) {

	if (!_html){
		return;
	}
	/**
	 * get titles from index
	 */

	var $ = cheerio.load(_html);

	hrefArray = $('a');

	if (hrefArray.length<1){
		return false;
	}
	for (var i = 0; i < hrefArray.length; i++) {

		var a = hrefArray[i].attribs.href;

		console.log('a : ',a );

		if (a.indexOf('volkslauf')>-1) {

			writeToFile(writeFile.href, { href : a });

			getEventDetails(hrefArray[i].attribs.href);

			hrefCounter++;

		}

	}


};




var replaceUmlaute = function(_text) {

	var text = _text.toString();
	text = text.replace(/ö/g,'oe');
	text = text.replace(/Ö/g,'Oe');
	text = text.replace(/Ü/g,'ue');
	text = text.replace(/ü/g,'ue');
	text = text.replace(/ä/g,'ae');
	text = text.replace(/Ä/g,'Ae');
	text = text.replace(/ß/g,'ss');

	return text;
};

var getJson = function(_url, callback, _index, _encoding) {
	/**
	 * request url
	 */
	// Configure the request
	var _onReturn = function (res) {
		console.log('request');
		var finalStr = '';
		var _body = '';
		res.on('data', function (chunk) {
			// console.log('chunk!');
			if (typeof _encoding !== 'undefined'){
				finalStr += replaceUmlaute(iconv.decode(chunk, _encoding));
			} else {
				finalStr += chunk;
			}
		});
		res.on('end', function () {
			// console.log('loaded!');
			if (typeof _encoding !== 'undefined'){
				_body = replaceUmlaute(iconv.decode(finalStr, encoding));
			} else {
				_body = finalStr;
			}
			// console.log('_body : ',_body);
			if (typeof _index !== 'undefined') {
				callback(_body, _index);
			} else {
				callback(_body);
			}
		});
	};
	var req;
	if (_url.indexOf('https')>-1) {
		var req = https.get(_url, _onReturn);
	} else {
		var req = http.get(_url, _onReturn);
	}

	req.on('error', function (e) {
		console.log('Error accessing URL');
		if (typeof _index !== 'undefined') {
			callback(null, _index);
		} else {
			callback(null);
		}
	});
};

var getUrl = function(_url, callback, _index, _encoding) {
	var _body;
	request({
		url: _url,
		agentClass: Agent,
		agentOptions: {
			socksHost: 'localhost', // Defaults to 'localhost'.
			socksPort: 9050 // Defaults to 1080.
		},
		timeout : 100000
	}, function(err, res) {
		// console.log(err || res.body);
		if (!err){
			if (typeof _encoding !== 'undefined') {
				_body = replaceUmlaute(iconv.decode(res.body, encoding));
			} else {
				_body = replaceUmlaute(res.body);
			}
			// console.log('_body: ',_body);
			if (typeof _index !== 'undefined') {
				callback(_body, _index);
			} else {
				callback(_body);
			}
		} else {
			console.log('ERROR! : ',err);
			counter++;
			console.log(counter + ' / '+ _events.length);
			if (counter === _events.length-1) {
				writeToFile(writeFile.fin,_events);
			}
		}

	});

};

// get urls + create json

removeFile(writeFile.fin);
console.log('process.argv : ',process.argv[2]);

url = '';
console.log('url : ', url);
// getUrl(url + process.argv[2],getEvents);

// getEventDetails('');
// openFile('temp.json', checkIfMapDataExists);
// getEventDetail();
// getUrl('', getEventDetails);