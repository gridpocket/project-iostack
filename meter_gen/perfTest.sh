# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-05-02

echo '1 Day, 1/30min, 100 users, mixed' # 480.000 data, ~60Mo
node meter_gen.js 100 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-100u.csv'

echo
echo '1 Week, 1/30min, 100 users, mixed' # 33.600 data, ~5Mo
node meter_gen.js 100 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-100u.csv'

echo
echo '1 Month, 1/30min, 100 users, mixed' # 148.800 data, ~7Mo
node meter_gen.js 100 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-100u.csv'

echo
echo '1 Year, 1/30min, 100 users, mixed' # 1.752.000 data
node meter_gen.js 100 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/12m-100u.csv'
rm './perfTest/12m-100u.csv' &


echo
echo '1 Day, 1/30min, 1000 users, mixed' # 480.000 data, ~60Mo
node meter_gen.js 1000 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-01ku.csv'

echo
echo '1 Week, 1/30min, 1000 users, mixed' # 336.000 data, ~200Mo
node meter_gen.js 1000 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-01ku.csv'

echo
echo '1 Month, 1/30min, 1000 users, mixed' # 1.488.000 data, ~200Mo
node meter_gen.js 1000 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-01ku.csv'
rm './perfTest/31d-01ku.csv' &

echo
echo '1 Year, 1/30min, 1000 users, mixed' # 17.520.000 data
node meter_gen.js 1000 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/12m-01ku.csv'
rm './perfTest/12m-01ku.csv' &


echo
echo '1 Day, 1/30min, 10000 users, mixed' # 480.000 data, ~60Mo
node meter_gen.js 10000 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-10ku.csv'

echo
echo '1 Week, 1/30min, 10000 users, mixed' # 3.360.000 data ~450Mo
node meter_gen.js 10000 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-10ku.csv'
rm './perfTest/07d-10ku.csv' &

echo
echo '1 Month, 1/30min, 10000 users, mixed' # 14.880.000 data, ~2 Go
node meter_gen.js 10000 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-10ku.csv'
rm './perfTest/31d-10ku.csv' &

#echo
#echo '1 Year, 1/30min, 10000 users, mixed' # ~20Go
#node meter_gen.js 10000 '2016/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/1y-10ku.csv'
#rm './perfTest/1y-10ku.csv' &

#echo
#echo '5 Year, 1/30min, 10000 users, mixed' # ~100Go
#node meter_gen.js 10000 '2012/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/5y-10ku.csv'
#rm './perfTest/5y-10ku.csv' &

echo
echo '1 data, 1/30min, 1M users, mixed' # 14.880.000 data, ~2 Go
node meter_gen.js 999999 '2017/01/01' '2017/01/01' 30 mixed -location -temp -out './perfTest/1Mu.csv'