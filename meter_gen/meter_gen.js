#!/usr/bin/env node

/*
  Meter csv data generator
  GridPocket Copyrights 2016, IOSTACK project www.iostack.eu
  Authors : Guillaume PILOT, Dien Hoa TRUONG, Kevin FOUHETY GridPocket SAS

  Usage : 
  ./meter_gen [number of meters [1-1 million user] [period_from] [period_to] [interval_minutes] [-separateFile] [-temp] [-location]
 */

// Example Argument: ./meter_gen.js 3 '30/01/2015' '31/01/2015' 10 -separateFile

//Library
var moment = require('moment');
var fs = require('fs');
var locations = require('./city.json');
var iso3 = require('./iso3.json')
var rand  =  require('randgen');
var extend = require('util')._extend;

//Variables
var MAX_RANDOM_INDEX = 1000;
var MAX_RANDOM_TEMP = 35;
var TOTAL_DENSITY = 486;
var TOTAL_POPULATION = 64886015;
var OUTFOLDER = "./out/";
var COUNTER = 1;
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
var WANT_HOUSE;// = myArgs[7];

for (var i = 4; i < myArgs.length; i++) {
	if(myArgs[i]==="-separateFile") WANT_SEPARATEFILE=myArgs[i];
	if(myArgs[i]==="-temp") WANT_TEMP=myArgs[i];
	if(myArgs[i]==="-location") WANT_LOCATION=myArgs[i];
	if(myArgs[i]==="-house") WANT_HOUSE=myArgs[i];
}

console.log(myArgs);
console.log('Generate', NB_METERS, 'meters data between', FROM, 'and', TO, 'with interval of', MINUTES_INTERVAL, 'minutes.');

