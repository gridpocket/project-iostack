#!/usr/bin/env node

/**
 * 		Meter csv data generator
 * 
 * GridPocket Copyrights 2016
 * IOSTACK project www.iostack.eu
 * 
 * @Authors : Guillaume PILOT, Dien Hoa TRUONG, Kevin FOUHETY, César CARLES, Nathaël NOGUÈS 
 * 		GridPocket SAS
 *
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-06-05
 *
 * Usage : 
 *	  node meter_gen (options...)
 *	 or
 *	  node --expose-gc meter_gen (options...)
 *
 * Example usage: 
 * 	node meter_gen.js -metersNumber 10 -beginDate '2016/01/01' -endDate '2016/12/31' -interval 60 -metersType elec -separateDataBy 1 -location
**/

/*jshint esversion: 6 */
var moment = require('moment');
var fs = require('fs');
var randgen = require('randgen');

// Computing time
console.time('total');
console.time('init');

// Save file descriptors to faster use
var openFiles = new Map(); // {fileName1:fileDescriptor, fileName2:fileDescriptor...}

// Variables to monitor file size
var curFileSize = 0;
var fileNb = 1;
var totalFileSize = 0;

// Get meter_gen call parameters
const params = getParameters(process.argv.slice(2));
const configMeteo = (!params.meteoFile)?null:getMeteoConfig(params.meteoFile);
const configClimat = getClimatConfig(params.climatFile);
if(params.debug) console.timeEnd('init');

// Generating Meters information
if(params.debug) console.time('meters');
const metersTab = generateMeters(params, configClimat.climatZone, configMeteo);
if(params.debug) console.timeEnd('meters');
if(global.gc) gc();

// Generate Data
if(params.debug) console.time('data');
const configConsum = JSON.parse(fs.readFileSync(params.consumptionsFile));
generateDataLoop(params, configClimat, configConsum, metersTab, configMeteo);
if(params.debug) console.timeEnd('data');

// close files
openFiles.forEach(closeFile);
if(params.debug) console.timeEnd('total');

process.exit(0);
//  //  //  //  // Execution End //  //  //  //  //
//      //      //               //      //      //


//      //      //           //      //      //
//  //  //  //  // Functions //  //  //  //  //


//
// Functions for accessing files
function getFile(params, fileName, createIfNotExists=true) {
	if(openFiles.has(fileName))
		return openFiles.get(fileName);

	if(!createIfNotExists)
		return null;

	const fileDescriptor = fs.openSync(fileName, 'w');
	openFiles.set(fileName, fileDescriptor);
	curFileSize = 0;

	const firstLine = ['date,index,sumHC,sumHP,type,vid,size'];
	if(params.temp)
		firstLine.push('temp');
	if(params.location)
		firstLine.push('city,region,lat,lng');

	if(!appendToFile(params, fileName, firstLine)) { // should be after 'openFiles.set' to not have infinite recursive loop
		console.error('ERROR: Head line larger than given Max file size');
		process.exit(-3);
	}
	return fileDescriptor;
}

function appendToFile(params, fileName, tab) {
	const line = tab.join(',')+'\n';

	const fd = getFile(params, fileName);

	if(params.maxFileSize) {
		curFileSize += Buffer.byteLength(line, 'utf8');
		if(curFileSize >= params.maxFileSize)
			return false;
	}
	fs.appendFileSync(fd, line, 'utf-8');
	totalFileSize += Buffer.byteLength(line, 'utf8');
	return true;
}

function closeFile(fileDescriptor, fileName) {
	if(fileDescriptor)
		fs.close(fileDescriptor);
	openFiles.delete(fileName);
}
// Functions for accessing files
//

