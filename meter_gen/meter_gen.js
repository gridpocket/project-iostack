#!/usr/bin/env node

/**
 * 		Meter csv data generator
 * 
 * GridPocket Copyrights 2016
 * IOSTACK project www.iostack.eu
 * 
 * @Authors : Guillaume PILOT, Dien Hoa TRUONG, Kevin FOUHETY, César CARLES, Nathaël Noguès 
 * 		GridPocket SAS
 *
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-04-20
 *
 * Usage : 
 * 	node meter_gen [meters number (1 to 1M)] [date begin 'yyyy/mm/dd'] [date end 'yyyy/mm/dd'] [data interval (in minutes)] [data type ('gaz, 'electric' or 'mixed')] (-separateFiles) (-temp) (-location) (-out [ouptutFilePath (folder for '-separateFiles')])
 * 
 * Example usage: 
 * 	node meter_gen.js 10 '2016/01/01' '2016/12/31' 60 electric -separateFiles -location
**/

/*jshint esversion: 6 */


//
// Libraries and external files
var async = require("async");
var moment = require('moment');
var fs = require('fs');
var rand = require('randgen');
// Libraries and external files
// 

// Speed-up meter_gen, using more memory to save time
var openFiles = [];


//
// Defining constants
const MAX_RANDOM_INDEX = 1000;
const MAX_RANDOM_TEMP = 35;
const TOTAL_DENSITY = 486;
const TOTAL_POPULATION = 64886015;
// Defining constants
//

//
// Defining parameters variables
var NB_METERS;
var FROM;
var TO;
var MINUTES_INTERVAL;
var TYPE;
var wantSeparateFile = false;
var wantTemperature = false;
var wantLocation = false;
var filePath = './out/'+moment().format('YYYYMMDDHHmmss')+'/';
// Defining parameters variables
//  

//
// Parsing arguments
{	let args = process.argv.slice(2);

	if(args < 5) {
		console.log('Usage: \n'+
					'	node meter_gen [meters number (1 to 1M)] '+
									  "[date begin 'yyyy/mm/dd'] "+
									  "[date end 'yyyy/mm/dd'] "+
									  '[data interval (in minutes)] '+
									  "[data type ('gaz, 'electric' or 'mixed')] "+
									  '(-separateFiles) '+
									  '(-temp) '+
									  '(-location)');
		process.exit(-1); // not enough arguments
	}

	let errNb = 0;

	let arg = args.shift(); // arg1
	NB_METERS = arg|0;
	if(NB_METERS <= 0 || NB_METERS > 1000000) {
	    console.log('ERROR: Number of meters should be between 1 and 1 millions (you put', arg+')');
	    errNb++;
	}

	arg = args.shift(); // arg2
	FROM = moment(arg, 'YYYY/MM/DD');
	if(!moment(arg, 'YYYY/MM/DD', true).isValid()) {
	    console.log('ERROR: Check your begining date, should be in format yyyy/mm/dd (you put', arg+')');
	    errNb++;
	}

	arg = args.shift(); // arg3
	TO = moment(arg, 'YYYY/MM/DD');
	if(!moment(arg, 'YYYY/MM/DD', true).isValid()) {
	    console.log('ERROR: Check your end date, should be in format yyyy/mm/dd (you put', arg+')');
	    errNb++;
	}

	arg = args.shift(); // arg4
	MINUTES_INTERVAL = arg|0;
	if(MINUTES_INTERVAL <= 0) {
	    console.log('ERROR: interval of minute should be a positive integer (you put', arg+')');
	    errNb++;
	}

	arg = args.shift(); // arg5
	TYPE = arg;
	if(TYPE !== 'electric' && TYPE !== 'gas' && TYPE !== 'mixed') {
	    console.log("ERROR: choose between 'electric', 'gas' or 'mixed' (you put", arg+')');
	    errNb++;
	}


	while(args.length > 0) {
		arg = args.shift();
		switch(arg) {
			case '-separateFiles':
				wantSeparateFile = true;
				break;
			case '-temp':
				wantTemperature = true;
				break;
			case '-location':
				wantLocation = true;
				break;
			case '-out':
				if(args.length < 1) {
					console.log('ERROR: -out need an argument.');
					errNb++;
				} else {
					filePath = args.shift();
				}
				break;
			default:
				console.log('ERROR: Unknown argument:', arg);
				errNb++;
		}
	}

	if(errNb > 0) {
		console.log('Usage: \n'+
				'	node meter_gen [meters number (1 to 1M)] '+
								  "[date begin 'yyyy/mm/dd'] "+
								  "[date end 'yyyy/mm/dd'] "+
								  '[data interval (in minutes)] '+
								  "[data type ('gaz, 'electric' or 'mixed')] "+
								  '(-separateFiles) '+
								  '(-temp) '+
								  '(-location)');
		process.exit(-2); // Argument error
	}
} // free 'arg', 'args' and 'errNb' variables
// Parsing Arguments
//

