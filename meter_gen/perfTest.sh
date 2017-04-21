# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-04-21

echo 'TEST AS 1FILE'

echo '1 Day, 1/30min, 100 users, mixed' # 480.000 data, ~60Mo
ts=$(date +%s%N)
node meter_gen.js 100 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-100u.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/01d-100u.csv')
echo "Time: $tmps, Size: $size"

echo '1 Week, 1/30min, 100 users, mixed' # 33.600 data, ~5Mo
ts=$(date +%s%N)
node meter_gen.js 100 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-100u.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/07d-100u.csv')
echo "Time: $tmps, Size: $size"

echo '1 Month, 1/30min, 100 users, mixed' # 148.800 data, ~7Mo
ts=$(date +%s%N)
node meter_gen.js 100 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-100u.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/31d-100u.csv')
echo "Time: $tmps, Size: $size"

echo '1 Year, 1/30min, 100 users, mixed' # 1.752.000 data
ts=$(date +%s%N)
node meter_gen.js 100 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/12m-100u.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/12m-100u.csv')
rm './perfTest/12m-100u.csv' &
echo "Time: $tmps, Size: $size"


echo
echo '1 Day, 1/30min, 1000 users, mixed' # 480.000 data, ~60Mo
ts=$(date +%s%N)
node meter_gen.js 1000 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-01ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/01d-01ku.csv')
echo "Time: $tmps, Size: $size"

echo '1 Week, 1/30min, 1000 users, mixed' # 336.000 data, ~200Mo
ts=$(date +%s%N)
node meter_gen.js 1000 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-01ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/07d-01ku.csv')
echo "Time: $tmps, Size: $size"

echo '1 Month, 1/30min, 1000 users, mixed' # 1.488.000 data, ~200Mo
ts=$(date +%s%N)
node meter_gen.js 1000 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-01ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/31d-01ku.csv')
rm './perfTest/31d-01ku.csv' &
echo "Time: $tmps, Size: $size"

echo '1 Year, 1/30min, 1000 users, mixed' # 17.520.000 data
ts=$(date +%s%N)
node meter_gen.js 1000 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/12m-01ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/12m-01ku.csv')
rm './perfTest/12m-01ku.csv' &
echo "Time: $tmps, Size: $size"


echo
echo '1 Day, 1/30min, 10000 users, mixed' # 480.000 data, ~60Mo
ts=$(date +%s%N)
node meter_gen.js 10000 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-10ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/01d-10ku.csv')
echo "Time: $tmps, Size: $size"

echo '1 Week, 1/30min, 10000 users, mixed' # 3.360.000 data ~450Mo
ts=$(date +%s%N)
node meter_gen.js 10000 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-10ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/07d-10ku.csv')
rm './perfTest/07d-10ku.csv' &
echo "Time: $tmps, Size: $size"

echo '1 Month, 1/30min, 10000 users, mixed' # 14.880.000 data, ~2 Go
ts=$(date +%s%N)
node meter_gen.js 10000 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-10ku.csv'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(stat -c %s './perfTest/31d-10ku.csv')
rm './perfTest/31d-10ku.csv' &
echo "Time: $tmps, Size: $size"


#echo '1 Year, 1/30min, 10000 users, mixed' # ~20Go
#ts=$(date +%s%N)
#node meter_gen.js 10000 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/1y-10ku.csv'
#tmps=$((($(date +%s%N) - $ts)/1000000))
#size=stat -c %s './perfTest/1y-10ku.csv'
#rm './perfTest/1y-10ku.csv' &
#echo "Time: $tmps, Size: $size"

#echo '5 Year, 1/30min, 10000 users, mixed' # ~100Go
#ts=$(date +%s%N)
#node meter_gen.js 10000 '2012/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/5y-10ku.csv'
#tmps=$((($(date +%s%N) - $ts)/1000000))
#size=stat -c %s './perfTest/5y-10ku.csv'
#rm './perfTest/5y-10ku.csv' &
#echo "Time: $tmps, Size: $size"


echo
echo
echo 'TEST AS SEPARATED FILES'

echo '1 Day, 1/30min, 100 users, mixed' # 480.000 data, ~60Mo
ts=$(date +%s%N)
node meter_gen.js 100 '2017/01/01' '2017/01/02' 30 mixed -location -separateFiles -temp -out './perfTest/01d-100u/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/01d-100u/')
echo "Time: $tmps, Size: $size"

