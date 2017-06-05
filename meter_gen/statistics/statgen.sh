echo "Generating One Elec..."
node ../meter_gen.js -config './statGenConf.json' -metersNumber 660000 -metersType 'elec' -beginDate '2017/01/01' -endDate '2017/01/01' -fileNameExt 'lightOneElec'


echo
echo "Generating Day temperatures..."
# a data each 10 minutes
node ../meter_gen.js -config './statGenConf.json' -metersNumber 3000 -beginDate '2017/01/01' -interval 10 -endDate '2017/01/02' -temp -fileNameExt 'dayTemperatures'

echo
echo "Generating Year temperatures..."
# a data each 6 hours (at 6AM, 12AM, 6PM and 12PM)
node ../meter_gen.js -config './statGenConf.json' -metersNumber 3000 -beginDate '2016/01/01' -interval 360 -endDate '2017/01/01' -temp -fileNameExt 'yearTemperatures'