//
// Check filePath
if(wantSeparateFile) {
	if(!filePath.endsWith('/'))
		filePath += '/';

	try {
		fs.mkdirSync(filePath);
	} catch (e) { /* ignored */ }
} else {
	if(filePath.endsWith('/'))
		filePath += 'meter_gen.csv';

	let folder = filePath.match(/^(.*)\//);
	folder = (folder.length > 0)?folder[0]:'.';

	try {
		fs.mkdirSync(folder);
	} catch (e) { /* ignored */ }
}
// Check filePath
// 


// Build DataConsumption structure
let locations = [];
let sumPopulation = 0;
const kmLongitude = (360/6378);
const kmLatitude = (360/6357);
const CONFIG = getConfig();
[locations, sumPopulation] = getLocations();

//
// Generating Meters information
for(let i=NB_METERS-1; i>=0; i--) {
	const cityRandomIndex = Math.random() * sumPopulation;
	const city = findLocation(cityRandomIndex); // city: {country,region,city,lattitude,longitude,radius,chance}

    const meter = {
		vid: 	   'METER' + ('00000' + i).slice(-6),
        houseType: chooseBetween([20, 50, 70, 100]), // chose one of the possibilities randomly, to Json, into houseType
        region:    city.region,
        city: 	   city.name,
        latitude:  (city.latitude + (Math.random()*city.radius*2 -city.radius)*kmLatitude).toFixed(6), // add randomized lattitude
        longitude: (city.longitude + (Math.random()*city.radius*2 -city.radius)*kmLongitude).toFixed(6), // add randomized longitude
    };

    if(TYPE === 'mixed')
        meter.consumptionType = chooseBetween(['electric', 'gas']);
    else /*if(TYPE === 'electric' || TYPE === 'gas')*/
        meter.consumptionType = TYPE;

    // Add data to files for this meter
    generateAllForOneMeter(meter);
}

// close files
while(openFiles.length > 0) {
	closeFile(openFiles[0]);
}

//  //  //  //  // Execution End //  //  //  //  //
//      //      //               //      //      //


//
// Functions
/** 
 * return one of the values of the table passed in parameter, randomly choosen 
**/
function chooseBetween(tab) {
    return tab[(Math.random()*tab.length)|0];
}

function openFile(fileName) {
	if(openFiles.indexOf(fileName) >= 0)
		return;

	openFiles.push(fileName);

	const firstLine = ['date,index,sumHC,sumHP,type,vid,size'];
	if(wantTemperature)
		firstLine.push('temp');
	if(wantLocation)
		firstLine.push('city,lat,long');
	fs.writeFileSync(fileName, firstLine+'\n');
}

function appendToFile(fileName, tab) {
	if(openFiles.indexOf(fileName) < 0)
		openFile(fileName);

	fs.appendFileSync(fileName, tab.join(',')+'\n');
}

function closeFile(fileName) {
	let index = openFiles.indexOf(fileName);
	if(index >= 0)
		openFiles.splice(index, 1);
}

function getConfig() {
	const config = require('./meter_gen_config.json');
	config.climatZone.FRA.Oceanic = new Set(config.climatZone.FRA.Oceanic);
	config.climatZone.FRA.Mountains = new Set(config.climatZone.FRA.Mountains);
	config.climatZone.FRA.Continental = new Set(config.climatZone.FRA.Continental);
	config.climatZone.FRA.Mediteranean = new Set(config.climatZone.FRA.Mediteranean);

	return config;
}

function getLocations() {
	let locationsFile = require('./locations.json');

	// count total population
	let locations = [];
	let curr_chance = 0;
	while(locationsFile.length > 0) {
		let curr_loc = locationsFile.shift();
		if(curr_loc.population<1 || curr_loc.density===0)
			continue;

		curr_chance += curr_loc.population; // ...+343304
		locations.push({
			country: curr_loc.country, // "FRA"
			region: curr_loc.region, // 6
			name: curr_loc.city, // "Nice"
			lattitude: curr_loc.lattitude, // 43.7
			longitude: curr_loc.longitude, // 7.25
			radius: Math.sqrt(Math.PI*curr_loc.population / curr_loc.density), // pop:343304 dens:4773 => radius of 4.78485496485km
			chance: curr_chance
		});
	}

	return [locations, curr_chance];
}

function findLocation(humanNumber, min=0, max=locations.length-1) {
	if(min >= max)
		return locations[min];

	const cut = ((max-min)/2)|0;
	if(locations[cut].chance === humanNumber) { // if is the cut
		return locations[cut];
	} else if(humanNumber <= locations[min].chance) { // if is the minimum
		return locations[min];
	} else if(humanNumber > locations[max-1].chance) { // if is the maximum
		return locations[max];
	} else if(humanNumber < locations[cut].chance) { // recursively call 
		return findLocation(min+1, cut-1);
	} else {
		return findLocation(cut+1, max-1);
	}
}

function generateAllForOneMeter(meter) {
	/*
	*  energyType = meter.consumptionType==='electric'?'elec':'gas';
	*  surface = 's'+meter.houseType;
	*/
	const subConfig = CONFIG.DataConsumption[meter.consumptionType==='electric'?'elec':'gas']['s'+meter.houseType];

    // region ratio
    let climat = CONFIG.climats.Oceanic;
    if(CONFIG.climatZone.FRA.Mountains.has(meter.region)) { // Mountains
        climat = CONFIG.climats.Mountains;
    } else if(CONFIG.climatZone.FRA.Continental.has(meter.region)) { // Continental
        climat = CONFIG.climats.Continental;
    } else if(CONFIG.climatZone.FRA.Mediteranean.has(meter.region)) { // Mediteranean
        climat = CONFIG.climats.Mediteranean;
    } /*else if(CONFIG.climatZone.FRA.Oceanic.has(meters.region)) { // Oceanic
        climat = CONFIG.climats.Oceanic;
    }*/

    const line = [
		FROM.format(),
		0, // conso
        0, // highcost
        0, // lowcost
        meter.consumptionType,
        meter.vid,
        meter.houseType
    ];

    if(wantTemperature)
        line.push(0);

    if(wantLocation) {
        line.push(meter.city);
        line.push(meter.latitude);
        line.push(meter.longitude);
    }

    meter = null; // free Meter

    let lastDateHour = 25; // force nextDay for first date
    let season;
    let dayOfWeek;
    let conso = 0;
    let highcost;
    let lowcost;

    for(let d=moment(FROM); d<=TO; d.add(MINUTES_INTERVAL, 'minutes')) { // For each period of time
    	const dateHour = d.format('HH')|0;
    	if(lastDateHour > dateHour) { // next day 
    		highcost = 0;
	        lowcost = 0;

	        // Hot season (March -> November)
	    	const dateMonth = d.format('MM')|0;
	        season = (dateMonth<11 && dateMonth>3) ? 'hotS' : 'coldS';

	        // Working day (MTWTF)
	    	const dateDay = d.format('dddd');
	        dayOfWeek = (dateDay!=='Sunday' && dateDay!=='Saturday') ? 'wDay' : 'wEnd';
    	}

        let dayTime = 'Evening';
        if(dateHour <= 6) {
            dayTime = 'Night'; // Night (00h -> 9H)
        } else if(dateHour <=  9) {
            dayTime = 'Morning';  // Morning (6h -> 9h)
        } else if(dateHour <=  17) {
            dayTime = 'Day'; // Day (9h -> 17h)
        } /*else {
            dayTime = 'Evening';  // Evening(17h -> 23h59)
        }*/

        const avg = subConfig[season][dayOfWeek][dayTime].avg * climat[season].RatioAvg;
        const stdev = subConfig[season][dayOfWeek][dayTime].stddev * climat[season].RatioStddev;
        const curr_conso = rand.rnorm(avg, stdev) / (1440 / MINUTES_INTERVAL);

        // Calculate the Consumption in zone hight cost or low cost
        if(dateHour>6 || dateHour<22)
            highcost += curr_conso*0.001; // convert to KWh
        else
            lowcost += curr_conso*0.001; // convert to KWh

        conso += curr_conso;

        line[0] = d.format();
        line[1] = conso;
        line[2] = lowcost;
        line[3] = highcost;

        if(wantTemperature) 
        	line[7] = (Math.random()*MAX_RANDOM_TEMP).toFixed(2);

        if(wantSeparateFile) {
        	appendToFile(filePath + d.format('YYYY_MM_DD-HH_mm_ss') + '.csv', line);
        } else {
	       	appendToFile(filePath, line);
    	}
    }
}