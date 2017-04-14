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
 * @Last Modified time: 2017-04-14
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
var moment = require('moment');
var fs = require('fs');
var rand = require('randgen');
// Libraries and external files
// 

// For monitoring time
const TIME_BEGIN = moment.now();

//
// Defining constants
const MAX_RANDOM_INDEX = 1000;
const MAX_RANDOM_TEMP = 35;
const TOTAL_DENSITY = 486;
const TOTAL_POPULATION = 64886015;
// Defining constants
//

//
// Parsing arguments
var args = process.argv.slice(2);

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

var errNb = 0;

let arg = args.shift(); // arg1
const NB_METERS = arg|0;
if(NB_METERS <= 0 || NB_METERS > 1000000) {
    console.log('ERROR: Number of meters should be between 1 and 1 millions (you put', arg+')');
    errNb++;
}

arg = args.shift(); // arg2
const FROM = moment(arg, 'YYYY/MM/DD');
if(!moment(arg, 'YYYY/MM/DD', true).isValid()) {
    console.log('ERROR: Check your begining date, should be in format yyyy/mm/dd (you put', arg+')');
    errNb++;
}

arg = args.shift(); // arg3
const TO = moment(arg, 'YYYY/MM/DD');
if(!moment(arg, 'YYYY/MM/DD', true).isValid()) {
    console.log('ERROR: Check your end date, should be in format yyyy/mm/dd (you put', arg+')');
    errNb++;
}

arg = args.shift(); // arg4
const MINUTES_INTERVAL = arg|0;
if(MINUTES_INTERVAL <= 0) {
    console.log('ERROR: interval of minute should be a positive integer (you put', arg+')');
    errNb++;
}

arg = args.shift(); // arg5
const TYPE = arg;
if(TYPE !== 'electric' && TYPE !== 'gas' && TYPE !== 'mixed') {
    console.log("ERROR: choose between 'electric', 'gas' or 'mixed' (you put", arg+')');
    errNb++;
}

var wantSeparateFile = false;
var wantTemperature = false;
var wantLocation = false;
var filePath = './out/'+moment().format('YYYYMMDDHHmmss')+'/';

while(args.length > 0) {
	arg = args.shift();
	switch(arg) {
		case '-separateFile':
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
							  '(-separateFile) '+
							  '(-temp) '+
							  '(-location)');
	process.exit(-2); // Argument error
}
// Parsing Arguments
//

//
// Check filePath
var fd;
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
	fd = appendFirstLineToFile(filePath);
}
// Check filePath
// 

//
// Generating Meters information
const meters = [];
{	const locations = require('./locations.json');
	const shuffleIndex = [];
	let totalDensity = 0;
	let cityNb = locations.length;

	for(let i=locations.length-1; i>=0; i--) {
		let curr_loc = locations[i];
	    if(!curr_loc.density) {
	    	cityNb--;
	    } else {
	   		shuffleIndex.push(i);
	    }
	}
	shuffle(shuffleIndex);

	//Generate meter informations with location and meterID
	for(let i=NB_METERS-1; i>=0; i--)
	    totalDensity += locations[shuffleIndex[i%cityNb]].density;

	while(meters.length<NB_METERS) {
	    let curr_loc = locations[shuffleIndex[meters.length%cityNb]];

	    const RATIO = curr_loc.density*NB_METERS/totalDensity;
	    const rest = NB_METERS-meters.length;

	    for(j=0; j<RATIO && j<=rest; j++) {
	        const meter = {
	            //l:  		curr_loc.l,
	            //country: 	curr_loc.country,
	            region: 	curr_loc.region,
	            city: 		curr_loc.city,
	            //p: 		curr_loc.p,
	            latitude: 	curr_loc.latitude,
	            longitude: 	curr_loc.longitude,
	            //m: 		curr_loc.m,
	            //a:		curr_loc.a,
	            population: curr_loc.population,
	            //density: 	curr_loc.density,
	            //densityTotal: curr_loc.densityTotal,
        		vid: 		'METER' + ('00000' + meters.length).slice(-6),
	            highcost: 	0,
	            lowcost: 	0,
	            //conso: 	0,
	            houseType: chooseBetween([20, 50, 70, 100]) // chose one of the possibilities randomly, to Json, into houseType
	        };

	        if(TYPE === 'mixed')
	            meter.consumptionType = chooseBetween(['electric', 'gas']);
	        else /*if(TYPE === 'electric' || TYPE === 'gas')*/
	            meter.consumptionType = TYPE;
	        
	        if(!meter) {
	        	console.log("!! No Meter :>", meters.length, j, RATIO, rest, curr_loc);
	        	process.exit(-1);
	        }
	        meters.push(meter);
	    } // for(j=0; j<ratio && j<=rest; j++)
	} // while(meters.length<=NB_METERS)
} // Free 'shuffleIndex', 'totalDensity', 'locations' and 'cityNb' variables
shuffle(meters);

