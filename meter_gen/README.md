# Meter_gen
Meter_gen is an application generating synthetic datasets similar to real smart meters logs.  
All data (indexes, temperature, locations) are generated using random and statistics only, and are not real values. 

The application needs the following paramenters:

- -metersNumber [integer]
- -firstDate [YYYY-MM-DDTHH:mm as string]
- -lastDate [YYYY-MM-DDTHH:mm as string]
- -interval [integer]
- -consumptionsFile [.json file]
- -climatFile [.json file]
- -profilFile [.json file]
- -locationsFile [.json file]

The application accepts the following options:

- -config [.json file]
- -metersType ['elec'/'electric'/'gas'/'mix'/'mixed']
- -maxFileSize [size]
- -firstID [integer]
- -lastID [integer]
- -temp [boolean]
- -meteoFile [file]
- -location [boolean]
- -out [file name template]
- -debug [boolean]
- -help

The parameters and options can be set in the command line, or in a json config file (see -config option).  
(More details for parameters and options in usageMessage.txt)

# Folder structure

```
project-iostack/
    - meter_gen/
        - configs/
        - workingTest/
        - statistics/
        - [implementation1]
        - [implementation2]
        - ...
```

# Implementations

The meter gen have multiple implementations in different languages.  
For each implementation, there will be one folder.

For example, for the javascript implementation of the meter gen, see the folder `project-iostack/meter_gen/js/`.

# Configs

Contains a set of configurations for meter_gen to be used as examples.

```
configs/
        - climats.json
        - consumptions.json
        - iso3.json
        - locations.json
        - meteoData.json
        - profils.json
```

# Working Test

Contains a script for testing that meter_gen implementation works.  
Will test for every functionality to help finding problems.

```sh
sh workingTest.sh "./meter_gen/[implem]/meter_gen.sh"
```

# Statistics

Contains script for testing speed of meter_gen implementations.

```sh
sh perfTest.sh "./meter_gen/[implem]/meter_gen.sh"
sh statGen.sh "./meter_gen/[implem]/meter_gen.sh"
```

## Installation
```sh
sh ./meter_gen/[implem]/compile.sh
```

# Execution
print help:

```shell
sh ./meter_gen/[implem]/meter_gen.sh -h
```

Generating data:

```shell
sh ./meter_gen/[implem]/meter_gen.sh (-options...)
```

## Examples

### Examples with all options in command line
Note that a `./config.json` file should not exists to get the follwing results  
(however, the options set in this config file will be used too)

```shell
# Generating for 1000 meters in houses, all the meters (vid 0 till 999)
# 1 data each hour (60minutes interval) since January 1st 2016 00h00 to December 31th 2017 00h00 (but no others data for 31th of December)
# Generate all into files names {year}-{month}-{day}_{index}.csv ('./2016-01-01_1.csv' to './2017-12-31_42.csv');
# (with the folder name is the date when you launched meter_gen, here for example: May 5th 2017, 15h20"43)
sh meter_gen.sh -metersNumber 1000 -firstDate "2016-01-01T00:00" -lastDate "2017-12-31T00:00" -interval 60 -consumptionsFile './configs/consumption.json' -climatFile './configs/climats.json' -locationsFile './configs/locations.json' -profilsFile './configs/profils.json'

# Generating for 1000 meters in houses not using electric heater ('gas'), only the meters 250 till 499,
# 2 data each hour (30minutes interval) since January 1st 2016 00h00 to December 31th 2017 00h00 (but no others data for 31th of December)
# Generate all into multiples 1MB files that will be located into ./out/ folder, files named {year}-{index}.csv (2016-1.csv 2016-2.csv ... 2017-1.csv)
# adding locations and temperatures to generated file
sh meter_gen.sh -metersNumber 1000 -firstDate "2016-01-01T00:00" -lastDate "2017-12-31T00:00" -interval 30 -metersType 'gas' -consumptionsFile './configs/consumption.json' -climatFile './configs/climats.json' -locationsFile './configs/locations.json' \
	-maxFileSize 1M -firstID 250 -lastID 500 -location -temp -meteoFile './configs/meteoData.json' -out './out/%Y-%N.csv'
```

