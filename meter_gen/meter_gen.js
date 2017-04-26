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
 * @Last Modified time: 2017-04-26
 *
 * Usage : 
 * 	node meter_gen [meters number (1 to 1M)] [date begin 'yyyy/mm/dd'] [date end 'yyyy/mm/dd'] [data interval (in minutes)] [data type ('gas, 'electric' or 'mixed')] (-separateFiles) (-temp) (-location) (-out [ouptutFilePath (folder for '-separateFiles')])
 * 
 * Example usage: 
 * 	node meter_gen.js 10 '2016/01/01' '2016/12/31' 60 electric -separateFiles -location
**/

/*jshint esversion: 6 */


//
// Libraries and external files
var moment = require('moment');
var fs = require('fs');
var Rand = require('randgen');
// Libraries and external files
// 

// Speed-up meter_gen, using more memory to save time
var openFiles = new Map(); // {fileName1:fileDescriptor, fileName2:fileDescriptor...}


//
// Defining parameters variables
var NB_METERS;
var FROM;
var TO;
var MINUTES_INTERVAL;
var TYPE;
var wantSeparateFile = -1;
var wantTemperature = false;
var wantLocation = false;
var filePath = './out/'+moment().format('YYYYMMDDHHmmss')+'/';
// Defining parameters variables
//  

//
// Parsing arguments
{	const usageMessage = `Usage:
  node meter_gen [meters number] [date begin] [date end] [data interval] [data type] (-separateFiles (interval)) (-temp) (-location) (-out [filePath])

- Meters number (integer): 1 to 1000000 (1Milion)
- Date begin (string): date formatted as 'yyyy/mm/dd'
- Date end (string): date formatted as 'yyyy/mm/dd'), should be after date begin (or equal if you need only 1 data by meter)
- Data interval (integer): Minimum 1, number of minutes between each data from the same meter
- Meter type (string): sould be 'electric', 'gas' or 'mixed' (mixed: Meters will be one of electric or gas randomly chosen)
- Options:
      '-separateFiles' (without argument):
      		equivalent to '-separateFiles 1'
      '-separateFiles 0': 
      		to generate data in multiple files, as in each file there is all the data from only one user
      		(there will be as files as meters)
      '-separateFiles x' (with 'x' is an integer >=1): 
      		generate multiple files as in each file, there is 'x' data by user
      '-temp':
      		add external temperature of meter for each data
      		(currently returning random values as temperature)
      '-location':
      		add location information for each data (city name, longitude and latitude of where the meter is)
      '-out path/to/file.csv':
      		specify the path of the generated file (in the case of non -separateFiles)
      '-out path/to/folder/':
      		specify the path of the folder that will contains generated files (in the case of -separateFiles)
`;

	let args = process.argv.slice(2);

	if(args < 5) {
		console.log(usageMessage);
		process.exit(-1); // not enough arguments
	}

	let errNb = 0;

	let arg = args.shift(); // arg1
	NB_METERS = arg|0;
	if(NB_METERS <= 0 || NB_METERS > 1000000) {
	    console.log('ERROR: Number of meters should be between 1 and 1 millions (arg was "', arg+'"")');
	    errNb++;
	}

	arg = args.shift(); // arg2
	FROM = moment(arg, 'YYYY/MM/DD');
	if(!moment(arg, 'YYYY/MM/DD', true).isValid()) {
	    console.log('ERROR: Check your begining date, should be in format yyyy/mm/dd (arg was "', arg+'"")');
	    errNb++;
	}

	arg = args.shift(); // arg3
	TO = moment(arg, 'YYYY/MM/DD');
	if(!moment(arg, 'YYYY/MM/DD', true).isValid()) {
	    console.log('ERROR: Check your end date, should be in format yyyy/mm/dd (arg was "', arg+'"")');
	    errNb++;
	}
	if(TO < FROM) {
		console.log('ERROR: the end date should be equal or after the begining date.');
		errNb++;
	}

	arg = args.shift(); // arg4
	MINUTES_INTERVAL = arg|0;
	if(MINUTES_INTERVAL <= 0) {
	    console.log('ERROR: interval of minute should be a positive integer (arg was "', arg+'"")');
	    errNb++;
	}

	arg = args.shift(); // arg5
	TYPE = arg;
	if(TYPE !== 'electric' && TYPE !== 'gas' && TYPE !== 'mixed') {
	    console.log("ERROR: choose between 'electric', 'gas' or 'mixed' (arg was \"", arg+'"")');
	    errNb++;
	}


	while(args.length > 0) {
		arg = args.shift();
		switch(arg) {
			case '-separateFiles':
				if(args.length < 1 || String(args[0])[0]==='-') {
					wantSeparateFile = 1;
				} else {
					wantSeparateFile = args.shift();
					if(isNaN(wantSeparateFile) || wantSeparateFile<0) {
	    				console.log("ERROR: -separateFiles need a positive integer as argument (arg was \"", wantSeparateFile+'"")');
	    				errNb++;
					} else {
						wantSeparateFile = wantSeparateFile|0;
					}
				}
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
		console.log(usageMessage);
		process.exit(-2); // Argument error
	}
} // free 'arg', 'args' and 'errNb' variables
// Parsing Arguments
//

//
// Check filePath
if(wantSeparateFile !== -1) {
	if(!filePath.endsWith('/'))
		filePath += '/';

	try {
		filePath.split('/')
		  .reduce((path, folder) => {
		  	path += folder + '/';
		  	if (!fs.existsSync(path)) {
		  		fs.mkdirSync(path);
		  	}
		  	return path;
		  }, '');
	} catch (e) { /* ignored */ 
		console.log('Mkdir failed:', e);
	}
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


const CONFIG = getConfig(); // Build DataConsumption structure
const MAX_RANDOM_TEMP = 35; // for temperature random

//
// Generating Meters information
let metersTab = [];
{	const locations = getLocations(NB_METERS);
	const kmToLat = 0.00901329460; // 360/39941 = ( 360° / Earth circumference (polar) in km ) 
	const kmToLon = 0.00898315658; // 360/40075 = ( 360° / Earth circumference (equator) in km )

	for(let i=NB_METERS-1; i>=0; i--) {
		const city = locations[0]; // city: {country,region,city,lattitude,longitude,radius,pop}

		if((--locations[0].pop)<=0)
			locations.shift();

	    const meter = {};

	    // region ratio
	    if(CONFIG.climatZone.FRA.Mountains.has(city.region)) { // Mountains
	        meter.climat = 'Mountains';
	    } else if(CONFIG.climatZone.FRA.Continental.has(city.region)) { // Continental
	        meter.climat = 'Continental';
	    } else if(CONFIG.climatZone.FRA.Mediteranean.has(city.region)) { // Mediteranean
	        meter.climat = 'Mediteranean';
	    } else /*if(CONFIG.climatZone.FRA.Oceanic.has(meters.region))*/ { // Oceanic
	        meter.climat = 'Oceanic';
	    }

	    let houseSurface = chooseBetween(20, 50, 70, 100);
	    let consumptionType;
	    switch(TYPE) {
    	case 'mixed':
        	consumptionType = chooseBetween('elec', 'gas');
        	break;
    	case 'gas':
        	consumptionType = 'gas';
        	break;
    	case 'electric': /* falls through */
    	default:
        	consumptionType = 'elec';
	    }

		meter.line = [
			FROM.format(),
			0, // conso
	        0, // highcost
	        0, // lowcost
	        consumptionType,
	        'METER' + ('00000' + i).slice(-6),
	       	houseSurface
	    ];
	    if(wantTemperature)
	        meter.line.push(0);

	    if(wantLocation) {
	    	// ÷2 (stddev should be radius/2)
	    	const latitude =  Rand.rnorm(city.latitude, city.radius*kmToLat/2);
	        const longitude = Rand.rnorm(city.longitude, city.radius*kmToLon/2);

	        meter.line.push(city.name);
	        meter.line.push(latitude.toFixed(6));
	        meter.line.push(longitude.toFixed(6));
	    }

	    // Add data to files for this meter
	    metersTab.push(meter);
	}

	TYPE = null; // free 'Type' variable
	NB_METERS = null; // free 'NB_METERS' variable
} // free 'locations' variable
// Generating Meters information
// 


// Generate Data
while(metersTab.length > 0)
    generateAllForOneMeter(metersTab.shift());


// close files
openFiles.forEach(closeFile);

//  //  //  //  // Execution End //  //  //  //  //
//      //      //               //      //      //


//
// Functions
/** 
 * return one of the values of the table passed in parameter, randomly choosen 
**/
function chooseBetween(...tab) {
    return tab[(Math.random()*tab.length)|0];
}

function getFile(fileName, createIfNotExists=true) {
	if(openFiles.has(fileName))
		return openFiles.get(fileName);

	if(!createIfNotExists)
		return null;

	const fileDescriptor = fs.openSync(fileName, 'w');
	openFiles.set(fileName, fileDescriptor);

	const firstLine = ['date,index,sumHC,sumHP,type,vid,size'];
	if(wantTemperature)
		firstLine.push('temp');
	if(wantLocation)
		firstLine.push('city,lat,long');

	appendToFile(fileName, firstLine); // should be after 'openFiles.set' to not have infinite recursive loop

	return fileDescriptor;
}

function appendToFile(fileName, tab) {
	fs.appendFileSync(getFile(fileName), tab.join(',')+'\n', 'utf-8');
}

function closeFile(fileDescriptor, fileName) {
	if(fileDescriptor)
		fs.close(fileDescriptor);
	openFiles.delete(fileName);
}

function getConfig() {
	const config = require('./meter_gen_config.json');
	config.climatZone.FRA.Oceanic = new Set(config.climatZone.FRA.Oceanic);
	config.climatZone.FRA.Mountains = new Set(config.climatZone.FRA.Mountains);
	config.climatZone.FRA.Continental = new Set(config.climatZone.FRA.Continental);
	config.climatZone.FRA.Mediteranean = new Set(config.climatZone.FRA.Mediteranean);

	return config;
}

function getLocations(totalPop) {
	let locationsFile = require('./locations.json');
	let sum_pop = 0;
	const locations = [];

	// compute sum_pop
	let curr_loc;
	while(locationsFile.length > 0) {
		curr_loc = locationsFile.shift();
		if(curr_loc.population<1)
			continue;

		sum_pop += curr_loc.population; // ...+343304
		locations.push({
			country: curr_loc.country, // "FRA"
			region: curr_loc.region, // 6
			name: curr_loc.city, // "Nice"
			latitude: curr_loc.latitude, // 43.7
			longitude: curr_loc.longitude, // 7.25
			radius: Math.sqrt(curr_loc.population / (Math.PI*curr_loc.density)), // pop:343304 dens:4773 => radius of 4.78485496485km
			pop: curr_loc.population
		});
	}

	let sum_pop2 = totalPop;
	for(let i=locations.length-1; i>=0; i--) {
		locations[i].pop = (locations[i].pop * totalPop / sum_pop)|0;
		sum_pop2 -= locations[i].pop;
	}

	while(sum_pop2 > 0) {
		locations[(Math.random()*locations.length)|0].pop ++;
		sum_pop2--;
	}

	return locations.filter(l=>l.pop > 0);
}

function generateAllForOneMeter(meter) {
	/*
	*  energyType = meter.consumptionType==='electric'?'elec':'gas';
	*  surface = 's'+meter.houseType;
	*/
	const subConfig = CONFIG.DataConsumption[meter.line[4]]['s'+meter.line[6]]; // DataConsumption[consumptionType][houseSurface]

    let lastDateHour = 25; // force nextDay for first date
    let season;
    let dayOfWeek;

    const meterFileName = (wantSeparateFile===0)?filePath + meter.line[5] + '.csv':null;

    for(let d=moment(FROM); d<=TO; d.add(MINUTES_INTERVAL, 'minutes')) { // For each period of time
    	const dateHour = d.format('HH')|0;
    	if(lastDateHour > dateHour) { // next day 
    		meter.highcost = 0;
	        meter.lowcost = 0;

	        // Hot season (March -> November)
	    	const dateMonth = d.format('MM')|0;
	        season = (dateMonth<11 && dateMonth>3) ? 'hotS' : 'coldS';

	        // Working day (MTWTF)
	    	const dateDay = d.format('dddd');
	        dayOfWeek = (dateDay!=='Sunday' && dateDay!=='Saturday') ? 'wDay' : 'wEnd';
    	}

        let dayTime = 'Evening';
        if(dateHour <= 6) {
            dayTime = 'Night'; // Night (00h -> 06H)
        } else if(dateHour <=  9) {
            dayTime = 'Morning';  // Morning (06h -> 09h)
        } else if(dateHour <=  17) {
            dayTime = 'Day'; // Day (09h -> 17h)
        } /*else {
            dayTime = 'Evening';  // Evening(17h -> 23h59)
        }*/

        const avg = subConfig[season][dayOfWeek][dayTime].avg * CONFIG.climats[meter.climat][season].RatioAvg;
        const stdev = subConfig[season][dayOfWeek][dayTime].stddev * CONFIG.climats[meter.climat][season].RatioStddev;
        const curr_conso = Rand.rnorm(avg, stdev) / (1440 / MINUTES_INTERVAL);

        // Calculate the Consumption in zone hight cost or low cost
        if(dateHour>6 || dateHour<22)
            meter.line[3] += curr_conso*0.001; // highcost, convert to KWh
        else
            meter.line[2] += curr_conso*0.001; // lowcost, convert to KWh

        meter.line[1] += curr_conso; // conso
        meter.line[0] = d.format();

        if(wantTemperature) 
        	meter.line[7] = (Math.random()*MAX_RANDOM_TEMP).toFixed(2);

        if(wantSeparateFile<0) {
	       	appendToFile(filePath, meter.line);
	    } else if(wantSeparateFile===0) {
        	appendToFile(meterFileName, meter.line);
        } else {
        	let fileMoment = d.valueOf() - FROM.valueOf(); // to have the first file number equivalent to the FROM
        	fileMoment /= 60000*MINUTES_INTERVAL*wantSeparateFile; // divide by wanted interval numbers
        	fileMoment |= 0; // parseInt to get the interval number
        	fileMoment *= 60000*MINUTES_INTERVAL*wantSeparateFile; // find the date corresponding to the file number
        	fileMoment = moment(FROM.valueOf()+fileMoment).format('YYYY_MM_DD-HH_mm_ss'); // to string

        	appendToFile(filePath + fileMoment + '.csv', meter.line);
		}
    }

    if(wantSeparateFile===0)
    	closeFile(getFile(meterFileName), meterFileName);
}