//
// Util functions
function loadArgs(map, recursive=[]) {
	let params = {
		metersNumber: null,
		beginDate: null,
		endDate: null,
		interval: null,
		metersType: null,
		maxFileSize: null,
		separateDataBy: null,
		fileNameExt: null,
		startID: null,
		lastID: null,
		temp: null,
		location: null,
		consumptionsFile: null,
		climatFile: null,
		meteoFile: null,
		locationsFile: null,
		out: null,
		debug: false
	};

	let hasErrors = false;

	// Loading argument -config
	if(map.has('config')) {
		const configFile = map.get('config');

		if(recursive.indexOf(configFile) >= 0) {
			console.error('ERROR: -config loop detected:',configFile,'is directly or indirectly referencing itself');
			hasErrors = true;
		} else {
			const config = JSON.parse(fs.readFileSync(configFile));// get config file as json object

			// convert config to Map object (speed up)
			const paramsMap = new Map();
			Object.keys(config).forEach(key => {
			    paramsMap.set(key, config[key]);
			});

			// Add this file name to 'recursive' list, to maybe later detect recursivity loop
			recursive.push(configFile);
			[params, hasErrors] = loadArgs(paramsMap, recursive);
		}
	}

	// Loading all others arguments
	Object.keys(params).forEach(key => {
        if(map.has(key))
        	params[key] = map.get(key);
    });
    map.forEach((value, key) => {
    	if(params.hasOwnProperty(key))
        	params[key] = value;
        else if(key !== 'config') {
        	console.error('ERROR: Unrecognised option "'+key+'"');
        	hasErrors = true;
        }
    });

    return [params, hasErrors]; 
}

/** 
 * return one of the values of the table passed in parameter, randomly choosen 
**/
function chooseBetween(tab) {
	let rand = Math.random();
	
	const keys = Object.keys(tab);
	for(let i=keys.length-1; i>=0; i--) {
		rand -= tab[keys[i]];
		if(rand <= 0)
			return keys[i];
	}

    return null;
}


function buildFolder(folderPath) {
	try {
		// Build all folders path recursively
		folderPath.split('/')
		  .reduce((path, folder) => {
		  	path += folder + '/';
		  	if (!fs.existsSync(path)) {
		  		fs.mkdirSync(path);
		  	}
		  	return path;
		  }, '');
	} catch (e) {
		return false;
	}
	return true;
}

function distance(ax,ay,bx,by) {
	return (ax-bx)*(ax-bx)+(ay-by)*(ay-by);
}
// Util functions
// 

