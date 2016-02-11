# Meter_gen
This application generates synthetic datasets similar to the utility smart meters logs.
All data (indexes, temperature, locations) is random. 

This application accepts following paramenters :
- number of meters to be simulated
- period of simulation from - to
- interval betwean measuring points
- availability of external temperature
- availability of location data
- separation of files for each user

The result files are location in /out 

# Requirement
This is a Nodejs script. You need to install nodejs (using nave for example) and Npm to install libraries

# Installation
	npm install
# Execution
	./meter_gen [# of users] [period_from] [period_to] [interval_minutes] [-temp] [-location] [-separateFile]

#Example : 
	./meter_gen.js 5 '01/01/2015' '31/12/2015' 10 -temp -location
	
#Exmple results file content:
	2015-01-01T00:00:00+01:00,135,METER000001,11.33,New York,40.717040,-73.98700
	2015-01-01T00:00:00+01:00,871,METER000002,30.15,New York,40.732509,-73.98935
	2015-01-01T00:00:00+01:00,361,METER000003,2.92,New Jersey,40.699226,-74.04118
	2015-01-01T00:00:00+01:00,359,METER000004,0.14,New York,40.706019,-74.00858
	...
	
# Information
This meter generator use a locations.json file to add city information. This locations.json file is a copy of another public Github repository on MIT Licence (<a href="https://github.com/sjlu/cities/">src</a>)

The meter_gen appliation is open source, free to modify and user for all purposes.

