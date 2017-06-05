# @Author: Nathaël Noguès
# @Date:   2016-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-06-05

echo '1 Day, 1/30min, 100 users, mixed' # 480.000 data, ~60Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2016/01/02' -fileNameExt '01d-100u'

echo
echo '1 Week, 1/30min, 100 users, mixed' # 33.600 data, ~5Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2016/01/08' -fileNameExt '07d-100u'

echo
echo '1 Month, 1/30min, 100 users, mixed' # 148.800 data, ~7Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2016/02/01' -fileNameExt '31d-100u'

echo
echo '1 Year, 1/30min, 100 users, mixed' # 1.752.000 data
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100 -endDate '2017/01/01' -fileNameExt '12m-100u'
find ./perfTest/ -name '*-12m-100u.csv' -delete &


echo
echo '1 Day, 1/30min, 1000 users, mixed' # 480.000 data, ~60Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2016/01/02' -fileNameExt '01d-01ku'

echo
echo '1 Week, 1/30min, 1000 users, mixed' # 336.000 data, ~200Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2016/01/08' -fileNameExt '07d-01ku'

echo
echo '1 Month, 1/30min, 1000 users, mixed' # 1.488.000 data, ~200Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2016/02/01' -fileNameExt '31d-01ku'
find ./perfTest/ -name '*-31d-01ku.csv' -delete &

echo
echo '1 Year, 1/30min, 1000 users, mixed' # 17.520.000 data
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 1000 -endDate '2017/01/01' -fileNameExt '12m-01ku'
find ./perfTest/ -name '*-12m-01ku.csv' -delete &


echo
echo '1 Day, 1/30min, 10k users, mixed' # 480.000 data, ~60Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2016/01/02' -fileNameExt '01d-10ku'

echo
echo '1 Week, 1/30min, 10k users, mixed' # 3.360.000 data ~450Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2016/01/08' -fileNameExt '07d-10ku'
find ./perfTest/ -name '*-07d-10ku.csv' -delete &

echo
echo '1 Month, 1/30min, 10k users, mixed' # 14.880.000 data, ~2 Go
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2016/02/01' -fileNameExt '31d-10ku'
find ./perfTest/ -name '*-31d-10ku.csv' -delete &

#echo
#echo '1 Year, 1/30min, 10000 users, mixed' # ~20Go
#node ../meter_gen.js -config './perfTestConf.json' -metersNumber 10000 -endDate '2017/01/01' -fileNameExt '1y-10ku'
#find ./perfTest/ -name '*-1y-10ku.csv' -delete &


# Test users number increasing

echo
echo '1 data, 1/30min, 100k users, mixed' # 1.488.000 data, ~200 Mo
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100000 -endDate '2016/01/01' -fileNameExt '100ku'
find ./perfTest/ -name '*-100ku.csv' -delete &

echo
echo '1 data, 1/30min, 500k users, mixed' # 7.440.000 data, ~1 Go
node ../meter_gen.js -config './perfTestConf.json' -metersNumber 100000 -endDate '2016/01/01' -fileNameExt '500ku'
find ./perfTest/ -name '*-500ku.csv' -delete &

#echo
#echo '1 data, 1/30min, 1M users, mixed' # 14.880.000 data, ~2 Go
#node ../meter_gen.js -config './perfTestConf.json' -metersNumber 999999 -endDate '2016/01/01' -fileNameExt '1Mu'
#find ./perfTest/ -name '*-1Mu.csv' -delete &