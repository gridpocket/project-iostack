mkdir stat-gen 2>/dev/null

echo "Generating One Elec..."
node meter_gen.js 10000 '2017/01/01' '2017/01/01' 30 electric -location -out './stat-gen/lightOneElec.csv'

echo "Generating Cold Elec..."
node meter_gen.js 300 '2016/11/01' '2017/03/01' 60 electric -location -out './stat-gen/generatedColdElec2.csv'
cat ./stat-gen/generatedColdElec2.csv | egrep '^(2017-03-01|[a-zA-Z])' > ./stat-gen/lightColdElec2.csv

echo "Generating Hot Elec..."
node meter_gen.js 300 '2016/06/01' '2016/11/01' 60 electric -location -out './stat-gen/generatedHotElec2.csv'
cat ./stat-gen/generatedHotElec2.csv | egrep '^(2016-11-01|[a-zA-Z])' > ./stat-gen/lightHotElec2.csv