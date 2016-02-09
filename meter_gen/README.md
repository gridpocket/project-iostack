# Requirement
This is a Nodejs script. You need to install nodejs (using nave for example) and Npm to install libraries

# Installation
	npm install
# Execution
	./meter_gen [number of meters [1-1 million user] [period_from] [period_to] [interval_minutes] [-temp] [-location]
For example, generate data for 20 persons (meter) for 01/01/2016 all 10 minutes in separate files with temperature data and location data
	./meter_gen.js 20 '01/01/2016' '01/01/2016' 10 -temp -separateFile -location
	
# Information
This meter generator use a locations.json file to add city information. This locations.json file is a copy of another public Github repository on MIT Licence (<a href="https://github.com/sjlu/cities/">src</a>)