//
// Preparing parser functions
function getParameters(args) {	
	if(args.indexOf('-h') >= 0 || args.indexOf('-help') >= 0) {
		const usageMessage = fs.readFileSync(__dirname+'/usageMessage.txt', 'utf8');
		console.log(usageMessage);
		process.exit(0); // not an error
	}

	// Converting args to a map
	const map = new Map();

	while(args.length > 0) {
		let arg = args.shift();

		// remove '-' at begining of option name
		if(arg.startsWith('-')) {
			arg = arg.slice(1);

			// get option arguments, and pushing into map
			if(args.length < 1 || args[0].startsWith('-')) {
				map.set(arg, '');
			} else {
				map.set(arg, args.shift());
			}
		} else {
			map.set(arg, '');
		}
	}

	if(!map.has('config') && fs.existsSync('./config.json')) { // default config file
		map.set('config', './config.json');
	}

	// loading arguments
	let errNb = 0;
	let params;
	{
		let hasErrors = false;
		[params, hasErrors] = loadArgs(map);
		if(hasErrors)
			errNb++;
	}

	// checking arguments validity
	// MetersNumber
	if(params.metersNumber === null) {
		console.error('ERROR: metersNumber need to be specified');
		errNb++;
		params.metersNumber = null;
	} else if(params.metersNumber === '') {
		console.error('ERROR: metersNumber need an argument');
		errNb++;
		params.metersNumber = null;
	} else {
		const nb_meters = params.metersNumber|0;
		if(nb_meters <= 0) {
	    	console.error('ERROR: Number of meters should be more than 0 (was "'+params.metersNumber+'")');
	    	errNb++;
			params.metersNumber = null;
	    } else {
	    	params.metersNumber = nb_meters;
	    }
	}

	// Date
	if(params.beginDate === null || params.endDate === null) {
		console.error('ERROR: beginDate and endDate need to be specified');
		errNb++;
	} else if(params.beginDate === '' || params.endDate === '') {
		console.error('ERROR: beginDate and endDate need an argument each');  
		errNb++;
	} else if(!moment(params.beginDate, 'YYYY/MM/DD', true).isValid() || !moment(params.endDate, 'YYYY/MM/DD', true).isValid()) {
	    console.error('ERROR: Check your beginDate and endDate, should be in format yyyy/mm/dd (was beginDate:"'+params.beginDate+'", endDate:"'+params.endDate+'")');
	    errNb++;
	} else {
		const beginDate = moment(params.beginDate, 'YYYY/MM/DD');
		const endDate = moment(params.endDate, 'YYYY/MM/DD');

		if(endDate < beginDate) {
			console.error('ERROR: endDate should be same or after beginDate (was beginDate:"'+params.beginDate+'", endDate:"'+params.endDate+'")');
			errNb++;
		} else {
			params.beginDate = beginDate;
			params.endDate = endDate;
		}
	}

	// Interval
	if(params.interval === null) {
		console.error('ERROR: interval need to be specified');
		errNb++;
	} else {
		const interval = params.interval|0;
		if(interval <= 0 || interval > 999999) {
	    	console.error('ERROR: interval should be 1 at minimum (was "'+params.interval+'")');
	    	errNb++;
	    } else {
	    	params.interval = interval;
	    }
	}

	// Max File Size
	if(params.maxFileSize === null || params.maxFileSize === false || params.maxFileSize === 'false') {
		params.maxFileSize = null;
	} else if(params.maxFileSize === '') {
		console.error('ERROR: maxFileSize need an argument (put false to disable a config setting)');
		errNb++;
	} else {
		let maxFileSize = parseInt(params.maxFileSize); // not working with |0 to get integer

		if(isNaN(maxFileSize) || maxFileSize <= 0) {
			console.error("ERROR: maxFileSize need an argument as integer > 0 followed by 'k', 'M' or 'G' (was \""+params.maxFileSize+'")');
			errNb++;
		} else {
			switch(params.maxFileSize[params.maxFileSize.length-1]) {
				case 'G': maxFileSize*=1024; /* falls through */
				case 'M': maxFileSize*=1024; /* falls through */
				case 'k': maxFileSize*=1024;
					break;
				default:
					console.error("ERROR: maxFileSize need an argument as integer > 0 followed by 'k', 'M' or 'G' (was \""+params.maxFileSize+'")');
					errNb++;
			}
			params.maxFileSize = maxFileSize;
		}
	}

	// Separate Files
	if(params.separateDataBy === null || params.separateDataBy === false || params.separateDataBy === 'false') {
		params.separateDataBy = null;
	} else if(params.separateDataBy === '') {
		console.error('ERROR: separateDataBy need an argument (put false to disable a config setting)');
		errNb++;
	} else {
		let separateDataBy = params.separateDataBy |0;
		if(separateDataBy<0) {
			console.error('ERROR: separateDataBy need a positive integer as argument (was "'+params.separateDataBy+'")');
			errNb++;
		} else {
			params.separateDataBy = separateDataBy;
		}
	}

	// StartID
	if(params.startID === null) {
		params.startID = 0;
	} else {
		let startID = params.startID|0;
		if(startID < 0 || (params.metersNumber && startID >= params.metersNumber)) {
			console.error('ERROR: startID should be an integer between 0 and (meters number -1) (was "'+params.startID+'")');
			errNb++;
			params.startID = 0;
		} else {
			params.startID = startID;
		}
	}

	// LastID
	if(params.lastID === null) {
		params.lastID = params.metersNumber;
	} else {
		let lastID = params.lastID|0;
		if(lastID <= 0 || (params.metersNumber && lastID > params.metersNumber)) {
			console.error('ERROR: lastID should be an integer between 1 and (meters number) (was "'+params.lastID+'")');
			errNb++;
			params.lastID = params.metersNumber;
		} else {
			params.lastID = lastID;
		}
	}

	// StartID LastID
	if(params.lastID <= params.startID) {
		console.error('ERROR: startID should be less than lastID (was startID:"'+params.startID+'", lastID:"'+params.lastID+'")');
		errNb++;
	}

	// Meter types
	if(params.metersType === null || params.metersType.startsWith('mix')) {
		params.metersType = 'mix';
	} else if(params.metersType.startsWith('elec')) {
		params.metersType = 'elec';
	} else if(params.metersType !== 'gas') {
	    console.error("ERROR: metersType should be 'elec', 'gas' or 'mixed' (was \""+params.metersType+'")');
	    errNb++;
	}

	// Temperature
	if(params.temp === null || params.temp === false || params.temp === 'false') {
		params.temp = false;
	} else if(params.temp === '' || params.temp === true || params.temp === 'true') {
		params.temp = true;
	} else {
		console.error('ERROR: temp need a boolean (was "'+params.temp+'")');
		params.temp = null;
		errNb++;
	}

	// Location
	if(params.location === null || params.location === false || params.location === 'false') {
		params.location = false;
	} else if(params.location === '' || params.location === true || params.location === 'true') {
		params.location = true;
	} else {
		console.error('ERROR: location need a boolean (was "'+params.temp+'")');
		params.location = null;
		errNb++;
	}

	// Out file
	if(params.out === null) {
		params.out = './';
	} else if (params.out === '') {
		console.error('ERROR: out need an argument ('+((params.maxFileSize !== null || params.separateDataBy !== null)?'folder path':'csv file path'));
		errNb++;
	} else {
		// Check filePath, add ends '/' if not already
		if(!params.out.endsWith('/'))
			params.out += '/';

		// Build all folders path recursively
		if(!buildFolder(params.out)) {
			console.error('ERROR: Impossible to go to or create the folder:', e);
			errNb++;
		}
	}

	// File Name Extension
	if(params.fileNameExt === null) {
		params.fileNameExt = '.csv';
	} else if(!params.fileNameExt.contains('.')) {	
		params.fileNameExt += '.csv';
	} // else: nothing to do, already ending with an extension

	if(!params.fileNameExt.startsWith('.'))
		params.fileNameExt = '-' + params.fileNameExt; // add separator if starts with something else than a dot

	if(!params.climatFile) {
		console.error('ERROR: climatFile need to be specified');
		errNb++;
	}

	if(!params.consumptionsFile) {
		console.error('ERROR: consumptionsFile need to be specified');
		errNb++;
	}

	if(!params.locationsFile) {
		console.error('ERROR: locationsFile need to be specified');
		errNb++;
	}

	if(!params.meteoFile && params.temp) {
		console.error('ERROR: when option -temp, meteoFile need to be specified');
		errNb++;
	}

	if(errNb > 0) {
		console.error('\nType meter_gen -h to see how to use');
		process.exit(-2); // Argument or Initialisation error
	}

	return params;
}