### Examples using config file
Config file `./config.json`:

```json
{	"metersNumber":1000,
	"firstDate":"2016/02/01",
	"lastDate":"2016/05/01",
	"interval": 120, // each meter will generate 1 data every this interval in minutes of time (here 2h)
	"metersType": "electric", // only generate data for meters in houses using elecrtical heat
	"consumptionsFile": "./configs/consumptions.json",
	"climatFile": "./configs/climats.json",
	"locationsFile": "./configs/locations.json",
	"meteoFile": "./configs/meteoData.json",
    "profilFile": "./configs/profils.json",
	"debug":true // print progressing status while generating
}
```

Command:

```shell
# using default config file ./config.json
# Generating for 1000 meters in houses using electric heater, the meters 0 till 999
# 2 data each hour (120minutes interval) since Ferbuary 1st 2016 00h00 to May 1st 2016 00h00 (but no others data for 1st of May)
# Generate all into files names {year}-{month}-{day}_{index}.csv ('./2016-01-01_1.csv' to './2017-12-31_42.csv');
# (with the folder name is the date when you launched meter_gen, here for example: May 5th 2017, 15h20"43)
# printing progressing status and memory consumption to console while generating (-debug option)
sh meter_gen.sh

# using default config file ./config.json
# Generating for 1234 meters (overriding config file) in houses using electric heater, the meters 500 till 1233
# 2 data each hour (120minutes interval) since Ferbuary 1st 2016 00h00 to May 1st 2016 00h00 (but no others data for 1st of May)
# Generate all into files names {year}-{month}-{day}_{index}.csv ('./2016-01-01_1.csv' to './2017-12-31_42.csv');
# (with the folder name is the date when you launched meter_gen, here for example: May 5th 2017, 15h20"43)
# adding locations and temperatures to generated file (meteoFile is defined in config.json)
# not printing progressing status to console (-debug false overriding)
sh meter_gen.sh -metersNumber 1234 -firstID 500 -location -temp -debug false

# Generate data not using ./config.json but ./anotherConfig.json
sh meter_gen.sh -config './anotherConfig.json'
```
	
# Example of generated csv file content:

Row sample:

```csv
vid,date,index,sumHC,sumHP,type,size,temp,city,region,lat,lng
METER000000,2016-01-01T00:00:00+01:00,40.54,0.04054,0,gas,50,0.49,Ambérieu-en-Bugey,1,45.936562,5.366017
METER000647,2016-01-01T00:00:00+01:00,187.88,0.18788,0,elec,70,3.30,Paris,75,48.825463,2.330183
METER000999,2016-01-01T00:00:00+01:00,145.97,0.14597,0,elec,100,7.05,Bastia,2B,42.701160,9.445350
...
```

as a Table:

| vid | date | index | sumHC | sumHP | type | size | temp | city | region | lat | lng |
| --- | ---- | ----- | ----- | ----- | ---- | ---- | ---- | ---- | ------ | --- | --- |
| METER000000 | 2016-01-01T00:00:00+01:00 | 40.54 | 0.04054 | 0 | gas | 50 | 0.49 | Ambérieu-en-Bugey | 1 | 45.936562 | 5.366017
| METER000647 | 2016-01-01T00:00:00+01:00 | 187.88 | 0.18788 | 0 | elec | 70 | 3.30 | Paris | 75 | 48.825463 | 2.330183
| METER000999 | 2016-01-01T00:00:00+01:00 | 145.97 | 0.14597 | 0 | elec | 100 | 7.05 | Bastia | 2B | 42.701160 | 9.445350

# See the Wiki for more information

GitHub Wiki: https://github.com/gridpocket/project-iostack/wiki/Meter_gen

# Licence
GridPocket SAS Copyright (C) 2016-2017.  
This source is property of GridPocket SAS. Please email contact@gridpocket.com for more information.

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,  
software distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and limitations under the License.
 
Contributors : Guillaume Pilot, Filip Gluszak, César Carles, Nathaël Noguès  
Created at:         2016-01-25  
Last Modified by:   Nathaël Noguès  
Last Modified time: 2017-08-17  