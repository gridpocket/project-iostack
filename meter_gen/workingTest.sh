# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-04-28

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
node meter_gen.js 100 '2016/02/01' '2016/05/01' 60 electric -out './workingTest/out-elec.csv'

echo 'TEST GAS'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 gas -out './workingTest/out-gas.csv'

echo 'TEST MIXED'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -out './workingTest/out-mixed.csv'

echo 'TEST LOCATION'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -location -out './workingTest/location.csv'

echo 'TEST LASTID'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -lastID 10 -out './workingTest/lastID.csv'

echo 'TEST STARTID'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -startID 90 -out './workingTest/startID.csv'

echo 'TEST STARTID & LASTID'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -startID 45 -lastID 55 -out './workingTest/temp.csv'

echo 'TEST SEPARATEFILES 0'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles 0 -out './workingTest/sepFiles0/'

echo 'TEST SEPARATEFILES (noArg)'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles -out './workingTest/sepFilesNoArg/'

echo 'TEST SEPARATEFILES 5'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles 5 -out './workingTest/sepFiles5/'

echo 'TEST SEPARATEFILES 0 & STARTID & LASTID & LOC & TEMP'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -separateFiles 0 -startID 45 -lastID 55 -location -temp -out './workingTest/sepFiles_start_last/'

echo 'TEST MAXFILESIZE'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -maxFileSize 1M -out './workingTest/maxFileSize10k/'

echo 'TEST MAXFILESIZE & STARTID & LASTID & LOC & TEMP'
node meter_gen.js 100 '2016/02/01' '2017/05/01' 60 mixed -maxFileSize 1M -startID 45 -lastID 55 -location -temp -out './workingTest/maxFileSize_start_last/'
