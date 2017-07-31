#!/bin/sh
#
#  GridPocket Copyrights 2017
# IOSTACK project www.iostack.eu
#
# @Author: Nathaël Noguès
# @Date:   2017-07-28
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-07-31

echo "Generating One Elec..."
$1 -config './statGenConf.json' -metersNumber 660000 -metersType 'elec' -beginDate '2017/01/01' -endDate '2017/01/01' -out './statgen/lightOneElec.csv'

echo
echo "Generating Day temperatures..."
# a data each 10 minutes
$1 -config './statGenConf.json' -metersNumber 3000 -beginDate '2017/01/01' -interval 10 -endDate '2017/01/02' -temp -out './statgen/dayTemperatures.csv'

echo
echo "Generating Year temperatures..."
# a data each 6 hours (at 6AM, 12AM, 6PM and 12PM)
$1 -config './statGenConf.json' -metersNumber 3000 -beginDate '2016/01/01' -interval 360 -endDate '2017/01/01' -temp -out './statgen/yearTemperatures.csv'
