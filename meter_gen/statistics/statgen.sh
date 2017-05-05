echo "Generating One Elec..."
node ../meter_gen.js -config './statGenConf.json' -metersNumber 660000 -beginDate '2017/01/01' -endDate '2017/01/01' -out './statgen/lightOneElec.csv'

echo "Generating Cold Elec..."
node ../meter_gen.js -config './statGenConf.json' -metersNumber 3000 -beginDate '2016/11/01' -endDate '2017/03/01' -out './statgen/generatedColdElec.csv'
cat ./statgen/generatedColdElec.csv | egrep '^(2017-03-01|[a-zA-Z])' > ./statgen/lightColdElec.csv

echo "Generating Hot Elec..."
node ../meter_gen.js -config './statGenConf.json' -metersNumber 3000 -beginDate '2016/06/01' -endDate '2016/11/01' -out './statgen/generatedHotElec.csv'
cat ./statgen/generatedHotElec.csv | egrep '^(2016-11-01|[a-zA-Z])' > ./statgen/lightHotElec.csv