// Function to Shuffle the locations[] 
function shuffle(array) {
    var counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
// variable to hold the shuffle index 
var a= [];
var totalDensity= 0;
for (var i=0;i<=locations.length-1;i++) {
    a[i]=i;
}


a = shuffle(a);



//Generate meter informations with location and meterID
var totaldensity = 0
var modulo = 0;
var cityNb = locations.length;
var meters = [];
var rest = 0;
var elapsedTime = 0;
var startTime = new Date().getTime();
for (var i = 0; i < NB_METERS; i++){
    modulo = i % cityNb;
    totalDensity = totalDensity + locations[a[modulo]].density
}
stepTime = new Date().getTime() - startTime;

for (var i = 1; meters.length < NB_METERS; i++) {
    modulo = meters.length % cityNb;
    ratio = (locations[a[modulo]].density * NB_METERS) /totalDensity
    if (locations[a[modulo]].density =! 0){
        rest =  NB_METERS - meters.length 
        for(j = 0; j < ratio && j <= rest; j++)
        {
            var meter = {
            l : locations[a[modulo]].l,
            country : locations[a[modulo]].country,
            region : locations[a[modulo]].region,
            city : locations[a[modulo]].city,
            p : locations[a[modulo]].p,
            latitude : locations[a[modulo]].latitude,
            longitude : locations[a[modulo]].longitude,
            m : locations[a[modulo]].m,
            a : locations[a[modulo]].a,
            population : locations[a[modulo]].population,
            density : locations[a[modulo]].density,
            densityTotal : locations[a[modulo]].densityTotal,
            highcost : 0,
            lowcost : 0,
            conso : 0,
            houseType : "5"
            }
            var house = Math.floor((Math.random() * 4) + 1);
            if (house == "1"){
                meter.houseType = JSON.stringify(20);
            }
            else if (house == "2"){
                meter.houseType = JSON.stringify(50);
            }
            else if (house == "3"){
                meter.houseType = JSON.stringify(70);
            }
            else if (house == "4"){
                meter.houseType = JSON.stringify(100);
            }
            meters.push(meter);
        }
    }
    else
    {
        cityNb --
    }    
}
secondStepTime = new Date().getTime() - startTime;
meters = shuffle(meters);
totalconso = 0


// Create folder if want separate files
if(WANT_SEPARATEFILE){
	OUTFOLDER=OUTFOLDER+moment().format('YYYYMMDDHHmmss')+'/';
	fs.mkdirSync(OUTFOLDER);
}else{
	FILENAME = OUTFOLDER+"meter_gen-"+moment().format('YYYYMMDDHHmmss')+".csv";
}


//Generate CSV file
fs.appendFileSync(FILENAME, "date,index,sumHC,sumHP,vid,city,lat,long,population\n");
for (var d = moment(FROM, 'DD/MM/YYYY'); d <= moment(TO, 'DD/MM/YYYY'); d.add(MINUTES_INTERVAL, 'minutes')) {
    for (var i = 1; i < meters.length; i++) {
        var meter = meters[i];
        // Choose the Consumption depend on the situation
        if ((d.format('MM')<'11') && (d.format('MM')>'03')) { // Hot season (March -> November)
            if ((d.format('dddd') != "Sunday")&&(d.format('dddd') != "Saturday")) { // Working day (MTWTF)
                if ( (d.format('HH:mm')<='06:00') && (d.format('HH:mm')>='00:00') ) { // Night
                    if (meter.houseType == "20"){
                        meters[i].conso = rand.rnorm(200, 20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso = rand.rnorm(200,20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso = rand.rnorm(200,20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso = rand.rnorm(200,20)/(60/MINUTES_INTERVAL);
                    }
                }
                if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'06:00') ) {
                    if (meter.houseType == "20"){
                        meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
                    }
                    else if (meter.houseType == "50"){
                        meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
                    }
                    else if (meter.houseType == "70"){
                        meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
                    }
                    else if (meter.houseType == "100"){
                        meter.conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL); 
                    }
                }
                if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') ) {
                    if (meter.houseType == "20"){
                        meter.conso = rand.rnorm(200, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meter.conso = rand.rnorm(200, 30)/(60/MINUTES_INTERVAL);  
                    }
                    else if (meter.houseType == "70"){
                        meter.conso = rand.rnorm(200, 30)/(60/MINUTES_INTERVAL); 
                    }
                    else if (meter.houseType == "100"){
                        meter.conso = rand.rnorm(200, 30)/(60/MINUTES_INTERVAL); 
                    }
                }
                if ( d.format('HH:mm')>'17:00' ) {
                    if (meter.houseType == "20"){
                        meter.conso = rand.rnorm(800, 100)/(60/MINUTES_INTERVAL); 
                    }
                    else if (meter.houseType == "50"){
                        meter.conso = rand.rnorm(800, 100)/(60/MINUTES_INTERVAL);  
                    }
                    else if (meter.houseType == "70"){
                        meter.conso = rand.rnorm(800, 100)/(60/MINUTES_INTERVAL); 
                    }
                    else if (meter.houseType == "100"){
                        meter.conso = rand.rnorm(800, 100)/(60/MINUTES_INTERVAL);    
                    }
                }

            } else { // Weekend
                if ( (d.format('HH:mm')<='07:00') && (d.format('HH:mm')>='00:00') ) {
                    meters[i].conso = rand.rnorm(200, 20)/(60/MINUTES_INTERVAL); 
                }
                if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'07:00') ) {
                    meters[i].conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL);
                }
                if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') ) {
                    meter.conso = rand.rnorm(700, 80)/(60/MINUTES_INTERVAL);
                }
                if ( d.format('HH:mm')>'17:00' ) {
                    meter.conso = rand.rnorm(900, 100)/(60/MINUTES_INTERVAL);
                }
            }
        } else { // Cold Season
            if ((d.format('dddd') != "Sunday")&&(d.format('dddd') != "Saturday")) { // Working day
                //between midnigth and 6h
                if ( (d.format('HH:mm')<='06:00') && (d.format('HH:mm')>='00:00') ) {
                    if (meter.houseType == "20"){
                        meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso = rand.rnorm(600*2,20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso = rand.rnorm(600*3,20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso = rand.rnorm(600*4,20)/(60/MINUTES_INTERVAL);
                    }
                }//between 6h and 9h
                if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'06:00') ) {
                    if (meter.houseType == "20"){
                        meters[i].conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso= rand.rnorm(700, 80)/(60/MINUTES_INTERVAL);
                    }
                }//between 9h and 17h
                if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') ) {
                    if (meter.houseType == "20"){
                        meters[i].conso= rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso= rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                }//plus de 17h
                if ( d.format('HH:mm')>'17:00' ){
                    if (meter.houseType == "20"){
                        meters[i].conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso = rand.rnorm(400, 30)/(60/MINUTES_INTERVAL);
                    }

                }

            } else { // Weekend between midnigth and 7h00
                if ( (d.format('HH:mm')<='07:00') && (d.format('HH:mm')>='00:00') ) {
                    if (meter.houseType == "20"){
                        meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso = rand.rnorm(600, 20)/(60/MINUTES_INTERVAL);
                    }
                } //
                else if ( (d.format('HH:mm')<'09:00') && (d.format('HH:mm')>'07:00') ) {
                    if (meter.houseType == "20"){
                        meters[i].conso= rand.rnorm(800, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso= rand.rnorm(800, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso= rand.rnorm(800, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso= rand.rnorm(800, 80)/(60/MINUTES_INTERVAL);
                    }
                }
                else if ( (d.format('HH:mm')<='17:00') && (d.format('HH:mm')>='09:00') ) {
                    if (meter.houseType == "20"){
                        meters[i].conso= rand.rnorm(900, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso= rand.rnorm(900, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso= rand.rnorm(900, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso= rand.rnorm(900, 80)/(60/MINUTES_INTERVAL);
                    }
                }
                else if ( d.format('HH:mm')>'17:00' ) {
                    if (meter.houseType == "20"){
                        meters[i].conso= rand.rnorm(1100, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "50"){
                        meters[i].conso= rand.rnorm(1100, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "70"){
                        meters[i].conso= rand.rnorm(1100, 80)/(60/MINUTES_INTERVAL);
                    }
                    else if (meter.houseType == "100"){
                        meters[i].conso= rand.rnorm(1100, 80)/(60/MINUTES_INTERVAL);
                    }
                }

            }	
        }
        // Calculate the Consumption in zone hight cost or low cost
        if ((d.format('HH:mm') <= '06:00')||(d.format('HH:mm')>= '22:00')){
            meter.highcost += meter.conso
        } else {
            meter.lowcost += meter.conso
        }

        var line = [];

        line.push(d.format());
        line.push(meter.conso);
        line.push(0.001*meter.highcost); // convert to KWh
        line.push(0.001*meter.lowcost)
        var id = ('00000' + i).slice(-6); 
        meter.vid = 'METER'+id;
        line.push(meter.vid);
        if(WANT_TEMP) line.push(parseFloat((Math.r_ndom() * MAX_RANDOM_TEMP*100)/100).toFixed(2));
        if(WANT_LOCATION){
            line.push(meter.city);
            randLatitude = Math.random() * (0.006) - 0.0030.toFixed(4)
            randLongitude = Math.random() * (0.006) - 0.0030.toFixed(4)
            meter.latitude = meter.latitude + randLatitude
            meter.longitude = meter.longitude + randLongitude
            line.push(meter.latitude);
            line.push(meter.longitude);
            line.push(meter.population);
        }
        line.push(meter.houseType + "m²");
        
        if(WANT_SEPARATEFILE) FILENAME=OUTFOLDER+meter.vid+'.csv';
        fs.appendFileSync(FILENAME, line.join(',').toString() + "\n");
        

    }
}
elapsedTime = new Date().getTime() - (startTime + stepTime + secondStepTime);
console.log("First Step, execution time:", stepTime)
console.log("Second Step, execution time:", secondStepTime)
console.log("Total execution time:", elapsedTime);
