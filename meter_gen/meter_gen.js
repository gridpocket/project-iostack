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
 * @Last Modified time: 2017-04-19
 *
 * Usage : 
 * 	node meter_gen [meters number (1 to 1M)] [date begin 'yyyy/mm/dd'] [date end 'yyyy/mm/dd'] [data interval (in minutes)] [data type ('gaz, 'electric' or 'mixed')] (-separateFile) (-temp) (-location) (-out [ouptutFilePath (folder for '-separateFile')])
 * 
 * Example usage: 
 * 	node meter_gen.js 10 '2016/01/01' '2016/12/31' 60 electric -separateFile -location
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
var printEveryNbLines = 100; // Print in file 10 by 10 lines instead of 1 by 1
var linesToPrint = {}; // { 'path/to/file1': ['line1', 'line2', ...], 'path/to/file1': ['line1', 'line2', ...], ...}


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
//var wantSeparateFile = false;
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
									  '(-separateFile) '+
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
			case '-separateFile':
				//wantSeparateFile = true;
				console.log('WARNING -separateFile is Temporary disabled !');
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
								  '(-separateFile) '+
								  '(-temp) '+
								  '(-location)');
		process.exit(-2); // Argument error
	}
} // free 'arg', 'args' and 'errNb' variables
// Parsing Arguments
//

//
// Check filePath
var fd;
/*if(wantSeparateFile) {
	if(!filePath.endsWith('/'))
		filePath += '/';

	try {
		fs.mkdirSync(filePath);
	} catch (e) { /* ignored */ /*}
} else */{
	if(filePath.endsWith('/'))
		filePath += 'meter_gen.csv';

	let folder = filePath.match(/^(.*)\//);
	folder = (folder.length > 0)?folder[0]:'.';

	try {
		fs.mkdirSync(folder);
	} catch (e) { /* ignored */ }
	fd = openFile(filePath);
}
// Check filePath
// 


// Build DataConsumption structure
const CONFIG = getConfig();
let locations = [];
let sumPopulation = 0;
[locations, sumPopulation] = getLocations();


//
// Generating Meters information
let meters = [];
{
	const kmLongitude = (360/6378);
	const kmLatitude = (360/6357);


	// location: {country,region,city,lattitude,longitude,radius,chance}
	for(let i=NB_METERS; i>=0; i--) {
		const cityRandomIndex = Math.random() * sumPopulation;
		const city = findLocation(cityRandomIndex);

        const meter = {
    		vid: 		'METER' + ('00000' + meters.length).slice(-6),
            houseType: chooseBetween([20, 50, 70, 100]), // chose one of the possibilities randomly, to Json, into houseType
            region: 	city.region,
            city: 		city.name,
            latitude: 	(city.latitude + (Math.random()*city.radius*2 -city.radius)*kmLatitude).toFixed(6), // add randomized lattitude
            longitude: 	(city.longitude + (Math.random()*city.radius*2 -city.radius)*kmLongitude).toFixed(6), // add randomized longitude
        };

        if(TYPE === 'mixed')
            meter.consumptionType = chooseBetween(['electric', 'gas']);
        else /*if(TYPE === 'electric' || TYPE === 'gas')*/
            meter.consumptionType = TYPE;

        meters.push(meter);
	}
}

//
// File Generation
while(meters.length > 0) { // For each meter
	generateAllForOneMeter(meters.shift());
}
//if(!wantSeparateFile)
	closeFile(fd);

/*
async.timesLimit(meters.length, 4, (err,cb)=>generateAllForOneMeter(meters.shift(), cb), ()=>{
	// close file
	//if(!wantSeparateFile)
	closeFile(fd);
});*/
// File Generation
//


//  //  //  //  // Execution End //  //  //  //  //
//      //      //               //      //      //


//
// Functions

/** 
 * Function to Shuffle an array
**/ 
function shuffle(array) {
	let index;

    // for each element in array (but not first element)
    for(let counter=array.length-1; counter>0; counter--) {
        // Pick a random lower index
        index = (Math.random()*counter)|0;

        // And swap the element with the selected one
        [array[counter], array[index]] = [array[index], array[counter]];
    }
    return array;
}

/** 
 * return one of the values of the table passed in parameter, randomly choosen 
**/
function chooseBetween(tab) {
    return tab[(Math.random()*tab.length)|0];
}

function openFile(fileName) {
	const firstLine = ['date,index,sumHC,sumHP,type,vid,size'];
	if(wantTemperature)
		firstLine.push('temp');
	if(wantLocation)
		firstLine.push('city,lat,long');

	const fileDescriptor = fs.openSync(fileName, 'w');
	appendToFile(fileDescriptor, firstLine);
	return fileDescriptor;
}

function appendToFile(fileDescriptor, tab) {
	if(!linesToPrint[fileDescriptor]) {
		linesToPrint[fileDescriptor] = [];
	}

	linesToPrint[fileDescriptor].push(tab.join(','));
	if(linesToPrint[fileDescriptor].length >= printEveryNbLines) {
		fs.appendFileSync(fileDescriptor, linesToPrint[fileDescriptor].join('\n')+'\n'); // synchroneous (faster than asynchroneous)
		linesToPrint[fileDescriptor] = [];
	}
}

function closeFile(fileDescriptor) {
	// print all missing lines
	if(linesToPrint[fileDescriptor]) {
		if(linesToPrint[fileDescriptor].length > 0) {
			fs.appendFileSync(fileDescriptor, linesToPrint[fileDescriptor].join('\n')+'\n'); // synchroneous (faster than asynchroneous)
		}
		delete linesToPrint[fileDescriptor];
	}

	// close file
	fs.close(fileDescriptor);
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
	let cut = ((max-min)/2)|0;
	if(min===max || locations[cut].chance === humanNumber) { // if is the cut
		return locations[cut];
	} else if(locations[min].chance <= humanNumber) { // if is the minimum
		return locations[min];
	} else if(locations[cut].chance > humanNumber) { // recursively call 
		return findLocation(min+1, cut);
	} else {	
		return findLocation(cut+1, max);
	}
}

function generateAllForOneMeter(meter/*, cb*/) {
    // electric gas
    const energyType = meter.consumptionType==='electric'?'elec':'gas';

    // s20 s50 s70 s100
    const surface = 's'+meter.houseType;

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

        let consumptionTime = 'Evening';
        if(dateHour <= 6) {
            consumptionTime = 'Night'; // Night (00h -> 9H)
        } else if(dateHour <=  9) {
            consumptionTime = 'Morning';  // Morning (6h -> 9h)
        } else if(dateHour <=  17) {
            consumptionTime = 'Day'; // Day (9h -> 17h)
        } /*else {
            consumptionTime = 'Evening';  // Evening(17h -> 23h59)
        }*/

        const avg = CONFIG.DataConsumption[season][dayOfWeek][consumptionTime][energyType][surface].avg * climat[season].RatioAvg;
        const stdev = CONFIG.DataConsumption[season][dayOfWeek][consumptionTime][energyType][surface].stddev * climat[season].RatioStddev;
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

        /*if(wantSeparateFile) {
            let fileName = filePath + meter.vid + '.csv';
        	fd = openFile(fileName);
        	appendToFile(fd, line);
        	closeFile(fd);
        } else*/ {
	       	appendToFile(fd, line);
    	}
    }

    //cb();
}