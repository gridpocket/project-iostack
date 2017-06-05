# Meter_gen
Meter_gen is an application generating synthetic datasets similar to real smart meters logs.  
All data (indexes, temperature, locations) are generated using random and statistics only, and are not real values. 

The application needs the following paramenters:

- -metersNumber [integer]
- -beginDate [yyyy/mm/dd as string]
- -endDate [yyyy/mm/dd as string]
- -interval [integer]
- -consumptionsFile [.json file]
- -climatFile [.json file]
- -locationsFile [.json file]

The application accepts the following options:

- -config [.json file]
- -metersType ['elec'/'electric'/'gas'/'mix'/'mixed']
- -maxFileSize [size]
- -separateDataBy [integer]
- -startID [integer]
- -lastID [integer]
- -temp [boolean]
- -meteoFile [file]
- -location [boolean]
- -out [path]
- -fileNameExt [text]
- -debug [boolean]
- -help

The parameters and options can be set in the command line, or in a json config file (see -config option).  
(More details for parameters and options in usageMessage.txt)

# File Structure
```
meter_gen/                   // top folder
    -     meter_gen.js           // Meter gen application script
    -     package.json           // NPM package information
    -     usageMessage.txt       // How to use Meter gen (needed by meter_gen.js, do not move)
    -     README.md              // This file

    -     configs/               // folder containing sample configuration files 
            -     climats.json       // sample climats config file
            -     consumptions.json  // sample consumptions config file
            -     locations.json     // sample locations config file
            -     meteoData.json     // sample meteo config file

    -     workingTest/           // folder containing sample script using meter_gen
              -         ...      //    maily used as functional test

    -     statistics/            // folder containing sample scripts using meter_gen
            -        ...         //    mainly used to generate statistics (performance and data realistics)
```

The very important files to keep for meter_gen to work are `meter_gen.js`, `package.json` and `usageMessage.txt`.

# Requirement
NodeJS "moment" version 2.11.1 and up,
NodeJS "randgen" version 0.1.0 and up

## Installation
```sh
# in the folder containing meter_gen.js
npm install
```

# Execution
print help:

```shell
./meter_gen.js -h
./meter_gen.js -help
node meter_gen.js -h
node meter_gen.js -help
```

Generating data simple way:

```shell
./meter_gen.js (-options...)
node meter_gen.js (-options...)
```

Genrating data, using forced garbage collection (to monitor memory consumption more precisely):

```shell
node --expose-gc meter_gen.js (-options)
```

## Examples

### Examples with all options in command line
Note that a `./config.json` file should not exists to get the follwing results  
(however, the options set in this config file will be used too)

```shell
# Generating for 1000 meters in houses, all the meters (vid 0 till 999)
# 1 data each hour (60minutes interval) since January 1st 2016 00h00 to December 31th 2017 00h00 (but no others data for 31th of December)
# Generate all into only one file (default): './20170510152043/generated.csv'; 
# (with the folder name is the date when you launched meter_gen, here for example: May 5th 2017, 15h20"43)
node ./meter_gen.js -metersNumber 1000 -beginDate "2016/01/01" -endDate "2017/12/31" -interval 60 -consumptionsFile './configs/consumption.json' -climatFile './configs/climats.json' -locationsFile './configs/locations.json'

# Generating for 1000 meters in houses not using electric heater ('gas'), only the meters 250 till 499,
# 2 data each hour (30minutes interval) since January 1st 2016 00h00 to December 31th 2017 00h00 (but no others data for 31th of December)
# Generate all into multiples 1MB files that will be located into ./out/ folder, files named {startID}-{index}.csv (250-1.csv 250-2.csv ...)
# adding locations and temperatures to generated file
node ./meter_gen.js -metersNumber 1000 -beginDate "2016/01/01" -endDate "2017/12/31" -interval 30 -metersType 'gas' -consumptionsFile './configs/consumption.json' -climatFile './configs/climats.json' -locationsFile './configs/locations.json' \
	-maxFileSize 1M -startID 250 -lastID 500 -location -temp -meteoFile './configs/meteoData.json' -out './out/'
```