//Generate CSV file

// Build DataConsumption structure
let DataConsumption;
DataConsumption = {'20m':{}, s50:{}, s70:{}, s100:{}};
DataConsumption = {gas: DataConsumption, elec: DataConsumption};
DataConsumption = {Night: DataConsumption, Morning: DataConsumption, Day: DataConsumption, Evening: DataConsumption};
DataConsumption = {wDay: DataConsumption, wEnd: DataConsumption};
DataConsumption = {coldS: DataConsumption, hotS: DataConsumption};

// Fill DataConsumption values

//  //  //  COLD SEASON  //  //  //  WORKING DAY
// 00h -> 06h
DataConsumption.coldS.wDay.Night.gas.s20 =  { avg:  655, stddev: 30 };
DataConsumption.coldS.wDay.Night.gas.s50 =  { avg: 1113, stddev: 30 };
DataConsumption.coldS.wDay.Night.gas.s70 =  { avg: 1571, stddev: 30 };
DataConsumption.coldS.wDay.Night.gas.s100 = { avg: 1899, stddev: 30 };

DataConsumption.coldS.wDay.Night.elec.s20 =  { avg:  2946, stddev: 30 };
DataConsumption.coldS.wDay.Night.elec.s50 =  { avg:  5532, stddev: 30 };
DataConsumption.coldS.wDay.Night.elec.s70 =  { avg:  8085, stddev: 30 };
DataConsumption.coldS.wDay.Night.elec.s100 = { avg: 10379, stddev: 30 };

// 06h -> 09h
DataConsumption.coldS.wDay.Morning.gas.s20 =  { avg:  764, stddev: 30 };
DataConsumption.coldS.wDay.Morning.gas.s50 =  { avg: 1299, stddev: 30 };
DataConsumption.coldS.wDay.Morning.gas.s70 =  { avg: 1833, stddev: 30 };
DataConsumption.coldS.wDay.Morning.gas.s100 = { avg: 2215, stddev: 30 };

DataConsumption.coldS.wDay.Morning.elec.s20 =  { avg:  3438, stddev: 30 };
DataConsumption.coldS.wDay.Morning.elec.s50 =  { avg:  6454, stddev: 30 };
DataConsumption.coldS.wDay.Morning.elec.s70 =  { avg:  9433, stddev: 30 };
DataConsumption.coldS.wDay.Morning.elec.s100 = { avg: 12108, stddev: 30 };

// 09h -> 18h
DataConsumption.coldS.wDay.Day.gas.s20 =  { avg:  436, stddev: 30 };
DataConsumption.coldS.wDay.Day.gas.s50 =  { avg:  742, stddev: 30 };
DataConsumption.coldS.wDay.Day.gas.s70 =  { avg: 1048, stddev: 30 };
DataConsumption.coldS.wDay.Day.gas.s100 = { avg: 1266, stddev: 30 };

DataConsumption.coldS.wDay.Day.elec.s20 =  { avg: 1964, stddev: 30 };
DataConsumption.coldS.wDay.Day.elec.s50 =  { avg: 3688, stddev: 30 };
DataConsumption.coldS.wDay.Day.elec.s70 =  { avg: 5390, stddev: 30 };
DataConsumption.coldS.wDay.Day.elec.s100 = { avg: 6919, stddev: 30 };

// 18h -> 00h
DataConsumption.coldS.wDay.Evening.gas.s20 =  { avg:  436, stddev: 30 };
DataConsumption.coldS.wDay.Evening.gas.s50 =  { avg:  742, stddev: 30 };
DataConsumption.coldS.wDay.Evening.gas.s70 =  { avg: 1048, stddev: 30 };
DataConsumption.coldS.wDay.Evening.gas.s100 = { avg: 1266, stddev: 30 };

