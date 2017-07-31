#!/bin/sh
#
#  GridPocket Copyrights 2017
# IOSTACK project www.iostack.eu
#
# @Author: Nathaël Noguès
# @Date:   2017-04-14
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-07-31

echo 'TEST ELEC'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from electric heater houses
$1 -metersType "elec" -out "./$2/out-elec.csv"

echo '\nTEST GAS'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from gas heater houses
$1  -metersType "gas" -out "./$2/out-gas.csv"

echo '\nTEST MIXED'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, some meters from electric and others in gas heated houses
$1 -out "./$2/out-mixed.csv"

echo '\nTEST TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
$1 -temp -out "./$2/temp.csv"

echo '\nTEST LOCATION'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, printing city name, region number and meter location
$1 -location -out "./$2/location.csv"

echo '\nTEST LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the first 10 meters (0 till 9)
$1 -lastID 10 -out "./$2/lastID.csv"

echo '\nTEST STARTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only the last 10 meters (90 till 99)
$1 -startID 90 -out "./$2/startID.csv"

echo '\nTEST STARTID & LASTID'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, computing only 10 meters (45 till 54)
$1 -startID 45 -lastID 55 -out "./$2/start&last.csv"

echo '\nTEST grouping data by hour'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year, month, day, hour and minute
$1 -out "./$2/sepFilesDay/%y-%M-%D_%h-%m.csv"

echo '\nTEST grouping data by month'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month
$1 -out "./$2/sepFilesMonth/%Y/%M.csv"

echo '\nTEST grouping data by day & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperature, separating files by users (10 files)
$1 -startID 45 -lastID 55 -location -temp -out "./$2/sepFiles_start_last/%Y-%M.csv"

echo '\nTEST MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files as no file make more than 1MBytes
$1 -maxFileSize 1M -out "./$2/maxFileSize10k/%N.csv"

echo '\nTEST MAXFILESIZE & STARTID & LASTID & LOC & TEMP'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, generating only users 45 till 54, printing locations and temperatures, separating files as no file make more than 1MBytes
$1 -maxFileSize 1M -startID 45 -lastID 55 -location -temp -out "./$2/maxFileSize_start_last/%N.csv"

echo '\nTEST grouping data by month & MAXFILESIZE'
# Generating 100 meters, with data for 5 monthes, one data by meter each 60minutes, all meters from random heated houses, separating files according to generated year and month & cut each 100kb
$1 -maxFileSize 100k -out "./$2/sepFiles_maxFileSize/%Y-%M_%N.csv"