function getClimatConfig(climatFileName) {
	const climatFile = JSON.parse(fs.readFileSync(climatFileName));

	// transform [{climat: [regions, ...]}, ...] into map [{region: climat}, ...] (bigger but faster to read)
	Object.keys(climatFile.climatZone).forEach(countryID => {
		let countryTab = climatFile.climatZone[countryID];
		Object.keys(countryTab).forEach(climatID => {
			let climatTab = countryTab[climatID];
			for(let i=climatTab.length-1; i>=0; i--) {
				climatFile.climatZone[countryID][climatTab[i]] = climatID;
			}
			delete climatFile.climatZone[countryID][climatID];
		});
	});

	return climatFile;
}

function getMeteoConfig(meteoFileName) {
	const meteoFile = JSON.parse(fs.readFileSync(params.meteoFile));

	const meteoConfig = new Map();
	for(let i=meteoFile.length-1; i>=0; i--)
		meteoConfig.set(meteoFile[i].id, meteoFile[i]);

	return meteoConfig;
}

function getLocations(locationsFileName, totalPop) {
	let locationsFile = JSON.parse(fs.readFileSync(locationsFileName)); 
	let sum_pop = 0;

	const locations = [];

	// compute sum_pop
	let curr_loc;
	while(locationsFile.length > 0) {
		curr_loc = locationsFile.shift();
		if(curr_loc.population<1)
			continue; // not enough population in this city, not taken into acount

		sum_pop += curr_loc.population; // ...+343304, counting exact French population according to config file
		locations.push({
			country: curr_loc.country, // "FRA"
			region: curr_loc.region, // 6
			name: curr_loc.city, // 'Nice'
			lat: curr_loc.latitude, // 43.7
			lng: curr_loc.longitude, // 7.25

			// pop:343304 dens:4773 => radius of 4.78485496485km
			// density <1 => 1  to avoid errors (dividing 0 or negative values)
			radius: Math.sqrt(curr_loc.population / (Math.PI* ((curr_loc.density<1?1:curr_loc.density)+121.519) )), //121.519 is average france density, used as constant ratio to reduce size of smallest cities 
			pop: curr_loc.population
		});
	}

	// Divide city populations to obtain wanted meters number
	let chances = [];
	let metersRemaining = totalPop;
	for(let i=locations.length-1; i>=0; i--) {
		const computedPop = (locations[i].pop * totalPop / sum_pop);
		locations[i].pop = computedPop |0; // rounding down

		const roundingError = computedPop - locations[i].pop;
		chances.push({index:i, roundingError:roundingError});

		metersRemaining -= locations[i].pop;
	}

	// Sort list as cities with more rounding errors are first indexes
	chances.sort((b,a)=> {
		if(a.roundingError === b.roundingError)
			return locations[b.index].pop - locations[a.index].pop;

		return a.roundingError-b.roundingError;
	});

	// Add missing population to have exactly the wanted meters number
	while(metersRemaining > 0) {
		const curr = chances.shift();
		locations[curr.index].pop ++; // add one on a city witch had high rounding errors
		metersRemaining--;
	}

	return locations.filter(l=>l.pop > 0);
}
// Preparing parser functions
//