DataConsumption.coldS.wDay.Evening.elec.s20 =  { avg:  3438, stddev: 30 };
DataConsumption.coldS.wDay.Evening.elec.s50 =  { avg:  6454, stddev: 30 };
DataConsumption.coldS.wDay.Evening.elec.s70 =  { avg:  9433, stddev: 30 };
DataConsumption.coldS.wDay.Evening.elec.s100 = { avg: 12108, stddev: 30 };

//  //  //  COLD SEASON  //  //  //  WEEKEND
// 00h -> 06h
DataConsumption.coldS.wEnd.Night.gas.s20 =  { avg:  539, stddev: 30 };
DataConsumption.coldS.wEnd.Night.gas.s50 =  { avg:  917, stddev: 30 };
DataConsumption.coldS.wEnd.Night.gas.s70 =  { avg: 1294, stddev: 30 };
DataConsumption.coldS.wEnd.Night.gas.s100 = { avg: 1564, stddev: 30 };

DataConsumption.coldS.wEnd.Night.elec.s20 =  { avg:  2946, stddev: 30 };
DataConsumption.coldS.wEnd.Night.elec.s50 =  { avg:  5532, stddev: 30 };
DataConsumption.coldS.wEnd.Night.elec.s70 =  { avg:  8085, stddev: 30 };
DataConsumption.coldS.wEnd.Night.elec.s100 = { avg: 10379, stddev: 30 };

// 06h -> 09h
DataConsumption.coldS.wEnd.Morning.gas.s20 =  { avg:  719, stddev: 30 };
DataConsumption.coldS.wEnd.Morning.gas.s50 =  { avg: 1222, stddev: 30 };
DataConsumption.coldS.wEnd.Morning.gas.s70 =  { avg: 1725, stddev: 30 };
DataConsumption.coldS.wEnd.Morning.gas.s100 = { avg: 2085, stddev: 30 };

DataConsumption.coldS.wEnd.Morning.elec.s20 =  { avg:  3929, stddev: 30 };
DataConsumption.coldS.wEnd.Morning.elec.s50 =  { avg:  7376, stddev: 30 };
DataConsumption.coldS.wEnd.Morning.elec.s70 =  { avg: 10780, stddev: 30 };
DataConsumption.coldS.wEnd.Morning.elec.s100 = { avg: 13838, stddev: 30 };

// 09h -> 18h
DataConsumption.coldS.wEnd.Day.gas.s20 =  { avg:  809, stddev: 30 };
DataConsumption.coldS.wEnd.Day.gas.s50 =  { avg: 1375, stddev: 30 };
DataConsumption.coldS.wEnd.Day.gas.s70 =  { avg: 1941, stddev: 30 };
DataConsumption.coldS.wEnd.Day.gas.s100 = { avg: 2345, stddev: 30 };

DataConsumption.coldS.wEnd.Day.elec.s20 =  { avg:  4420, stddev: 30 };
DataConsumption.coldS.wEnd.Day.elec.s50 =  { avg:  8298, stddev: 30 };
DataConsumption.coldS.wEnd.Day.elec.s70 =  { avg: 12128, stddev: 30 };
DataConsumption.coldS.wEnd.Day.elec.s100 = { avg: 15568, stddev: 30 };

// 18h -> 00h
DataConsumption.coldS.wEnd.Evening.gas.s20 =  { avg:  988, stddev: 30 };
DataConsumption.coldS.wEnd.Evening.gas.s50 =  { avg: 1680, stddev: 30 };
DataConsumption.coldS.wEnd.Evening.gas.s70 =  { avg: 2372, stddev: 30 };
DataConsumption.coldS.wEnd.Evening.gas.s100 = { avg: 2867, stddev: 30 };

DataConsumption.coldS.wEnd.Evening.elec.s20 =  { avg:  5402, stddev: 30 };
DataConsumption.coldS.wEnd.Evening.elec.s50 =  { avg: 10142, stddev: 30 };
DataConsumption.coldS.wEnd.Evening.elec.s70 =  { avg: 14823, stddev: 30 };
DataConsumption.coldS.wEnd.Evening.elec.s100 = { avg: 19027, stddev: 30 };

