# Meter_gen
This application generates synthetic datasets similar to the utility smart meters logs.
All data (indexes, temperature, locations) is random. 

This application accepts following paramenters :
- number of meters to be simulated
- period of simulation from - to
- interval between measuring points
- type of consumption
- availability of external temperature
- availability of location data
- separation of files for each user

The result files are location in /out 

# Requirement
This is a Nodejs script. You need to install nodejs (using nave for example) and Npm to install libraries

# Installation
	npm install
# Execution	
	./meter_gen [# of users] [period_from] [period_to] [interval_minutes] [type_consumption] [-temp] [-location] [-separateFile]

#Example : 
	./meter_gen.js 5 '01/01/2015' '31/12/2015' 10 gas -temp -location
	
#Exmple results file content:
	2015-01-01T00:00:00+00:00,11.186954289365412,0.011186954289365413,0,gas,METER000001,15.66,Montaigu,49.533108,3.833082,732,100m²
	2015-01-01T00:00:00+00:00,18.920511040566424,0.018920511040566426,0,gas,METER000002,1.25,Belvézet,44.548239,3.753488,92,70m²
	2015-01-01T00:00:00+00:00,4.124213316144373,0.0041242133161443735,0,gas,METER000003,18.68,Montaigu,49.532154,3.832823,732,20m²
	2015-01-01T00:00:00+00:00,12.960750499352578,0.012960750499352578,0,gas,METER000004,13.72,Trémoulet,43.165460,1.715176,101,50m²
	...
	
# Information
This meter generator use a locations.json file to add city information. This locations.json file is a copy of data base from a french site (<a href="http://sql.sh/736-base-donnees-villes-francaises">src</a>)
Number of users: 1 -> 1000000
Type of consumption: gas / electric / mixed

Consumption is calculated by differents parameters:
	-Time (4 possibilities (00h -> 06h, 06h -> 9h, 9h > 17h, 17h -> 00h))
	-Days (2 possibilities (working day or weekend))
	-Season (2 possibilities (Hot season, Cold Season))
	-Size of accommodations (4 possibilites (20m², 50m², 70m², 100m²))
	-Type of Consumption (2 possibilities (Gas or Electric)) 


The meter_gen application is open source, free to modify and to be used for all non-commercial and commercial purposes.

Contributors : Guillaume Pilot, Filip Gluszak, César Carles - GRIDPOCKET SAS - IOStack project 2016

