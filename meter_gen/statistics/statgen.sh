echo "Generating One Elec..."
node ../meter_gen.js -config './statGenConf.json' -metersNumber 660000 -beginDate '2017/01/01' -endDate '2017/01/01' -out './statgen/lightOneElec.csv'


echo
echo "Generating Day temperatures..."
# a data each 10 minutes
node ../meter_gen.js -config './statGenConf.json' -metersNumber 3000 -beginDate '2017/01/01' -interval 10 -endDate '2017/01/02' -temp -out './statgen/dayTemperatures.csv'

echo
echo "Generating Year temperatures..."
# a data each 6 hours (at 6AM, 12AM, 6PM and 12PM)
node ../meter_gen.js -config './statGenConf.json' -metersNumber 3000 -beginDate '2016/01/01' -interval 360 -endDate '2017/01/01' -temp -out './statgen/yearTemperatures.csv'