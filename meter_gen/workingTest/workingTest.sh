#!/bin/sh
#
#  GridPocket Copyrights 2017
# IOSTACK project www.iostack.eu
#
# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-08-17 11:55:33

echo 'TEST ELEC'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from electric heater houses
sh $1 -metersType "elec" -out "./out/out-elec.csv"

echo '\nTEST GAS'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from gas heater houses
sh $1  -metersType "gas" -out "./out/out-gas.csv"

echo '\nTEST MIXED'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, some meters from electric and others in gas heated houses
sh $1 -out "./out/out-mixed.csv"

echo '\nTEST TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
sh $1 -temp -out "./out/temp.csv"

echo '\nTEST LOCATION'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
sh $1 -location -out "./out/location.csv"

echo '\nTEST LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the first 10 meters (0 till 9)
sh $1 -lastID 10 -out "./out/lastID.csv"

echo '\nTEST FIRSTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the last 10 meters (90 till 99)
sh $1 -firstID 90 -out "./out/firstID.csv"

echo '\nTEST FIRSTID & LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only 10 meters (45 till 54)
sh $1 -firstID 45 -lastID 55 -out "./out/first&last.csv"

echo '\nTEST grouping data by hour'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year, month, day, hour and minute
sh $1 -out "./out/sepFilesDay/%y-%M-%D_%h-%m.csv"

echo '\nTEST grouping data by month'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month
sh $1 -out "./out/sepFilesMonth/%Y/%M.csv"

echo '\nTEST grouping data by day & FIRSTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperature, separating files by users (10 files)
sh $1 -firstID 45 -lastID 55 -location -temp -out "./out/sepFiles_first_last/%Y-%M.csv"

echo '\nTEST MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as no file make more than 1MBytes
sh $1 -maxFileSize 1M -out "./out/maxFileSize10k/%N.csv"

echo '\nTEST MAXFILESIZE & FIRSTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperatures, separating files as no file make more than 1MBytes
sh $1 -maxFileSize 1M -firstID 45 -lastID 55 -location -temp -out "./out/maxFileSize_first_last/%N.csv"

echo '\nTEST grouping data by month & MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month & cut each 100kb
sh $1 -maxFileSize 100k -out "./out/sepFiles_maxFileSize/%Y-%M_%N.csv"