//  //  //  HOT SEASON  //  //  //  WORKING DAY
// 00h -> 06h
DataConsumption.hotS.wDay.Night.gas.s20 =  { avg: 263, stddev: 30 };
DataConsumption.hotS.wDay.Night.gas.s50 =  { avg: 447, stddev: 30 };
DataConsumption.hotS.wDay.Night.gas.s70 =  { avg: 632, stddev: 30 };
DataConsumption.hotS.wDay.Night.gas.s100 = { avg: 763, stddev: 30 };

DataConsumption.hotS.wDay.Night.elec.s20 =  { avg: 1184, stddev: 30 };
DataConsumption.hotS.wDay.Night.elec.s50 =  { avg: 2223, stddev: 30 };
DataConsumption.hotS.wDay.Night.elec.s70 =  { avg: 3249, stddev: 30 };
DataConsumption.hotS.wDay.Night.elec.s100 = { avg: 4171, stddev: 30 };

// 06h -> 09h
DataConsumption.hotS.wDay.Morning.gas.s20 =  { avg:  921, stddev: 30 };
DataConsumption.hotS.wDay.Morning.gas.s50 =  { avg: 1566, stddev: 30 };
DataConsumption.hotS.wDay.Morning.gas.s70 =  { avg: 2210, stddev: 30 };
DataConsumption.hotS.wDay.Morning.gas.s100 = { avg: 2671, stddev: 30 };

DataConsumption.hotS.wDay.Morning.elec.s20 =  { avg:  4145, stddev: 30 };
DataConsumption.hotS.wDay.Morning.elec.s50 =  { avg:  7782, stddev: 30 };
DataConsumption.hotS.wDay.Morning.elec.s70 =  { avg: 11373, stddev: 30 };
DataConsumption.hotS.wDay.Morning.elec.s100 = { avg: 14599, stddev: 30 };

// 09h -> 18h
DataConsumption.hotS.wDay.Day.gas.s20 =  { avg: 263, stddev: 30 };
DataConsumption.hotS.wDay.Day.gas.s50 =  { avg: 447, stddev: 30 };
DataConsumption.hotS.wDay.Day.gas.s70 =  { avg: 632, stddev: 30 };
DataConsumption.hotS.wDay.Day.gas.s100 = { avg: 763, stddev: 30 };

DataConsumption.hotS.wDay.Day.elec.s20 =  { avg: 1184, stddev: 30 };
DataConsumption.hotS.wDay.Day.elec.s50 =  { avg: 2223, stddev: 30 };
DataConsumption.hotS.wDay.Day.elec.s70 =  { avg: 3249, stddev: 30 };
DataConsumption.hotS.wDay.Day.elec.s100 = { avg: 4171, stddev: 30 };

// 18h -> 00h
DataConsumption.hotS.wDay.Evening.gas.s20 =  { avg: 1052, stddev: 30 };
DataConsumption.hotS.wDay.Evening.gas.s50 =  { avg: 1789, stddev: 30 };
DataConsumption.hotS.wDay.Evening.gas.s70 =  { avg: 2526, stddev: 30 };
DataConsumption.hotS.wDay.Evening.gas.s100 = { avg: 3052, stddev: 30 };

DataConsumption.hotS.wDay.Evening.elec.s20 =  { avg:  4737, stddev: 30 };
DataConsumption.hotS.wDay.Evening.elec.s50 =  { avg:  8894, stddev: 30 };
DataConsumption.hotS.wDay.Evening.elec.s70 =  { avg: 12998, stddev: 30 };
DataConsumption.hotS.wDay.Evening.elec.s100 = { avg: 16685, stddev: 30 };

//  //  //  HOT SEASON  //  //  //  WEEKEND
// 00h -> 06h
DataConsumption.hotS.wEnd.Night.gas.s20 =  { avg: 208, stddev: 30 };
DataConsumption.hotS.wEnd.Night.gas.s50 =  { avg: 354, stddev: 30 };
DataConsumption.hotS.wEnd.Night.gas.s70 =  { avg: 500, stddev: 30 };
DataConsumption.hotS.wEnd.Night.gas.s100 = { avg: 604, stddev: 30 };

DataConsumption.hotS.wEnd.Night.elec.s20 =  { avg: 1184, stddev: 30 };
DataConsumption.hotS.wEnd.Night.elec.s50 =  { avg: 2223, stddev: 30 };
DataConsumption.hotS.wEnd.Night.elec.s70 =  { avg: 3249, stddev: 30 };
DataConsumption.hotS.wEnd.Night.elec.s100 = { avg: 4171, stddev: 30 };

