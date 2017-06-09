# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-06-09

echo 'TEST ELEC'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from electric heater houses
node ../meter_gen.js -metersType "elec" -out './out/out-elec.csv'

echo '\nTEST GAS'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from gas heater houses
node ../meter_gen.js  -metersType "gas" -out './out/out-gas.csv'

echo '\nTEST MIXED'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, some meters from electric and others in gas heated houses
node ../meter_gen.js -out './out/out-mixed.csv'

echo '\nTEST TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
node ../meter_gen.js -temp -out './out/temp.csv'

echo '\nTEST LOCATION'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
node ../meter_gen.js -location -out './out/location.csv'

echo '\nTEST LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the first 10 meters (0 till 9)
node ../meter_gen.js -lastID 10 -out './out/lastID.csv'

echo '\nTEST STARTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the last 10 meters (90 till 99)
node ../meter_gen.js -startID 90 -out './out/startID.csv'

echo '\nTEST STARTID & LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only 10 meters (45 till 54)
node ../meter_gen.js -startID 45 -lastID 55 -out './out/start&last.csv'

echo '\nTEST grouping data by hour'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year, month, day, hour and minute
node ../meter_gen.js -out './out/sepFilesDay/%y-%M-%D_%h-%m.csv'

echo '\nTEST grouping data by month'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month
node ../meter_gen.js -out './out/sepFilesMonth/%Y/%M.csv'

echo '\nTEST grouping data by day & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperature, separating files by users (10 files)
node ../meter_gen.js -startID 45 -lastID 55 -location -temp -out './out/sepFiles_start_last/%Y-%M.csv'

echo '\nTEST MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as no file make more than 1MBytes
node ../meter_gen.js -maxFileSize 1M -out './out/maxFileSize10k/%N.csv'

echo '\nTEST MAXFILESIZE & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperatures, separating files as no file make more than 1MBytes
node ../meter_gen.js -maxFileSize 1M -startID 45 -lastID 55 -location -temp -out './out/maxFileSize_start_last/%N.csv'

echo '\nTEST grouping data by month & MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month & cut each 100kb
node ../meter_gen.js -maxFileSize 100k -out './out/sepFiles_maxFileSize/%Y-%M_%N.csv'