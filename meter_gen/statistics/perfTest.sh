# @Author: Nathaël Noguès
# @Date:   2016-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-05-05

echo '1 Day, 1/30min, 100 users, mixed' # 480.000 data, ~60Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2016/01/02' -out './out/01d-100u.csv'

echo
echo '1 Week, 1/30min, 100 users, mixed' # 33.600 data, ~5Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2016/01/08' -out './out/07d-100u.csv'

echo
echo '1 Month, 1/30min, 100 users, mixed' # 148.800 data, ~7Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2016/02/01' -out './out/31d-100u.csv'

echo
echo '1 Year, 1/30min, 100 users, mixed' # 1.752.000 data
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2017/01/01' -out './out/12m-100u.csv'
rm './out/12m-100u.csv' &


echo
echo '1 Day, 1/30min, 1000 users, mixed' # 480.000 data, ~60Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2016/01/02' -out './out/01d-01ku.csv'

echo
echo '1 Week, 1/30min, 1000 users, mixed' # 336.000 data, ~200Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2016/01/08' -out './out/07d-01ku.csv'

echo
echo '1 Month, 1/30min, 1000 users, mixed' # 1.488.000 data, ~200Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2016/02/01' -out './out/31d-01ku.csv'
rm './out/31d-01ku.csv' &

echo
echo '1 Year, 1/30min, 1000 users, mixed' # 17.520.000 data
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2017/01/01' -out './out/12m-01ku.csv'
rm './out/12m-01ku.csv' &


echo
echo '1 Day, 1/30min, 10000 users, mixed' # 480.000 data, ~60Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2016/01/02' -out './out/01d-10ku.csv'

echo
echo '1 Week, 1/30min, 10000 users, mixed' # 3.360.000 data ~450Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2016/01/08' -out './out/07d-10ku.csv'
rm './out/07d-10ku.csv' &

echo
echo '1 Month, 1/30min, 10000 users, mixed' # 14.880.000 data, ~2 Go
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2016/02/01' -out './out/31d-10ku.csv'
rm './out/31d-10ku.csv' &

#echo
#echo '1 Year, 1/30min, 10000 users, mixed' # ~20Go
#node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2017/01/01' -out './out/1y-10ku.csv'
#rm './out/1y-10ku.csv' &

echo
echo '1 data, 1/30min, 1M users, mixed' # 14.880.000 data, ~2 Go
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 999999 -endDate '2016/01/01' -out './out/1Mu.csv'