//
// Main Functions
function generateMeters(params, climatZone, configMeteo) {
	const locations = getLocations(params.locationsFile, params.metersNumber);
	if(global.gc) gc(); // Because getLocation loading a file

	//
	// constants for execution
	const sortByCoef = (a,b)=>b.coef-a.coef;
	const houseSurfaceChances = {'20':0.25, '50':0.25, '70':0.25, '100':0.25};
	const consoTypeChances = {'elec':0.25, 'gas':0.75};
	// constants for execution
	//

	const metersTab = [];
	let cityMeteoCenters;
	let curr_id = 0;

	// Go forwoard until the startID (ignoring the firsts locations)
	while(curr_id < params.startID) {
		const city = locations[0]; // city: {country,region,city,lattitude,longitude,radius,pop}
		const dec = (city.pop < params.startID-curr_id) ? city.pop : params.startID-curr_id;

		city.pop -= dec;
		curr_id += dec;

		if(city.pop<=0)
			locations.shift();
	}

	// Compute these meters (between startID and lastID)
	let lastCity = null;
	let city = locations.shift(); // city: {country,region,city,lattitude,longitude,radius,pop}
	for(; curr_id < params.lastID; curr_id++) {
	    const meter = {};

	    // region climat
	    meter.climat = climatZone.FRA[String(city.region)];
	    if(!meter.climat) {
		    console.error('ERROR: Region', city.region, 'not referenced in climat file');
	    	process.exit(-1);
	    }

		meter.line = [
			null, // date time (will be set later)
			0, // conso
	        0, // highcost
	        0, // lowcost
	        (params.metersType === 'mix')?chooseBetween(consoTypeChances):params.metersType, // consumption type
	        'METER' + ('00000' + curr_id).slice(-6), // Meter ID
	       	chooseBetween(houseSurfaceChances) // home surface
	    ];
	    if(params.temp || params.location) {
	    	// ÷2 (stddev should be radius/2)
	    	const lat =  randgen.rnorm(city.lat, city.radius*0.0045066473); // 360/39941 = 0.00901329460 ( 360° / Earth circumference (polar) in km ) ÷2 to obtain a good standard dev
	        const lng = randgen.rnorm(city.lng, city.radius*0.00449157829); // 360/40075 = 0.00898315658 ( 360° / Earth circumference (equator) in km ) ÷2 to obtain a good standard dev

		    if(params.temp) {
		    	let thisConfMeteo;

			    // If changed city, and cityMeteoCenters not already = Array.from(configMeteo.values());
		    	if(lastCity !== city && !(lastCity !== null && lastCity.pop < 2 && city.pop < 2)) {
			    	if(city.pop < 2) {
			    		cityMeteoCenters = Array.from(configMeteo.keys());
			    	} else { // compute city's nearest meteo centers (only for cities of 2 or more meters)
			    		cityMeteoCenters = [];

				    	// find nearest meteo data in all France meteo centers
				    	for(let [key,thisConfMeteo] of configMeteo) {
			    			if(distance(city.lat, city.lng, thisConfMeteo.lat, thisConfMeteo.lng) < 1) // ignore far data (data from more than 1°Lat/lng distance)
			    				cityMeteoCenters.push(key);
				    	}
			    	}
		    	}

		    	if(cityMeteoCenters.length <= 0) {
		    		console.log('WARNING: No meteoCenter around', city.name+', lat:', city.lat+', lng:', city.lng);
					meter.meteoCoefs = [];
		    	} else {
			    	const meteoCoefs = [];
			    	// find meter's nearest meteo centers
			    	for(let i=cityMeteoCenters.length-1; i>=0; i--) {
			    		thisConfMeteo = configMeteo.get(cityMeteoCenters[i]);
		    			meteoCoefs.push({id:thisConfMeteo.id, coef:1/(distance(lat, lng, thisConfMeteo.lat, thisConfMeteo.lng)+0.001)});
			    	}

			    	meteoCoefs.sort(sortByCoef).splice(5); // Keep only 5 nearest meteo coefs

			    	// compute total of coefs (to reduce-it to 1)
			    	let totalCoefs = 0;
			    	for(let i=meteoCoefs.length-1; i>=0; i--)
			    		totalCoefs += meteoCoefs[i].coef;

			    	// compute meteo coefs for the meter
			    	for(let i=meteoCoefs.length-1; i>=0; i--)
			    		meteoCoefs[i].coef /= totalCoefs;
					meter.meteoCoefs = meteoCoefs;
		    	}

		        meter.line.push(''); // temperature, will be set later
		    }

		    if(params.location) {
		        meter.line.push(city.name);
		        meter.line.push(city.region);
		        meter.line.push(lat.toFixed(6));
		        meter.line.push(lng.toFixed(6));
		    }
	    }

	    // Add data to files for this meter
	    metersTab.push(meter);

		// If this is the last person on this city, following loop will use next location
		if((--city.pop)<=0 && locations.length > 0)
			city = locations.shift(); // next turn on the next city
	}

	return metersTab;
}

