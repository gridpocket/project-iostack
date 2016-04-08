#!/usr/bin/env node

/*
  Meter csv data generator
  GridPocket Copyrights 2016, IOSTACK project www.iostack.eu
  Authors : Guillaume PILOT, Dien Hoa TRUONG GridPocket SAS

  Usage : 
  ./meter_gen [number of meters [1-1 million user] [period_from] [period_to] [interval_minutes] [-separateFile] [-temp] [-location]
 */

// Example Argument: ./meter_gen.js 3 '30/01/2015' '31/01/2015' 10 -separateFile

//Library
var moment = require('moment');
var fs = require('fs');
var locations = require('./locations.json');
var rand  =  require('randgen');

//Variables
var MAX_RANDOM_INDEX = 1000;
var MAX_RANDOM_TEMP = 35;
var OUTFOLDER = "./out/";
var FILENAME;

//Args variables
var myArgs = process.argv.slice(2);

var NB_METERS = myArgs[0] || 10;
var FROM = myArgs[1] || '01/01/2016';
var TO = myArgs[2] || '01/01/2016';
var MINUTES_INTERVAL = myArgs[3] || 10;

var WANT_SEPARATEFILE;// = myArgs[4];
var WANT_TEMP;// = myArgs[5];
var WANT_LOCATION;// = myArgs[6];

for (var i = 4; i < myArgs.length; i++) {
	if(myArgs[i]==="-separateFile") WANT_SEPARATEFILE=myArgs[i];
	if(myArgs[i]==="-temp") WANT_TEMP=myArgs[i];
	if(myArgs[i]==="-location") WANT_LOCATION=myArgs[i];
}

console.log(myArgs);
console.log('Generate', NB_METERS, 'meters data between', FROM, 'and', TO, 'with interval of', MINUTES_INTERVAL, 'minutes.');

//Generate meter informations with location and meterID
var meters = [];
for (var i = 1; i <= NB_METERS; i++) {
	var id = ('00000' + i).slice(-6);
	var meter = locations[Math.floor(Math.random() * (33178 - 0) + 0)];
	meter.vid = 'METER'+id;
	meter.conso = 0;
	meter.highcost = 0;
	meter.lowcost = 0;
	meters.push(meter);
}

// Create folder if want separate files
if(WANT_SEPARATEFILE){
	OUTFOLDER=OUTFOLDER+moment().format('YYYYMMDDHHmmss')+'/';
	fs.mkdirSync(OUTFOLDER);
}else{
	FILENAME = OUTFOLDER+"meter_gen-"+moment().format('YYYYMMDDHHmmss')+".csv";
}

//Generate CSV file
for (var d = moment(FROM, 'DD/MM/YYYY'); d <= moment(TO, 'DD/MM/YYYY'); d.add(MINUTES_INTERVAL, 'minutes')) {
	for (var i = 0; i < meters.length; i++) {
		var meter = meters[i];

		// Choose the Consumption depend on the situation
		if ((d.format('MM')<11)&&(d.format('MM')>03)) { // Hot season
			if ((d.format('dddd') != "Sunday")&&(d.format('dddd') != "Saturday")) { // Workind day
				if ( (d.format('HH:mm')<='06:00') && (d.format('HH:mm')>='00:00') )  meters[i].conso = rand.rnorm(200, 20)/(60/MINUTES_INTERVAL); // Consumption during MINUTES_INTERVAL
				if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'06:00') )  meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') )  meter.conso = rand.rnorm(200, 30)/(60/MINUTES_INTERVAL); 
				if ( d.format('HH:mm')>'17:00' )  meter.conso = rand.rnorm(800, 100)/(60/MINUTES_INTERVAL); 
			
			} else { // Weekend
				if ( (d.format('HH:mm')<='07:00') && (d.format('HH:mm')>='00:00') )  meters[i].conso = rand.rnorm(200, 20)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'07:00') )  meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') )  meter.conso = rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
				if ( d.format('HH:mm')>'17:00' )  meter.conso = rand.rnorm(900, 100)/(60/MINUTES_INTERVAL); 
			}
		} else { // Cold Season
			if ((d.format('dddd') != "Sunday")&&(d.format('dddd') != "Saturday")) { // Working day
				if ( (d.format('HH:mm')<='06:00') && (d.format('HH:mm')>='00:00') )  meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'06:00') )  meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') )  meter.conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL); 
				if ( d.format('HH:mm')>'17:00' )  meter.conso = rand.rnorm(1100, 100)/(60/MINUTES_INTERVAL); 
			
			} else { // Weekend
				if ( (d.format('HH:mm')<='07:00') && (d.format('HH:mm')>='00:00') )  meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'07:00') )  meter.conso= rand.rnorm(800, 80)/(60/MINUTES_INTERVAL); 
				if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') )  meter.conso = rand.rnorm(900, 80)/(60/MINUTES_INTERVAL); 
				if ( d.format('HH:mm')>'17:00' )  meter.conso = rand.rnorm(1100, 100)/(60/MINUTES_INTERVAL); 
			}
		}	

		// Calculate the Consumption in zone hight cost or low cost
		if ((d.format('HH:mm') <= '06:00')||(d.format('HH:mm')>= '22:00')){
		meter.highcost += meter.conso
		} else {
		meter.lowcost += meter.conso
		}

		var line = [];

		line.push(d.format('DD/MM/YYYY HH dddd'));
		line.push(meter.conso);
		line.push(0.001*meter.highcost); // convert to KWh
		line.push(0.001*meter.lowcost)
		line.push(meter.vid);

		if(WANT_TEMP) line.push(parseFloat((Math.random() * MAX_RANDOM_TEMP*100)/100).toFixed(2));
		if(WANT_LOCATION){
			line.push(meter.city);
			line.push(meter.state);
			line.push(meter.state_abbr);
			line.push(meter.latitude);
			line.push(meter.longitude);
		}
		if(WANT_SEPARATEFILE) FILENAME=OUTFOLDER+meter.vid+'.csv';
		fs.appendFileSync(FILENAME, line.join(',').toString() + "\n");
	}
  
}  