echo '1 Week, 1/30min, 100 users, mixed' # 33.600 data, ~5Mo
ts=$(date +%s%N)
node meter_gen.js 100 '2017/01/01' '2017/01/08' 30 mixed -location -separateFiles -temp -out './perfTest/07d-100u/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/07d-100u/')
echo "Time: $tmps, Size: $size"

echo '1 Month, 1/30min, 100 users, mixed' # 148.800 data, ~7Mo
ts=$(date +%s%N)
node meter_gen.js 100 '2017/01/01' '2017/02/01' 30 mixed -location -separateFiles -temp -out './perfTest/31d-100u/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/31d-100u/')
echo "Time: $tmps, Size: $size"

echo '1 Year, 1/30min, 100 users, mixed' # 1.752.000 data
ts=$(date +%s%N)
node meter_gen.js 100 '2016/01/01' '2017/01/01' 30 mixed -location -separateFiles -temp -out './perfTest/12m-100u/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/12m-100u/')
rm -r './perfTest/12m-100u/' &
echo "Time: $tmps, Size: $size"


echo
echo '1 Day, 1/30min, 1000 users, mixed' # 480.000 data, ~60Mo
ts=$(date +%s%N)
node meter_gen.js 1000 '2017/01/01' '2017/01/02' 30 mixed -location -separateFiles -temp -out './perfTest/01d-01ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/01d-01ku/')
echo "Time: $tmps, Size: $size"

echo '1 Week, 1/30min, 1000 users, mixed' # 336.000 data, ~200Mo
ts=$(date +%s%N)
node meter_gen.js 1000 '2017/01/01' '2017/01/08' 30 mixed -location -separateFiles -temp -out './perfTest/07d-01ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/07d-01ku/')
echo "Time: $tmps, Size: $size"

echo '1 Month, 1/30min, 1000 users, mixed' # 1.488.000 data, ~200Mo
ts=$(date +%s%N)
node meter_gen.js 1000 '2017/01/01' '2017/02/01' 30 mixed -location -separateFiles -temp -out './perfTest/31d-01ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/31d-01ku/')
rm -r './perfTest/31d-01ku/' &
echo "Time: $tmps, Size: $size"

echo '1 Year, 1/30min, 1000 users, mixed' # 17.520.000 data
ts=$(date +%s%N)
node meter_gen.js 1000 '2016/01/01' '2017/01/01' 30 mixed -location -separateFiles -temp -out './perfTest/12m-01ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/12m-01ku/')
rm -r './perfTest/12m-01ku/' &
echo "Time: $tmps, Size: $size"


echo
echo '1 Day, 1/30min, 10000 users, mixed' # 480.000 data, ~60Mo
ts=$(date +%s%N)
node meter_gen.js 10000 '2017/01/01' '2017/01/02' 30 mixed -location -separateFiles -temp -out './perfTest/01d-10ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/01d-10ku/')
echo "Time: $tmps, Size: $size"

echo '1 Week, 1/30min, 10000 users, mixed' # 3.360.000 data ~450Mo
ts=$(date +%s%N)
node meter_gen.js 10000 '2017/01/01' '2017/01/08' 30 mixed -location -separateFiles -temp -out './perfTest/07d-10ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/07d-10ku/')
rm -r './perfTest/07d-10ku/' &
echo "Time: $tmps, Size: $size"

echo '1 Month, 1/30min, 10000 users, mixed' # 14.880.000 data, ~2 Go
ts=$(date +%s%N)
node meter_gen.js 10000 '2017/01/01' '2017/02/01' 30 mixed -location -separateFiles -temp -out './perfTest/31d-10ku/'
tmps=$((($(date +%s%N) - $ts)/1000000))
size=$(du -sb './perfTest/31d-10ku/')
rm -r './perfTest/31d-10ku/' &
echo "Time: $tmps, Size: $size"


#echo '1 Year, 1/30min, 10000 users, mixed' # ~20Go
#ts=$(date +%s%N)
#node meter_gen.js 10000 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/1y-10ku.csv'
#tmps=$((($(date +%s%N) - $ts)/1000000))
#size=stat -c %s './perfTest/1y-10ku.csv'
#rm './perfTest/1y-10ku.csv' &
#echo "Time: $tmps, Size: $size"

#echo '5 Year, 1/30min, 10000 users, mixed' # ~100Go
#ts=$(date +%s%N)
#node meter_gen.js 10000 '2012/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/5y-10ku.csv'
#tmps=$((($(date +%s%N) - $ts)/1000000))
#size=stat -c %s './perfTest/5y-10ku.csv'
#rm './perfTest/5y-10ku.csv' &
#echo "Time: $tmps, Size: $size"
