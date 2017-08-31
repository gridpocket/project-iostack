#!/bin/bash

####################################################################################
#
# generateData.sh invoked gridpocket metergen and uploads generated data to swift
#
# Yosef Moatti   moatti@il.ibm.com
# 08th June 017
#
# version 2.5
#   fits datagen version v4.2.0
# version 2.2
# Initial version
#######################################################################

### Constants definitions:
NODE="node"
LOCAL_DIR="."
#LOCAL_DIR="/home/wce/clsadmin/yosef"
#METERGEN_DIR="$LOCAL_DIR/project-iostack/meter_gen"
METERGEN_DIR="d:/UBUNTU_SHARED/GIL-PATCH/PermPUSHDOWN/SESSIONs/ARCTUR-17"
METERGEN="$METERGEN_DIR/metergen/project-iostack/meter_gen/js/meter_gen.js"
CONFIG="$METERGEN_DIR/metergen/project-iostack/meter_gen/configs"
JSON_CONFIGS=" -consumptionsFile $CONFIG/consumptions.json -climatFile $CONFIG/climats.json -locationsFile $CONFIG/locations.json -meteoFile $CONFIG/meteoData.json "
OTHER_FIXED_CONFIGS=" -temp -location -debug true "  ### -location is needed to obtain latitude and longitude -temp to obtain temperature
UTILITIES_PROGRAM="$LOCAL_DIR/LogsUtils.sh"
SWIFT_ENV="$LOCAL_DIR/SwiftEnv.sh"

### load utility functions:
source $UTILITIES_PROGRAM
source $SWIFT_ENV

UPLOAD_CONTAINER=""

############################################################
# Usage function                                           #
############################################################
usage ()
{
    echo "Usage: $scriptName meter# startDate endDate interval startID lastID out maxFileSize"
    echo "  Ex1: $scriptName 1000000  2017-07-01T00:00 2017-07-02T00:00 30 1500 2000 /run/metergen/TRY1/%Y-%M-%D/1500-2000_%N.csv   3M"

    ### Corresponds to
    ### node meter_gen.js -metersNumber 1000000 -firstDate 2017-07-01T00:00 -lastDate 2017-07-02T00:00 -interval 30 -firstID  1500 -lastID 2000  -maxFileSize 3M  -temp -location -debug true  -out /run/metergen/TRY1/%Y-%M-%D/1500-2000_%N.csv
}

function debugPrint()
{
    echo "$@"
}

scriptName=`basename "$0"`

if [ $# -lt 8 ]
then
    usage
    exit $E_BADARGS
fi

METERS_NUMBER=$1; shift
BEGIN_DATE=$1; shift
END_DATE=$1; shift
INTERVAL=$1; shift
STARTID=$1; shift
LASTID=$1; shift
OUT=$1; shift
MAX_FILE_SIZE=$1; shift

OUT=$OUT"/dt=%Y-%M-%D/%N-I-"$STARTID"-"$LASTID".csv"

cd $LOCAL_DIR
debugPrint "$scriptName Running in `hostname` from `pwd` ... STARTID=$STARTID LASTID=$LASTID"

set -x
eval $NODE $METERGEN  " -metersNumber $METERS_NUMBER"  " -firstDate $BEGIN_DATE"  " -lastDate $END_DATE "  " -interval $INTERVAL " " -maxFileSize  $MAX_FILE_SIZE "  $JSON_CONFIGS $OTHER_FIXED_CONFIGS  " -firstID $STARTID " " -lastID $LASTID " " -out  $OUT " 
debugPrint "Return code $? received after process invocation for STARTID=$STARTID LASTID=$LASTID"
set +x 
