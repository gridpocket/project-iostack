#!/bin/sh
#
#  GridPocket Copyrights 2017
# IOSTACK project www.iostack.eu
#
# @Author: Nathaël Noguès
# @Date:   2017-07-28
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-08-17 11:54:37

echo "Generating One Elec..."
sh $1 -config './statGenConf.json' -metersNumber 660000 -metersType 'elec' -firstDate '2017-01-01T00:00' -lastDate '2017-01-01T00:00' -out './statgen/lightOneElec.csv'

echo
echo "Generating Day temperatures..."
# a data each 10 minutes
sh $1 -config './statGenConf.json' -metersNumber 3000 -firstDate '2017-01-01T00:00' -interval 10 -lastDate '2017-01-02T00:00' -temp -out './statgen/dayTemperatures.csv'

echo
echo "Generating Year temperatures..."
# a data each 6 hours (at 6AM, 12AM, 6PM and 12PM)
sh $1 -config './statGenConf.json' -metersNumber 3000 -firstDate '2016-01-01T00:00' -interval 360 -lastDate '2017-01-01T00:00' -temp -out './statgen/yearTemperatures.csv'