function generateDataLoop(params, configClimat, configConsum, metersTab, configMeteo) {
	// Declaring variables here for reusage (memory gestion)
	let minutesSinceMid = 24*60+1; // hours since midnight, with decimals, 25 to force nextDay for first date
	let month;
	let season;
	let dayOfWeek;
	let fileName = params.out + params.beginDate.format('DD-MM-YYYY') + '-';

	let progress = 0;
	const progressMax = 1+ (params.endDate.valueOf() - params.beginDate.valueOf())/1000 /60 /params.interval; // compute number of loops needed
	if(params.debug) printProgress(progress, progressMax);

	for(let d=moment(params.beginDate); d<=params.endDate; d.add(params.interval, 'minutes')) { // For each period of time
		minutesSinceMid += params.interval;

		if(minutesSinceMid >= 24*60) { // next day 
			for(let i=metersTab.length-1; i>=0; i--) {
				metersTab[i].highcost = 0;
		        metersTab[i].lowcost = 0;
			}

			// month since begining of the year, with decimals
			month = d.diff(d.clone().startOf('year'), 'month', true);
	        // Hot season (April 1st -> October 31th)
	        season = (month>=4 && month<11) ? 'hotS' : 'coldS';

	        // Working day (MTWTF)
	    	const dateDay = d.format('ddd');
	        dayOfWeek = (dateDay!=='Sat' && dateDay!=='Sun') ? 'wDay' : 'wEnd';

	        minutesSinceMid = d.diff(d.clone().startOf('day'), 'minutes');

	        if(params.separateDataBy) {
		        let fileMoment = d.valueOf() - params.beginDate.valueOf(); // dateTo have the first file number equivalent dateTo the dateFrom
		    	fileMoment /= 60000*params.interval*params.separateDataBy; // divide by wanted interval numbers
		    	fileMoment |= 0; // parseInt dateTo get the interval number
		    	fileMoment *= 60000*params.interval*params.separateDataBy; // find the date corresponding dateTo the file number
		    	fileMoment = moment(params.beginDate.valueOf()+fileMoment);

		    	const lastFileName = fileName;
		    	fileName = params.out + fileMoment.format('YYYY-MM-DD') + '-'; // 'YYYY-MM-DD_HH-MM'
		    	if(lastFileName !== fileName)
	    			fileNb = 1; // reset file number because of new day
	        }
		}
		const hoursSinceMid = minutesSinceMid/60;

	    let dayTime = 'Evening';
	    if(hoursSinceMid <= 6)
	        dayTime = 'Night'; // Night (00h -> 06H)
	    else if(hoursSinceMid <=  9)
	        dayTime = 'Morning';  // Morning (06h -> 09h)
	    else if(hoursSinceMid <=  17)
	        dayTime = 'Day'; // Day (09h -> 17h)
	    /*else
	        dayTime = 'Evening';  // Evening(17h -> 23h59)
	    */

		for(let i=metersTab.length-1; i>=0; i--) { // For each meter
			const meter = metersTab[i];
			if(params.separateDataBy !== null && params.separateDataBy ===0)
				fileName = params.out + meter.line[5] + '-';

 			// DataConsumption[energyType][surface]
			//  energyType = meter.consumptionType==='elec'?'elec':'gas';
			//  surface = 's'+meter.houseType;
			const subConfig = configConsum[meter.line[4]]['s'+meter.line[6]];

		    const avg = subConfig[season][dayOfWeek][dayTime].avg * configClimat.climats[meter.climat][season].RatioAvg;
		    const stdev = subConfig[season][dayOfWeek][dayTime].stddev * configClimat.climats[meter.climat][season].RatioStddev;
		    const curr_conso = randgen.rnorm(avg, stdev) / (1440 / params.interval);

		    //
		    // Update Line
		    meter.line[1] += curr_conso; // conso
		    meter.line[(hoursSinceMid>=7 && hoursSinceMid<22)?3:2] += curr_conso*0.001; // (if in [7h - 21h] so highcost then lowcost), convert to KWh
		    meter.line[0] = d.format();

		    if(params.temp)
		    	meter.line[7] = computeTemperature(d, meter.meteoCoefs, configMeteo, hoursSinceMid, month);
		    // Update Line
		    //

		    //
		    // Write line to file
	    	const name = fileName + fileNb + params.fileNameExt;
			if(!appendToFile(params, name, meter.line)) {
				closeFile(getFile(params, name), name);
				fileNb++;
				if(!appendToFile(params, fileName + fileNb + params.fileNameExt, meter.line)) {
					console.error('ERROR: Line of data larger than given Max file size');
					process.exit(-3);
				}
			}
		    // Write to file
		    // 
		}

		if(global.gc) gc();
		if(params.debug) printProgress(++progress, progressMax);
	}

	if(params.debug) console.log(); // jump over one line
}
// Main Functions
//


