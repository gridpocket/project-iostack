mkdir stat-gen 2>/dev/null

echo "Generating One Elec..."
node meter_gen.js 10000 '2017/01/01' '2017/01/01' 30 electric -location -out './stat-gen/lightOneElec.csv'

echo "Generating Cold Elec..."
node meter_gen.js 5000 '2016/11/01' '2017/03/02' 90 electric -location -out './stat-gen/generatedColdElec.csv'
cat ./stat-gen/generatedColdElec.csv | egrep '^(2017-03-01|[a-zA-Z])' > ./stat-gen/lightColdElec.csv

echo "Generating Hot Elec..."
node meter_gen.js 5000 '2016/06/01' '2016/11/01' 90 electric -location -out './stat-gen/generatedHotElec.csv'
cat ./stat-gen/generatedHotElec.csv | egrep '^(2016-11-01|[a-zA-Z])' > ./stat-gen/lightHotElec.csv

<<DISABLED
node meter_gen.js 1000 '2016/01/01' '2017/01/01' 730 electric -location -out './stat-gen/generatedLightElec.csv'

cd 'stat-gen/'
cat generatedLightElec.csv | egrep "^(2017/01/01|[a-zA-Z])" > lightElec.csv
#rm generatedLightElec.csv &

cat lightElec.csv | grep ",20," > 20mLightElec.csv &
cat lightElec.csv | grep ",50," > 50mLightElec.csv &
cat lightElec.csv | grep ",70," > 70mLightElec.csv &
cat lightElec.csv | grep ",100," > 100mLightElec.csv &


###################################"
cd ..
node meter_gen.js 1000 '2016/01/01' '2017/01/01' 30 electric -location -out './stat-gen/generatedHardElec.csv'

cd 'stat-gen/'
cat generatedHardElec.csv | egrep "^(2017/01/01|[a-zA-Z])" > hardElec.csv
#rm generatedHardElec.csv &

cat hardElec.csv | grep ",20," > 20mElec.csv &
cat hardElec.csv | grep ",50," > 50mElec.csv &
cat hardElec.csv | grep ",70," > 70mElec.csv &
cat hardElec.csv | grep ",100," > 100mElec.csv &
DISABLED