// 06h -> 09h
DataConsumption.hotS.wEnd.Morning.gas.s20 =  { avg:  729, stddev: 30 };
DataConsumption.hotS.wEnd.Morning.gas.s50 =  { avg: 1240, stddev: 30 };
DataConsumption.hotS.wEnd.Morning.gas.s70 =  { avg: 1750, stddev: 30 };
DataConsumption.hotS.wEnd.Morning.gas.s100 = { avg: 2114, stddev: 30 };

DataConsumption.hotS.wEnd.Morning.elec.s20 =  { avg:  4145, stddev: 30 };
DataConsumption.hotS.wEnd.Morning.elec.s50 =  { avg:  7782, stddev: 30 };
DataConsumption.hotS.wEnd.Morning.elec.s70 =  { avg: 11373, stddev: 30 };
DataConsumption.hotS.wEnd.Morning.elec.s100 = { avg: 14599, stddev: 30 };

// 09h -> 18h
DataConsumption.hotS.wEnd.Day.gas.s20 =  { avg:  729, stddev: 30 };
DataConsumption.hotS.wEnd.Day.gas.s50 =  { avg: 1240, stddev: 30 };
DataConsumption.hotS.wEnd.Day.gas.s70 =  { avg: 1750, stddev: 30 };
DataConsumption.hotS.wEnd.Day.gas.s100 = { avg: 2114, stddev: 30 };

DataConsumption.hotS.wEnd.Day.elec.s20 =  { avg:  4145, stddev: 30 };
DataConsumption.hotS.wEnd.Day.elec.s50 =  { avg:  7782, stddev: 30 };
DataConsumption.hotS.wEnd.Day.elec.s70 =  { avg: 11373, stddev: 30 };
DataConsumption.hotS.wEnd.Day.elec.s100 = { avg: 14599, stddev: 30 };

// 18h -> 00h
DataConsumption.hotS.wEnd.Evening.gas.s20 =  { avg:  833, stddev: 30 };
DataConsumption.hotS.wEnd.Evening.gas.s50 =  { avg: 1417, stddev: 30 };
DataConsumption.hotS.wEnd.Evening.gas.s70 =  { avg: 2000, stddev: 30 };
DataConsumption.hotS.wEnd.Evening.gas.s100 = { avg: 2417, stddev: 30 };

DataConsumption.hotS.wEnd.Evening.elec.s20 =  { avg:  4737, stddev: 30 };
DataConsumption.hotS.wEnd.Evening.elec.s50 =  { avg:  8894, stddev: 30 };
DataConsumption.hotS.wEnd.Evening.elec.s70 =  { avg: 12998, stddev: 30 };
DataConsumption.hotS.wEnd.Evening.elec.s100 = { avg: 16685, stddev: 30 };

const CLIMATS = {
    Mediteranean: {
        coldS: { RatioAvg: 0.66, RatioStddev: 1.24 },
        hotS: {  RatioAvg: 0.84, RatioStddev: 1.13 }
    },
    Oceanic: {
        coldS: { RatioAvg: 0.66, RatioStddev: 1.24 },
        hotS: {  RatioAvg: 0.84, RatioStddev: 1.13 }
    },
    Mountains: {
        coldS: { RatioAvg: 0.66, RatioStddev: 1.24 },
        hotS: {  RatioAvg: 0.84, RatioStddev: 1.13 }
    },
    Continental: {
        coldS: { RatioAvg: 0.66, RatioStddev: 1.24 },
        hotS: {  RatioAvg: 0.84, RatioStddev: 1.13 }
    }
};
//const oceanicDpts = [29, 22, 56, 35, 44, 85, 49, 79, 17, 16, 33, 40, 32, 82, 47, 24, 46, 19, 87, 53, 37, 50, 14, 76, 80, 62, 59, 2, 8, 51, 10, 89, 58, 91];
const mountainsDpts = new Set([64, 65, 9, 66, 81, 12, 68, 15, 23, 63, 43, 42, 38, 5, 73, 74, 39, 25, 88, 48]);
const continentalDpts = new Set([1, 55, 52, 70, 54, 57, 67, 90, 69, 20]);
const mediteraneanDpts = new Set([7, 26, 30, 84, 4, 6, 83, 13, 34, 31, 11]);

