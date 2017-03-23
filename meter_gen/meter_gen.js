#!/usr/bin/env node

/*
  Meter csv data generator
  GridPocket Copyrights 2016, IOSTACK project www.iostack.eu
  Authors : Guillaume PILOT, Dien Hoa TRUONG, Kevin FOUHETY, César CARLES GridPocket SAS

  Usage : 
  ./meter_gen [number of meters [1-1 million user] [period_from] [period_to] [interval_minutes] [-separateFile] [-temp] [-location]
 */

// Example Argument: ./meter_gen.js 3 '30/01/2015' '31/01/2015' 10 -separateFile

//Library
var moment = require('moment');
var fs = require('fs');
var locations = require('./locations.json');
var iso3 = require('./iso3.json')
var rand = require('randgen');
var extend = require('util')._extend;
var Type = require('type-of-is');

dateStart = moment.now()

//Variables
var MAX_RANDOM_INDEX = 1000;
var MAX_RANDOM_TEMP = 35;
var TOTAL_DENSITY = 486;
var TOTAL_POPULATION = 64886015;
var OUTFOLDER = "./out/";
var STATUS = 0;
var FILENAME;

//Args variables
var myArgs = process.argv.slice(2);


Type(parseInt(myArgs[0]))
if (parseInt(myArgs[0]) <= 0) {
    console.log("ERROR: number of meters should be between 1 and 1 millions");
} else {
    var NB_METERS = myArgs[0] || 10;
    STATUS += 1;
}

testDateFrom = moment(myArgs[1], "DD/MM/YYYY", true).isValid()
if (testDateFrom == false) {
    console.log("ERROR: check your date \"from\"")
} else {
    var FROM = myArgs[1] || '01/01/2016';
    STATUS += 1;
}

testDateTo = moment(myArgs[2], "DD/MM/YYYY", true).isValid()
if (testDateTo == false) {
    console.log("ERROR: check your date \"to\"")
} else {
    var TO = myArgs[2] || '01/01/2016';
    STATUS += 1;
}

if (parseInt(myArgs[3]) <= 0) {
    console.log("ERROR: interval of minute should be more than 0");
} else {
    var MINUTES_INTERVAL = myArgs[3] || 60;
    STATUS += 1;
}

if (myArgs[4] != "electric" && myArgs[4] != "gas" && myArgs[4] != "mixed") {
    console.log("ERROR: choose between electric or gas")
} else {
    var TYPE = myArgs[4];
    STATUS += 1;
}

var WANT_SEPARATEFILE; // = myArgs[5];
var WANT_TEMP; // = myArgs[6];
var WANT_LOCATION; // = myArgs[7];

for (var i = 5; i < myArgs.length; i++) {
    if (myArgs[i] === "-separateFile") WANT_SEPARATEFILE = myArgs[i];
    if (myArgs[i] === "-temp") WANT_TEMP = myArgs[i];
    if (myArgs[i] === "-location") WANT_LOCATION = myArgs[i];
    if (myArgs[i] === "-house") WANT_HOUSE = myArgs[i];
}

