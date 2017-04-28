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
 * @Last Modified time: 2017-04-28
 *
 * Usage : 
 * 	node meter_gen [meters number] [date begin] [date end] [data interval] [data type] (-maxFileSize [size]) (-separateFiles (interval)) (-startID [id]) (-lastID [id]) (-temp) (-location) (-out [filePath])
 * 
 * Example usage: 
 * 	node meter_gen.js 10 '2016/01/01' '2016/12/31' 60 electric -separateFiles 1 -location
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
var NB_METERS, FIRST_METER_ID = 0, LAST_METER_ID;
var FROM, TO, MINUTES_INTERVAL;
var TYPE;
var wantSeparateFile = -1;
var wantTemperature = false;
var wantLocation = false;
var wantMaxFileSize = false, curFileSize=0, fileNb=1;
var filePath = './out/'+moment().format('YYYYMMDDHHmmss')+'/';
// Defining parameters variables
//  

//
// Parsing arguments
{	const usageMessage = `Usage:
  node meter_gen [meters number] [date begin] [date end] [data interval] [data type] (-maxFileSize [size]) (-separateFiles (interval)) (-startID [id]) (-lastID [id]) (-temp) (-location) (-out [filePath])

- Meters number (integer): 1 to 999999
- Date begin (string): date formatted as 'yyyy/mm/dd'
- Date end (string): date formatted as 'yyyy/mm/dd'), should be after date begin (or equal if you need only 1 data by meter)
- Data interval (integer): Minimum 1, number of minutes between each data from the same meter
- Meter type (string): sould be 'electric', 'gas' or 'mixed' (mixed: Meters will be one of electric or gas randomly chosen)
- Options:
	  '-maxFileSize size': (cannot be cumulated with separateFiles)
	  		will generate multiple files such as no generated files size is more than 'x'

	  		> 'size' is an integer followed by 'k', 'M' or 'G' (like '5G' meaning 5 GigaBytes)
	  		Note that '-maxFileSize 1M' = '-maxFileSize 1024k',
	  		          '-maxFileSize 1G' = '-maxFileSize 1024M'
	  		Minimum: 1k (1 kB)
	  		Maximum: 8388608G (8,388,608 GB)

      '-separateFiles' (without argument):
      		Equivalent to '-separateFiles 1'
      '-separateFiles 0': 
      		To generate data in multiple files, as in each file there is all the data from only one user
      		(there will be as files as meters)
      '-separateFiles x' (with 'x' is an integer >=1): 
      		generate multiple files as in each file, there is 'x' data by user

      '-startID id': (with 'id' is an integer >= 0, default: 0)
      		Meters ID will start from the specified ID (and finish with startID+metersNumber-1)
      		Example: -startID 30 > First ID will be METER00030, second will be METER00031 ...

      '-lastID id': (with 'id' is an integer and 0<id<meters number, default: equiv. to meters number)
      		Meters ID will start from the specified ID (and finish with startID+metersNumber-1)
      		Example: -lastID 30 > Last generated meter ID will be METER00030

      '-temp':
      		add external temperature of meter for each data (°C)
      		(currently, all temperatures will be 20.00)

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
	LAST_METER_ID = NB_METERS = arg|0;
	if(NB_METERS <= 0 || NB_METERS > 999999) {
	    console.log('ERROR: Number of meters should be between 1 and 999999 (arg was "', arg+'"")');
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
		if(arg[0] === '-') {
			switch(arg.slice(1)) {
				case 'maxFileSize':
					if(args.length < 1) {
						console.log('ERROR: -maxFileSize need an argument.');
						errNb++;
					} else {
						arg = args.shift();
						wantMaxFileSize = parseInt(arg); // not working with |0 to get integer
						if(isNaN(wantMaxFileSize)) {
							console.log("ERROR: -maxFileSize need an argument as integer > 0 followed by 'k', 'M' or 'G' (arg was \"", arg+'")');
							errNb++;
						} if(wantMaxFileSize<=0) {
							console.log("ERROR: -maxFileSize need an argument as integer > 0 followed by 'k', 'M' or 'G' (arg was \"", arg+'")');
							errNb++;
						} else {
							switch(arg[arg.length-1]) {
								case 'G': wantMaxFileSize<<=10; /* falls through */
								case 'M': wantMaxFileSize<<=10; /* falls through */
								case 'k': wantMaxFileSize<<=10;
									break;
								default:
									console.log("ERROR: -maxFileSize need an argument as integer > 0 followed by 'k', 'M' or 'G' (arg was \"", arg+'")');
									errNb++;
							}
						}
					}
					break;
				case 'separateFiles':
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
				case 'startID':
					if(args.length < 1) {
						console.log('ERROR: -startID need an argument.');
						errNb++;
					} else {
						FIRST_METER_ID = args.shift()|0;
						if(FIRST_METER_ID < 0 || FIRST_METER_ID >= NB_METERS) {
							console.log('ERROR: -startID should be an integer between 0 and (meters number -1) (arg was "', FIRST_METER_ID+'"")');
							errNb++;
						}
					}
					break;
				case 'lastID':
					if(args.length < 1) {
						console.log('ERROR: -lastID need an argument.');
						errNb++;
					} else {
						LAST_METER_ID = args.shift()|0;
						if(LAST_METER_ID <= FIRST_METER_ID || LAST_METER_ID > NB_METERS) {
							console.log('ERROR: -lastID should be an integer between (startID+1 or 1) and (meters number) (arg was "', LAST_METER_ID+'"")');
							errNb++;
						}
					}
					break;
				case 'temp':
					console.log('WARNING: -temp is not working, and will always put \'20.00\' as temperature');
					wantTemperature = true;
					break;
				case 'location':
					wantLocation = true;
					break;
				case 'out':
					if(args.length < 1) {
						console.log('ERROR: -out need an argument.');
						errNb++;
					} else {
						filePath = args.shift();
					}
					break;
				default:
					console.log('ERROR: Unknown option:', arg);
					errNb++;
			}
		} else {
			console.log('ERROR: Unknown argument:', arg);
			errNb++;
		}
	}

	if(wantSeparateFile !==-1 && wantMaxFileSize) {
		console.log('ERROR: Cannot use -separateFiles and -maxFileSize together');
		errNb++;
	}

	if(errNb > 0) {
		console.log('\n',usageMessage);
		process.exit(-2); // Argument error
	}
} // free 'arg', 'args' and 'errNb' variables
// Parsing Arguments
//

//
// Check filePath
if(wantSeparateFile !== -1 || wantMaxFileSize) {
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

// Generating Meters information
const metersTab = generateMeters(CONFIG.climatZone);

// Generate Data
generateDataLoop(filePath, metersTab, FROM, TO, MINUTES_INTERVAL);

// close files
openFiles.forEach(closeFile);

process.exit(0);
//  //  //  //  // Execution End //  //  //  //  //
//      //      //               //      //      //


//      //      //           //      //      //
//  //  //  //  // Functions //  //  //  //  //


//
// Functions for accessing files
function getFile(fileName, createIfNotExists=true) {
	if(openFiles.has(fileName))
		return openFiles.get(fileName);

	if(!createIfNotExists)
		return null;

	const fileDescriptor = fs.openSync(fileName, 'w');
	openFiles.set(fileName, fileDescriptor);
	curFileSize = 0;

	const firstLine = ['date,index,sumHC,sumHP,type,vid,size'];
	if(wantTemperature)
		firstLine.push('temp');
	if(wantLocation)
		firstLine.push('city,region,lat,long');

	if(!appendToFile(fileName, firstLine)) { // should be after 'openFiles.set' to not have infinite recursive loop
		console.log("ERROR: Head line larger than given Max file size");
		process.exit(-3);
	}
	return fileDescriptor;
}

function appendToFile(fileName, tab) {
	const line = tab.join(',')+'\n';

	const fd = getFile(fileName);

	if(wantMaxFileSize) {
		curFileSize += Buffer.byteLength(line, 'utf8');
		if(curFileSize >= wantMaxFileSize)
			return false;
	}
	fs.appendFileSync(fd, line, 'utf-8');
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
/** 
 * return one of the values of the table passed in parameter, randomly choosen 
**/
function chooseBetween(...tab) {
    return tab[(Math.random()*tab.length)|0];
}
// Util functions
// 

//
// Preparing parser functions
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
// Preparing parser functions
//

//
// Main Functions
function generateMeters(climatZone) {
	const metersTab = [];
	const locations = getLocations(NB_METERS);
	const kmToLat = 0.00901329460; // 360/39941 = ( 360° / Earth circumference (polar) in km ) 
	const kmToLon = 0.00898315658; // 360/40075 = ( 360° / Earth circumference (equator) in km )

	let curr_id = 0;
	while(curr_id < FIRST_METER_ID) {
		const city = locations[0]; // city: {country,region,city,lattitude,longitude,radius,pop}

		const dec = (city.pop < FIRST_METER_ID-curr_id) ? city.pop : FIRST_METER_ID-curr_id;

		city.pop -= dec;
		curr_id += dec;

		if(city.pop===0)
			locations.shift();
		else if(city.pop < 0) {
			console.log("FATAL ERROR: CITY.POP < 0 (initLoop)");
			process.exit(-4);
		}
	}

	for(; curr_id < LAST_METER_ID; curr_id++) {
		const city = locations[0]; // city: {country,region,city,lattitude,longitude,radius,pop}

		if((--city.pop)===0)
			locations.shift();
		else if(city.pop < 0) {
			console.log("FATAL ERROR: CITY.POP < 0 (metergenLoop)");
			process.exit(-4);
		}

	    const meter = {};

	    // region ratio
	    if(climatZone.FRA.Mountains.has(city.region)) { // Mountains
	        meter.climat = 'Mountains';
	    } else if(climatZone.FRA.Continental.has(city.region)) { // Continental
	        meter.climat = 'Continental';
	    } else if(climatZone.FRA.Mediteranean.has(city.region)) { // Mediteranean
	        meter.climat = 'Mediteranean';
	    } else /*if(climatZone.FRA.Oceanic.has(meters.region))*/ { // Oceanic
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
			null, // date time (will be set later)
			0, // conso
	        0, // highcost
	        0, // lowcost
	        consumptionType,
	        'METER' + ('00000' + curr_id).slice(-6),
	       	houseSurface
	    ];
	    if(wantTemperature)
	        meter.line.push('20.00');

	    if(wantLocation) {
	    	// ÷2 (stddev should be radius/2)
	    	const latitude =  Rand.rnorm(city.latitude, city.radius*kmToLat/2);
	        const longitude = Rand.rnorm(city.longitude, city.radius*kmToLon/2);

	        meter.line.push(city.name);
	        meter.line.push(city.region);
	        meter.line.push(latitude.toFixed(6));
	        meter.line.push(longitude.toFixed(6));
	    }

	    // Add data to files for this meter
	    metersTab.push(meter);
	}

	return metersTab;
}

function generateDataLoop(filePath, metersTab, dateFrom, dateTo, minutesInterval) {

	let lastDateHour = 25; // force nextDay for first date
	let season;
	let dayOfWeek;
	let fileName = filePath;

	for(let d=moment(dateFrom); d<=dateTo; d.add(minutesInterval, 'minutes')) { // For each period of time
		const dateHour = d.format('HH')|0;
		if(lastDateHour > dateHour) { // next day 
			for(let i=metersTab.length-1; i>=0; i--) {
				metersTab[i].highcost = 0;
		        metersTab[i].lowcost = 0;
			}

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

	    if(!wantMaxFileSize && wantSeparateFile > 0) { // if wantSeparateFile === -1 && !wantMaxFileSize: fileName = filePath
	    	let fileMoment = d.valueOf() - dateFrom.valueOf(); // dateTo have the first file number equivalent dateTo the dateFrom
	    	fileMoment /= 60000*minutesInterval*wantSeparateFile; // divide by wanted interval numbers
	    	fileMoment |= 0; // parseInt dateTo get the interval number
	    	fileMoment *= 60000*minutesInterval*wantSeparateFile; // find the date corresponding dateTo the file number
	    	fileMoment = moment(dateFrom.valueOf()+fileMoment).format('YYYY_MM_DD-HH_mm_ss'); // dateTo string

	    	fileName = filePath + fileMoment + '.csv';
	    }

		for(let i=metersTab.length-1; i>=0; i--) { // For each meter
			const meter = metersTab[i];
			if(wantSeparateFile===0) {
				fileName = filePath + meter.line[5] + '.csv';
			}

 			// DataConsumption[energyType][surface]
			//  energyType = meter.consumptionType==='electric'?'elec':'gas';
			//  surface = 's'+meter.houseType;
			const subConfig = CONFIG.DataConsumption[meter.line[4]]['s'+meter.line[6]];

		    const avg = subConfig[season][dayOfWeek][dayTime].avg * CONFIG.climats[meter.climat][season].RatioAvg;
		    const stdev = subConfig[season][dayOfWeek][dayTime].stddev * CONFIG.climats[meter.climat][season].RatioStddev;
		    const curr_conso = Rand.rnorm(avg, stdev) / (1440 / minutesInterval);

		    //
		    // Update Line
		    meter.line[1] += curr_conso; // conso
		    meter.line[(dateHour>6 && dateHour<22)?3:2] += curr_conso*0.001; // (if in [7h - 21h] so highcost then lowcost), convert to KWh
		    meter.line[0] = d.format();

		    //if(wantTemperature) 
		    	//meter.line[7] = TODO;
		    // Update Line
		    //

		    //
		    // Write line to file
		    if(wantMaxFileSize) {
				if(!appendToFile(filePath + fileNb + '.csv', meter.line)) {
					fileNb++;
					if(!appendToFile(filePath + fileNb + '.csv', meter.line)) {
						console.log("ERROR: Line of data larger than given Max file size");
						process.exit(-3);
					}
				}
			} else { // fileName was computed in loop
		       	appendToFile(fileName, meter.line);
		    }
		    // Write to file
		    // 
		}
	}
}
// Main Functions
// 