function computeTemperature(date, meteoCoefs, configMeteo, hoursSinceMid, months) {
	if(meteoCoefs.length <= 0)
		return ''; // if no data, return nothing

	// compute meteo value
	let min1 = 0; // current month maximum & minimum temperatures
	let max1 = 0;
	let min2 = 0; // next month maximum & minimum temperatures
	let max2 = 0;

	const month1 = months|0;
	const month2 = (month1+1)%12;

	for(let meteoCoefIdx=meteoCoefs.length-1; meteoCoefIdx>=0; meteoCoefIdx--) {
		const currMeteoCoef = meteoCoefs[meteoCoefIdx];
		const meteoData = configMeteo.get(currMeteoCoef.id);
		min1 += currMeteoCoef.coef * meteoData.min[month1];
		max1 += currMeteoCoef.coef * meteoData.max[month1];
		min2 += currMeteoCoef.coef * meteoData.min[month2];
		max2 += currMeteoCoef.coef * meteoData.max[month2];
	}

	// interpol months data
	months -= month1;
	max1 = max1*(1-months) + max2*months;
	min1 = min1*(1-months) + min2*months;

	// interpol day data (as minimum temperature is at 4AM, and maximum temperature at 4PM) and return
	if(hoursSinceMid >= 4 && hoursSinceMid <= 16) { // day (temp increasing)
				// [4,16] -> [0,1]		-> [min,max]
		return ((hoursSinceMid-4)/12 * (max1-min1) +min1).toFixed(2);
	} else { // night (temp reducing)
				// [0,4]u[16,24] -> [0,1]	   -> [min,max]
		return ( (1-((hoursSinceMid+8)%24)/12) *(max1-min1) +min1 ).toFixed(2);
	}
}

function printProgress(progress, max) {
	const memu = process.memoryUsage().heapUsed;
	process.stdout.write('progress: '+progress+' /'+max+' ('+((100*progress/max)|0)+'%), memory: '+ prettifyNumber(memu) +', generated: '+ prettifyNumber(totalFileSize) +'        \r');
}

function prettifyNumber(number) {
	return 	((number/(1024*1024*1024)|0) > 0? (number/(1024*1024*1024)).toFixed(2)+'G': // with 2 decimals for Giga bytes
			(number>>20) > 0? (number>>20)+'M':
			(number>>10) > 0? (number>>10)+'k':
			number)+'B';
}