if (STATUS == 5) {
    console.log('Generate', NB_METERS, 'meters data between', FROM, 'and', TO, 'with interval of', MINUTES_INTERVAL, 'minutes', "with", TYPE, ".");
}
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
var a = [];
var totalDensity = 0;
for (var i = 0; i <= locations.length - 1; i++) {
    a[i] = i;
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
for (var i = 0; i < NB_METERS; i++) {
    modulo = i % cityNb;
    totalDensity = totalDensity + locations[a[modulo]].density
}

for (var i = 1; meters.length <= NB_METERS; i++) {
    modulo = meters.length % cityNb;
    ratio = (locations[a[modulo]].density * NB_METERS) / totalDensity
    if (locations[a[modulo]].density = !0) {
        rest = NB_METERS - meters.length
        for (j = 0; j < ratio && j <= rest; j++) {
            var meter = {
                l: locations[a[modulo]].l,
                country: locations[a[modulo]].country,
                region: locations[a[modulo]].region,
                city: locations[a[modulo]].city,
                p: locations[a[modulo]].p,
                latitude: locations[a[modulo]].latitude,
                longitude: locations[a[modulo]].longitude,
                m: locations[a[modulo]].m,
                a: locations[a[modulo]].a,
                population: locations[a[modulo]].population,
                density: locations[a[modulo]].density,
                densityTotal: locations[a[modulo]].densityTotal,
                highcost: 0,
                lowcost: 0,
                conso: 0,
                houseType: "5",
                consumptionType: ""
            }

            var chooseBetween = (tab) => {
                return tab[(Math.random() * tab.length) | 0];
            }

            // chose one of the possibilities randomly, to Json, into houseType
            meter.houseType = JSON.stringify(chooseBetween([20, 50, 70, 100]));


            if (TYPE === "mixed") {
                meter.consumptionType = chooseBetween(["electric", "gas"]);
            } else if (TYPE === 'electric' || TYPE === 'gas') {
                meter.consumptionType = TYPE;
            }
            meters.push(meter);
        }
    } else {
        cityNb--;
    }
}
meters = shuffle(meters);
totalconso = 0

// Create folder if want separate files
if (WANT_SEPARATEFILE) {
    OUTFOLDER = OUTFOLDER + moment().format('YYYYMMDDHHmmss') + '/';
    fs.mkdirSync(OUTFOLDER);
}

FILENAME = OUTFOLDER + "meter_gen-" + moment().format('YYYYMMDDHHmmss') + ".csv";
INTERVAL_CALCULED = 1440 / MINUTES_INTERVAL
//Generate CSV file
fs.appendFileSync(FILENAME, "date,index,sumHC,sumHP,type,vid,city,lat,long,density,size\n");


DataConsumption = 
    {

        ColdSeason: 
        {
            WorkingDay: 
            {
                Night: //00h -> 6h 
                {
                    Gas: {
                        "20m": {
                            Average: 655,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1113,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1571,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 1899,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 2946,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 5532,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 8085,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 10379,
                            EcartType: 30
                        }
                    }
                },
                Morning: //6h -> 9h 
                {
                    Gas: {
                        "20m": {
                            Average: 764,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1299,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1833,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2215,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 3438,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 6454,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 9433,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 12108,
                            EcartType: 30
                        }
                    }
                },
                Day: {
                    Gas: {
                        "20m": {
                            Average: 436,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 742,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1048,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 1266,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 1964,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 3688,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 5390,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 6919,
                            EcartType: 30
                        }
                    }
                },
                Evening: {
                    Gas: {
                        "20m": {
                            Average: 1200,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 2041,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 2881,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 3481,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 5402,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 10142,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 14823,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 19027,
                            EcartType: 30
                        }
                    }
                }
            },
            Weekend: {
                Night: //00h -> 6h 
                {
                    Gas: {
                        "20m": {
                            Average: 539,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 917,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1294,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 1564,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 2946,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 5532,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 8085,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 10379,
                            EcartType: 30
                        }
                    }
                },
                Morning: //7h -> 9h 
                {
                    Gas: {
                        "20m": {
                            Average: 719,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1222,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1725,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2085,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 3929,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 7376,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 10780,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 13838,
                            EcartType: 30
                        }
                    }
                },
                Day: {
                    Gas: {
                        "20m": {
                            Average: 809,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1375,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1941,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2345,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 4420,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 8298,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 12128,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 15568,
                            EcartType: 30
                        }
                    }
                },
                Evening: {
                    Gas: {
                        "20m": {
                            Average: 988,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1680,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 2372,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2867,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 5402,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 10142,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 14823,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 19027,
                            EcartType: 30
                        }
                    }
                }
            }
        },
        HotSeason: //March to November
        {
            WorkingDay: //Monday to Friday
            {
                Night: //00h -> 6h 
                {
                    Gas: {
                        "20m": {
                            Average: 263,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 447,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 632,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 763,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 1184,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 2223,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 3249,
                            EcartType: 80
                        },
                        "100m": {
                            Average: 4171,
                            EcartType: 80
                        }
                    }
                },
                Morning: //6h -> 9h 
                {
                    Gas: {
                        "20m": {
                            Average: 921,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1566,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 2210,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2671,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 4145,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 7782,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 11373,
                            EcartType: 80
                        },
                        "100m": {
                            Average: 14599,
                            EcartType: 80
                        }
                    }
                },
                Day: {
                    Gas: {
                        "20m": {
                            Average: 263,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 447,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 632,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 763,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 1184,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 2223,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 3249,
                            EcartType: 80
                        },
                        "100m": {
                            Average:  4171,
                            EcartType: 80
                        }
                    }
                },
                Evening: {
                    Gas: {
                        "20m": {
                            Average: 1052,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1789,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 2526,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 3052,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 4737,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 8894,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 12998,
                            EcartType: 80
                        },
                        "100m": {
                            Average: 16685,
                            EcartType: 80
                        }
                    }
                }
            },
            Weekend: {
                Night: //00h -> 6h 
                {
                    Gas: {
                        "20m": {
                            Average: 208,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 354,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 500,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 604,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 1184,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 2223,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 3249,
                            EcartType: 80
                        },
                        "100m": {
                            Average: 4171,
                            EcartType: 80
                        }
                    }
                },
                Morning: //7h -> 9h 
                {
                    Gas: {
                        "20m": {
                            Average: 729,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1240,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1750,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2114,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 4145,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 7782,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 11373,
                            EcartType: 80
                        },
                        "100m": {
                            Average: 14599,
                            EcartType: 80
                        }
                    }
                },
                Day: {
                    Gas: {
                        "20m": {
                            Average: 729,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1240,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 1750,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2114,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 4145,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 7782,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 11373,
                            EcartType: 80
                        },
                        "100m": {
                            Average:  14599,
                            EcartType: 80
                        }
                    }
                },
                Evening: {
                    Gas: {
                        "20m": {
                            Average: 833,
                            EcartType: 30
                        },
                        "50m": {
                            Average: 1417,
                            EcartType: 30
                        },
                        "70m": {
                            Average: 2000,
                            EcartType: 30
                        },
                        "100m": {
                            Average: 2417,
                            EcartType: 30
                        }
                    },
                    Electric: {
                        "20m": {
                            Average: 4737,
                            EcartType: 80
                        },
                        "50m": {
                            Average: 8894,
                            EcartType: 80
                        },
                        "70m": {
                            Average: 12998,
                            EcartType: 80
                        },
                        "100m": {
                            Average: 16685,
                            EcartType: 80
                        }
                    }
                }
            }
        }

            }


for (var d = moment(FROM, 'DD/MM/YYYY'); d <= moment(TO, 'DD/MM/YYYY'); d.add(MINUTES_INTERVAL, 'minutes')) {
    for (var i = 1; i < meters.length; i++) {
        var meter = meters[i];
        
        // Choose the Consumption depend on the situation
        if ((d.format('MM') < '11') && (d.format('MM') > '03')) // Hot season (March -> November)
        { 
            CalculConsumptionSeason = 'HotSeason';
        }
        else
        {
            CalculConsumptionSeason = 'ColdSeason';
        }
        
        if ((d.format('dddd') != "Sunday") && (d.format('dddd') != "Saturday")) // Working day (MTWTF)
        {
            CalculConsumptionDay = 'WorkingDay';
        }
        else
        {
            CalculConsumptionDay = 'Weekend';
        }
        
        if ((d.format('HH:mm') <= '06:00') && (d.format('HH:mm') >= '00:00')) // Night (00h -> 9H)
        {
            CalculConsumptionTime = 'Night';
        }
        else if ((d.format('HH:mm') < '09:00') && (d.format('HH:mm') > '06:00')) // Morning (6h -> 9h)
        {
            CalculConsumptionTime = 'Morning';
        }
        else if ((d.format('HH:mm') <= '17:00') && (d.format('HH:mm') >= '09:00')) // Day (9h -> 17h)
        {
            CalculConsumptionTime = 'Day';
        }
        else if ((d.format('HH:mm') <= '07:00') && (d.format('HH:mm') >= '00:00')) // Evening(17h -> 23h59)
        {
            CalculConsumptionTime = 'Night';
        }
        
        if (meter.consumptionType == 'electric') 
        {
            CalculConsumptionType = 'Electric';
        }
        else
        {
            CalculConsumptionType = 'Gas';
        }
        
        if (meter.houseType == "20")
        {
            CalculHouseSize = "20m"
        }
        else if (meter.houseType == "50")
        {
            CalculHouseSize = "50m"
        } 
        else if (meter.houseType == "70")
        {
            CalculHouseSize = "70m"
        } 
        else if (meter.houseType == "100")
        {
            CalculHouseSize = "100m"
        } 
        CalculRegionRatioAvg = 1
        CalculRegionRatioEcart = 1
        if(0 <= [7, 26, 30, 84, 4, 6, 83, 13, 34, 31, 11].indexOf(meters[i].region)) //Mediteranean
        {
            if(CalculConsumptionSeason == 'ColdSeason')
            {
                CalculRegionRatioAvg = 0.66
                CalculRegionRatioEcart = 1.24
            }
            else
            {
                CalculRegionRatioAvg = 0.84
                CalculRegionRatio = 1.13
            }
            
        }
        else if (0 <= [29, 22, 56, 35, 44, 85, 49, 79, 17, 16, 33, 40, 32, 82, 47, 24, 46, 19, 87, 53, 37, 50, 14, 76, 80, 62, 59, 2, 8, 51, 10, 89, 58, 91].indexOf(meters[i].region)) // Oceanic
        {
            if(CalculConsumptionSeason == 'ColdSeason')
            {
                CalculRegionRatioAvg = 0.87
                CalculRegionRatioEcart = 1.00
            }
            else
            {
                CalculRegionRatioAvg = 1.03
                CalculRegionRatio = 0.98
            }
        }
        else if (0 <= [64, 65, 9, 66, 81, 12, 68, 15, 23, 63, 43, 42, 38, 5, 73, 74, 39, 25, 88,  48].indexOf(meters[i].region)) //continental
        {
            if(CalculConsumptionSeason == 'ColdSeason')
            {
                CalculRegionRatioAvg = 1.72
                CalculRegionRatioEcart = 1.02
            }
            else
            {
                CalculRegionRatioAvg = 1.11
                CalculRegionRatioEcart = 0.96
            }
        }
        else if ( 0 <= [1, 55, 52, 70, 54, 57, 67, 90, 69, 20].indexOf(meters[i].region))//mountain
        {
            if(CalculConsumptionSeason == 'ColdSeason')
            {
                CalculRegionRatioAvg = 1.72
                CalculRegionRatioEcart = 1.02
            }
            else
            {
                CalculRegionRatioAvg = 1.11
                CalculRegionRatioEcart = 0.96
            }
        }  
       
        meters[i].conso = rand.rnorm((DataConsumption[CalculConsumptionSeason][CalculConsumptionDay][CalculConsumptionTime][CalculConsumptionType][CalculHouseSize]["Average"]*CalculRegionRatioAvg),( DataConsumption[CalculConsumptionSeason][CalculConsumptionDay][CalculConsumptionTime][CalculConsumptionType][CalculHouseSize]["EcartType"])*CalculRegionRatioEcart) / INTERVAL_CALCULED;
        // Calculate the Consumption in zone hight cost or low cost
        if ((d.format('HH:mm') <= '06:00') || (d.format('HH:mm') >= '22:00')) {
            meter.highcost += meter.conso;
        } else {
            meter.lowcost += meter.conso;
        }

        var line = [];

        line.push(d.format());
        line.push(meter.conso);
        line.push(0.001 * meter.highcost); // convert to KWh
        line.push(0.001 * meter.lowcost);
        line.push(meter.consumptionType);
        var id = ('00000' + i).slice(-6);
        meter.vid = 'METER' + id;
        line.push(meter.vid);
        if (WANT_TEMP)
            line.push((Math.random() * MAX_RANDOM_TEMP).toFixed(2));

        if (WANT_LOCATION) {
            line.push(meter.city);
            randLatitude = Math.random() * (0.007) - 0.0035.toFixed(4);
            randLongitude = Math.random() * (0.007) - 0.0035.toFixed(4);
            meter.latitude = meter.latitude + randLatitude;
            meter.longitude = meter.longitude + randLongitude;
            line.push(meter.latitude.toFixed(6));
            line.push(meter.longitude.toFixed(6));
            line.push(meter.population);
        }
        line.push(meter.houseType + "m²");

        if (WANT_SEPARATEFILE)
            FILENAME = OUTFOLDER + meter.vid + '.csv';

        fs.appendFileSync(FILENAME, line.join(',').toString() + "\n");
    }
}

dateEnd = moment.now()
console.log("Execution Time:", dateEnd - dateStart, "ms")

