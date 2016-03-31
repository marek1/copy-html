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
	var returnState = 'TH';
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

var writeFile = {
	fin : 'outcome.json'
};

var url = '';
// save all article hrefs
var hrefArray = [];
// save all events
var _events = [];
// count number of updated objects
var counter = 0;

//DI
var http = require('http');
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

	counter++;

	if (counter === _events.length) {
		getMapData();
	}


};

var goToWebsite = function(){

	// console.log('_json[0] : ',_json[0]);
	for (var i=0; i<_events.length; i++) { //_events.length
		console.log('get website : ',_events[i].website);
		if (_events[i].website.length>0) {
			getUrl(_events[i].website, getImg, i);
		} else {
			counter++;
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



	writeToFile(writeFile.fin,_events[_index]);

};


var getMapData = function() {

	// console.log('_json[0] : ',_json[0]);
	for (var i=0; i<_events.length; i++) { //_events.length

		console.log(' _events[i].place : ', _events[i].place);
		getUrl('http://nominatim.openstreetmap.org/search.php?q='+ _events[i].place +'&format=json&limit=1', getCountry, i, 'iso-8859-1');

	}

};


var openFile = function(_fileName, callback) {
	fs.readFile(_fileName, function (err, data) {
		if (err) {
			return console.error(err);
		}
		callback(data.toString());
	});
};

/**
 * STEP 1
 * fill the object
 */
var filterHtml = function(_rawHtml){

	// console.log('_rawHtml : ',_rawHtml);

	var finalObject = {
		"name": "",
		"url": "",
		"sport_type": "TR",
		"organiser": "",
		"contact_person": "",
		"date_from": "",
		"date_till": "",
		"address": "",
		"zip": "",
		"place": "",
		"country": "DE",
		"state": "TH",
		"website": "",
		"tel": "",
		"email": "",
		"image": "",
		"description": ""
	};

	// var filteredHtml = iconv.decode(_rawHtml, 'utf8');
	var $ = cheerio.load(_rawHtml);

	var eventDetails = $('.ac_event_details');
	var eventInfo = $(eventDetails).find('.form-group > div');
	finalObject.name = eventInfo[0].children[0].data;
	finalObject.sport_type = findInType(eventInfo[2].children[0].data);
	finalObject.organiser = eventInfo[1].children[0].data;
	finalObject.website = eventInfo[3].children[1].attribs.href;
	finalObject.address = eventInfo[4].children[0].data;
	var place = eventInfo[5].children[0].data;
	finalObject.zip = place.split(' ')[0];
	finalObject.place = place.split(' ')[1];
	finalObject.contact_person = eventInfo[6].children[0].data;
	finalObject.tel = eventInfo[7].children[0].data;
	finalObject.email = eventInfo[8].children[0].data;
	finalObject.url = eventInfo[0].children[0].data.replace(/\s/g, '-').toLowerCase()+'-'+finalObject.place.replace(/\s/g, '-').toLowerCase();

	var competitionDetails = $('.ac_event_competition');
	var competitionInfo = $(competitionDetails).find('.form-group > div');
	var dates = competitionInfo[0].children[0].data;
	// console.log('dates : ',dates);
	finalObject.date_from = returnIsoDate(dates.split('-')[0]);
	finalObject.date_till = returnIsoDate(dates.split('-')[1]);

	_events.push(finalObject);

	if (_events.length === hrefArray.length){
		// get
		// get Image
		goToWebsite();
	}

	console.log('_events.length : ',_events.length);
	//remove in a bit
	//writeToFile(writeFile.one, finalObject);

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

	console.log('_url : ',_url);

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

	hrefArray = $('.acSporteventRow');

	if (hrefArray.length<1){
		return false;
	}
	for (var i = 0; i < hrefArray.length; i++) {

		var a = hrefArray[i].attribs.href;

		getEventDetails(hrefArray[i].attribs.href);

	}


};

var replaceUmlaute = function(_text) {

	var text = _text.toString();
	text = text.replace(/oe/g,'oe');
	text = text.replace(/Ö/g,'Oe');
	text = text.replace(/Ü/g,'ue');
	text = text.replace(/ü/g,'ue');
	text = text.replace(/ä/g,'ae');
	text = text.replace(/Ä/g,'Ae');
	text = text.replace(/ß/g,'ss');

	return text;
};

var getUrl = function(_url, callback, _index, _encoding) {
	var encoding = typeof _encoding !== 'undefined' ? _encoding : 'utf-8';
	console.log('encoding : ',encoding);
	/**
	 * request url
	 */
	// Configure the request
	var options = {
		url: _url,
		method: 'GET'
	};
	var req = http.get(_url, function(res){
		console.log('request');
		var finalStr='';
		res.on('data', function(chunk){
			// console.log('chunk!');
			finalStr += replaceUmlaute(iconv.decode(chunk, encoding));
			// callback(_body);
			// writeToFile(iconv.decode(chunk, 'iso-8859-1'));
		});
		res.on('end', function(){
			// console.log('loaded!');
			var _body = replaceUmlaute(iconv.decode(finalStr, encoding));
			console.log('_body : ',_body);
			if (typeof _index !== 'undefined') {
				callback(_body, _index);
			} else {
				callback(_body);
			}
		});
	});
	req.on('error', function (e) {
		console.log('Error accessing URL');
		if (typeof _index !== 'undefined') {
			callback(null, _index);
		} else {
			callback(null);
		}
	});

};

// get urls + create json

removeFile(writeFile.fin);
console.log('process.argv : ',process.argv[2]);
url = process.argv[2];
getUrl(process.argv[2]+ ' ' + process.argv[3] + '/?page='+process.argv[4],getEvents);

