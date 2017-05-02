# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-05-02

<<COMMENT
node meter_gen 
	[meters number] 
	[date begin] 
	[date end] 
	[data interval] 
	[data type] 
	(-maxFileSize [size]) 
	(-separateFiles (interval)) 
	(-startID [id])
	(-lastID [id]) 
	(-temp) 
	(-location) 
	(-out [filePath])
COMMENT

echo 'TEST ELEC'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from electric heater houses
node meter_gen.js 100 '2016/02/01' '2016/05/01' 60 electric -out './workingTest/out-elec.csv'

echo 'TEST GAS'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from gas heater houses
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 gas -out './workingTest/out-gas.csv'

echo 'TEST MIXED'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, some meters from electric and others in gas heated houses
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -out './workingTest/out-mixed.csv'

echo 'TEST LOCATION'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -location -out './workingTest/location.csv'

echo 'TEST LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the first 10 meters (0 till 9)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -lastID 10 -out './workingTest/lastID.csv'

echo 'TEST STARTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the last 10 meters (90 till 99)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -startID 90 -out './workingTest/startID.csv'

echo 'TEST STARTID & LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only 10 meters (45 till 54)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -startID 45 -lastID 55 -out './workingTest/temp.csv'

echo 'TEST SEPARATEFILES 0'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as there is one file by user (100 files)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles 0 -out './workingTest/sepFiles0/'

echo 'TEST SEPARATEFILES (noArg)'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as there is one file by timestamp ((28,30,31)×24 files)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles -out './workingTest/sepFilesNoArg/'

echo 'TEST SEPARATEFILES 5'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as ther is one file each 5 timestamps ((28,30,31)×24÷5 files)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles 5 -out './workingTest/sepFiles5/'

echo 'TEST SEPARATEFILES 0 & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperature, separating files by users (10 files)
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles 0 -startID 45 -lastID 55 -location -temp -out './workingTest/sepFiles_start_last/'

echo 'TEST MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as no file make more than 1MBytes
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -maxFileSize 1M -out './workingTest/maxFileSize10k/'

echo 'TEST MAXFILESIZE & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperatures, separating files as no file make more than 1MBytes
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -maxFileSize 1M -startID 45 -lastID 55 -location -temp -out './workingTest/maxFileSize_start_last/'
