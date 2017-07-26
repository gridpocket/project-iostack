# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-07-26

COMMAND='node ../js/meter_gen.js'

echo 'TEST ELEC'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from electric heater houses
$COMMAND -metersType "elec" -out './out-js/out-elec.csv'

echo '\nTEST GAS'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from gas heater houses
$COMMAND  -metersType "gas" -out './out-js/out-gas.csv'

echo '\nTEST MIXED'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, some meters from electric and others in gas heated houses
$COMMAND -out './out-js/out-mixed.csv'

echo '\nTEST TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
$COMMAND -temp -out './out-js/temp.csv'

echo '\nTEST LOCATION'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
$COMMAND -location -out './out-js/location.csv'

echo '\nTEST LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the first 10 meters (0 till 9)
$COMMAND -lastID 10 -out './out-js/lastID.csv'

echo '\nTEST STARTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the last 10 meters (90 till 99)
$COMMAND -startID 90 -out './out-js/startID.csv'

echo '\nTEST STARTID & LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only 10 meters (45 till 54)
$COMMAND -startID 45 -lastID 55 -out './out-js/start&last.csv'

echo '\nTEST grouping data by hour'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year, month, day, hour and minute
$COMMAND -out './out-js/sepFilesDay/%y-%M-%D_%h-%m.csv'

echo '\nTEST grouping data by month'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month
$COMMAND -out './out-js/sepFilesMonth/%Y/%M.csv'

echo '\nTEST grouping data by day & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperature, separating files by users (10 files)
$COMMAND -startID 45 -lastID 55 -location -temp -out './out-js/sepFiles_start_last/%Y-%M.csv'

echo '\nTEST MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as no file make more than 1MBytes
$COMMAND -maxFileSize 1M -out './out-js/maxFileSize10k/%N.csv'

echo '\nTEST MAXFILESIZE & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperatures, separating files as no file make more than 1MBytes
$COMMAND -maxFileSize 1M -startID 45 -lastID 55 -location -temp -out './out-js/maxFileSize_start_last/%N.csv'

echo '\nTEST grouping data by month & MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month & cut each 100kb
$COMMAND -maxFileSize 100k -out './out-js/sepFiles_maxFileSize/%Y-%M_%N.csv'