### Examples using config file
Config file `./config.json`:

```json
{	"metersNumber":1000,
	"beginDate":"2016/02/01",
	"endDate":"2016/05/01",
	"interval": 120,
	"metersType": "electric",
	"consumptionsFile": "./configs/consumptions.json",
	"climatFile": "./configs/climats.json",
	"locationsFile": "./configs/locations.json",
	"meteoFile": "./configs/meteoData.json",
	"debug":true
}
```

Command:

```shell
# using default config file ./config.json
# Generating for 1000 meters in houses using electric heater, the meters 0 till 999
# 2 data each hour (120minutes interval) since Ferbuary 1st 2016 00h00 to May 1st 2016 00h00 (but no others data for 1st of May)
# Generate all into only one file (default): './20170510152043/generated.csv'; 
# (with the folder name is the date when you launched meter_gen, here for example: May 5th 2017, 15h20"43)
# printing progressing status and memory consumption to console while generating (-debug option)
node ./meter_gen.js

# using default config file ./config.json
# Generating for 1234 meters (overriding config file) in houses using electric heater, the meters 500 till 1233
# 2 data each hour (120minutes interval) since Ferbuary 1st 2016 00h00 to May 1st 2016 00h00 (but no others data for 1st of May)
# Generate all into only one file (default): './20170510152043/generated.csv'; 
# (with the folder name is the date when you launched meter_gen, here for example: May 5th 2017, 15h20"43)
# adding locations and temperatures to generated file (meteoFile is defined in config.json)
# not printing progressing status to console (-debug false overriding)
node ./meter_gen.js -metersNumber 1234 -startID 500 -location -temp -debug false

# Generate data not using ./config.json but ./anotherConfig.json
node ./meter_gen.js -config './anotherConfig.json'
```
	
# Example of generated csv file content:
```csv
date,index,sumHC,sumHP,type,vid,size,temp,city,region,lat,lng
2016-02-01T00:00:00+01:00,255.8944154089721,0.2558944154089721,0,elec,METER000054,50,6.72,Paris,75,48.848158,2.327835
2016-02-01T00:00:00+01:00,215.99777334278065,0.21599777334278064,0,elec,METER000053,20,2.77,Chambéry,73,45.576691,5.944346
2016-02-01T00:00:00+01:00,380.5763987238543,0.3805763987238543,0,elec,METER000052,70,6.18,Le Mans,72,47.962022,0.198747
...
```

as a Table:

| date | index | sumHC | sumHP | type | vid | size | temp | city | region | lat | lng |
| ---- | ----- | ----- | ----- | ---- | --- | ---- | ---- | ---- | ------ | --- | ---- |
| 2016-02-01T00:00:00+01:00 | 255.894 | 0.255 | 0 | elec | METER000054 | 50 | 6.72 | Paris    | 75 | 48.848158 | 2.327835 |
| 2016-02-01T00:00:00+01:00 | 215.997 | 0.215 | 0 | elec | METER000053 | 20 | 2.77 | Chambéry | 73 | 45.576691 | 5.944346 |
| 2016-02-01T00:00:00+01:00 | 380.576 | 0.380 | 0 | elec | METER000052 | 70 | 6.18 | Le Mans  | 72 | 47.962022 | 0.198747 |

# See the Wiki for more information

GitHub Wiki: https://github.com/gridpocket/project-iostack/wiki/Meter_gen

# Licence
The meter_gen application is open source, free to modify and to be used for all non-commercial and commercial purposes.

Created by GridPocket SAS, for IOStack project
Email contact@gridpocket.com for more information.

Contributors : Guillaume Pilot, Filip Gluszak, César Carles, Nathaël Noguès  
Last Modified time: 2017-06-05  
Last Modified by:   Nathaël Noguès  