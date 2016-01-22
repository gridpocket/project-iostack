#!/usr/bin/env node

/*
	Meter csv data generator
	GridPocket confidential
	Author : Guillaume PILOT 

	Usage : 
	./meter_gen [number of meters [1-1 million user] [period_from] [period_to] [interval_minutes] [-temp] [-location]
 */

//Library
var moment = require('moment');
var fs = require('fs');
var locations = require('./locations.json');

//Variables
var MAX_RANDOM_INDEX = 1000;
var MAX_RANDOM_TEMP = 35;
var FILENAME = "./out/meter_gen-"+moment().format('YYYYMMDDHHmmss')+".csv";

//Args variables
var myArgs = process.argv.slice(2);

var NB_METERS = myArgs[0] || 10;
var FROM = myArgs[1] || '01/01/2016';
var TO = myArgs[2] || '01/01/2016';
var MINUTES_INTERVAL = myArgs[3] || 10;
var WANT_TEMP = myArgs[4];
var WANT_LOCATION = myArgs[5];

console.log(myArgs);
console.log('Generate', NB_METERS, 'meters data between', FROM, 'and', TO, 'with interval of', MINUTES_INTERVAL, 'minutes.');

//Generate meter informations with location and meterID
var meters = [];
for (var i = 1; i <= NB_METERS; i++) {
	var id = ('00000' + i).slice(-6);
	var meter = locations[i];
	meter.vid = 'METER'+id;
	meter.index = 0;
	meters.push(meter);
}

//Generate CSV file
for (var d = moment(FROM, 'DD/MM/YYYY'); d <= moment(TO, 'DD/MM/YYYY'); d.add(MINUTES_INTERVAL, 'minutes')) {
	for (var i = 0; i < meters.length; i++) {
		var meter = meters[i];
		meter.index += Math.floor((Math.random() * MAX_RANDOM_INDEX));

		var line = [];
		line.push(d.format());
		line.push(meter.index);
		line.push(meter.vid);
		if(WANT_TEMP) line.push(parseFloat((Math.random() * MAX_RANDOM_TEMP*100)/100).toFixed(2));
		if(WANT_LOCATION){
			line.push(meter.state);
			line.push(meter.latitude);
			line.push(meter.longitude);
		}
		fs.appendFileSync(FILENAME, line.join(',').toString() + "\n");
		//console.log(line);
	}
}