for(let d=FROM; d<=TO; d.add(MINUTES_INTERVAL, 'minutes')) {
    for(let i=0; i<meters.length; i++) {
        const meter = meters[i];

        // Choose the Consumption depending on the situation

        // Hot season (March -> November)
        const season = ((d.format('MM') < '11') && (d.format('MM') > '03')) ? 'hotS' : 'coldS';

        // Working day (MTWTF)
        const dayOfWeek = ((d.format('dddd') !== 'Sunday') && (d.format('dddd') !== 'Saturday')) ? 'wDay' : 'wEnd';

        // electric gas
        const energyType = meter.consumptionType==='electric'?'elec':'gas';

        // s20 s50 s70 s100
        const surface = 's'+meter.houseType;

        var consumptionTime = 'Evening';
        const hours = d.format('HH')|0;
        if(hours <= 6) {
            consumptionTime = 'Night'; // Night (00h -> 9H)
        } else if(hours <=  9) {
            consumptionTime = 'Morning';  // Morning (6h -> 9h)
        } else if(hours <=  17) {
            consumptionTime = 'Day'; // Day (9h -> 17h)
        } /*else {
            consumptionTime = 'Evening';  // Evening(17h -> 23h59)
        }*/

        let avg = DataConsumption[season][dayOfWeek][consumptionTime][energyType][surface].avg;
        let stdev = DataConsumption[season][dayOfWeek][consumptionTime][energyType][surface].stddev;
        
        if(mountainsDpts.has(meter.region)) { // Mountains
            avg *= CLIMATS.Mountains[season].RatioAvg;
            stdev *= CLIMATS.Mountains[season].RatioStddev;
        } else if(continentalDpts.has(meter.region)) { // Continental
            avg *= CLIMATS.Continental[season].RatioAvg;
            stdev *= CLIMATS.Continental[season].RatioStddev;
        } else if(mediteraneanDpts.has(meter.region)) { // Mediteranean
            avg *= CLIMATS.Mediteranean[season].RatioAvg;
            stdev *= CLIMATS.Mediteranean[season].RatioStddev;
        } else /*if(oceanicDpts.has(meters[i].region))*/ { // Oceanic
            avg *= CLIMATS.Oceanic[season].RatioAvg;
            stdev *= CLIMATS.Oceanic[season].RatioStddev;
        }

        const meter_conso = rand.rnorm(avg, stdev) / (1440 / MINUTES_INTERVAL);

        // Calculate the Consumption in zone hight cost or low cost
        if(hours<=6 || hours>=22)
            meter.highcost += meter_conso;
        else
            meter.lowcost += meter_conso;

        const line = [
			d.format(),
			meter_conso,
	        meter.lowcost*0.001, // convert to KWh
	        meter.highcost*0.001, // convert to KWh
	        meter.consumptionType,
	        meter.vid,
	        meter.houseType + 'm²'
        ];
 
        if(wantTemperature)
            line.push((Math.random()*MAX_RANDOM_TEMP).toFixed(2));

        if(wantLocation) {
            meter.latitude += (Math.random()*0.007 -0.0035); // add randomized lattitude
            meter.longitude += (Math.random()*0.007 -0.0035); // add randomized longitude

            line.push(meter.city);
            line.push(meter.latitude.toFixed(6));
            line.push(meter.longitude.toFixed(6));
            line.push(meter.population);
        }

        if(wantSeparateFile) {
            let fileName = filePath + meter.vid + '.csv';
        	fd = appendFirstLineToFile(fileName);
        	appendToFile(fd, line);
        	fs.close(fd);
        } else {
	       	appendToFile(fd, line);
    	}
    }
}

if(!wantSeparateFile)
	fs.close(fd);
console.log('Execution Time:', moment.now() - TIME_BEGIN, 'ms');

//	//	//	Functions

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

function appendFirstLineToFile(fileName) {
	const firstLine = ['date,index,sumHC,sumHP,type,vid,size'];
	if(wantTemperature)
		firstLine.push('temp');
	if(wantLocation)
		firstLine.push('city,lat,long,population');

	const fd = fs.openSync(fileName, 'w');
	appendToFile(fd, firstLine);
	return fd;
}

function appendToFile(fileDescriptor, tab) {
	fs.appendFileSync(fileDescriptor, tab.join(',').toString()+'\n'); // asynchroneous
}