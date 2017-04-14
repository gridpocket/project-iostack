# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-04-14


echo '1 Day, 1/30min, 100 users, mixed'
node meter_gen.js 100 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-100u.csv'
stat -c %s './perfTest/01d-100u.csv'

echo '1 Week, 1/30min, 100 users, mixed'
node meter_gen.js 100 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-100u.csv'
stat -c %s './perfTest/07d-100u.csv'

echo '1 Month, 1/30min, 100 users, mixed'
node meter_gen.js 100 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-100u.csv'
stat -c %s './perfTest/31d-100u.csv'


echo
echo '1 Day, 1/30min, 1000 users, mixed'
node meter_gen.js 1000 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-1ku.csv'
stat -c %s './perfTest/01d-1ku.csv'

echo '1 Week, 1/30min, 1000 users, mixed'
node meter_gen.js 1000 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-1ku.csv'
stat -c %s './perfTest/07d-1ku.csv'

echo '1 Month, 1/30min, 1000 users, mixed'
node meter_gen.js 1000 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-1ku.csv'
stat -c %s './perfTest/31d-1ku.csv'
rm './perfTest/31d-1ku.csv' &


echo
echo '1 Day, 1/30min, 10000 users, mixed'
node meter_gen.js 10000 '2017/01/01' '2017/01/02' 30 mixed -location -temp -out './perfTest/01d-10ku.csv'
stat -c %s './perfTest/01d-10ku.csv'

echo '1 Week, 1/30min, 10000 users, mixed'
node meter_gen.js 10000 '2017/01/01' '2017/01/08' 30 mixed -location -temp -out './perfTest/07d-10ku.csv'
stat -c %s './perfTest/07d-10ku.csv'
rm './perfTest/07d-10ku.csv' &

echo '1 Month, 1/30min, 10000 users, mixed'
node meter_gen.js 10000 '2017/01/01' '2017/02/01' 30 mixed -location -temp -out './perfTest/31d-10ku.csv'
stat -c %s './perfTest/31d-10ku.csv'
rm './perfTest/31d-10ku.csv' &