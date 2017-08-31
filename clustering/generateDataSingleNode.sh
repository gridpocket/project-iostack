#!/bin/bash

####################################################################################
#
# generateDataSingleNode.sh invokes concurrent processes to which part of the data generation is delegated
#
# Yosef Moatti   moatti@il.ibm.com
# 08th June 017
#
# version 2.2
# Initial working version
#######################################################################

### Constants definitions:
LOCAL_DIR="."
#LOCAL_DIR="/home/wce/clsadmin/yosef/IOStackPerfScripts"
UTILITIES_PROGRAM="$LOCAL_DIR/LogsUtils.sh"
#SWIFT_ENV="$LOCAL_DIR/SwiftEnv.sh"
SINGLE_PROCESS="$LOCAL_DIR/generateDataSingleProcess.sh"

### load utility functions:
source $UTILITIES_PROGRAM
#source $SWIFT_ENV

############################################################
# Usage function                                           #
############################################################
function usage ()
{
    echo $1
    echo "Usage: $scriptName meter# startDate endDate interval out maxFileSize [ startID lastID ] "
    echo "  Ex1: $scriptName 10000  2016/02/01 2016/02/05 30 outYosef 3M"
    echo "  Ex2: $scriptName 10000  2016/02/01 2016/02/05 30 outYosef 3M 1000 2000 "
    exit 1
}

function debugPrint()
{
    echo "$@"
}

function getCoresToBeUsed()
{
    local TOTAL_CORES=`cat /proc/cpuinfo | grep processor | wc -l`
    local CORES=$((($TOTAL_CORES * 4) / 5))
    ### Handle the case where CORES is now 0:
    if [ "$CORES" -lt 1 ]; then
	CORES=1
    fi
    echo $CORES
}


cd $LOCAL_DIR
scriptName=`basename "$0"`
USED_CORES=`getCoresToBeUsed`

if [ $# -ne 6 -a $# -ne 8 ]; then
    usage
    exit $E_BADARGS
fi

STACK=get_stack
printf "$scriptName running in `hostname` with $USED_CORES cores. Invocation stack is " $STACK 

METERS_NUMBER=$1; shift
BEGIN_DATE=$1; shift
END_DATE=$1; shift
INTERVAL=$1; shift
OUT=$1; shift
MAX_FILE_SIZE=$1; shift

#OUT=$OUT/dt=%Y-%M-%D/%N-I-$STARTID-$LASTID".csv"

if [ $# -eq 2 ]; then
    FULL_STARTID=$1; shift
    FULL_LASTID=$1; shift
    ### check that both of them are integers:
    if [ "`isInteger $FULL_STARTID`" = "NO" ] || [ "`isInteger $FULL_LASTID`" =  "NO" ]; then
	usage "Both of the 2 last arguments: $FULL_STARTID and $FULL_LASTID  should be integers!"
    fi
    FILE_NAME_EXT=" -fileNameExt I-$STARTID-$LASTID "
else
    FULL_STARTID=0;
    FULL_LASTID=$METERS_NUMBER
fi
METERS_RANGE=$(($FULL_LASTID - $FULL_STARTID))

debugPrint "$scriptName Running in `hostname` from directory: `pwd` $METERS_NUMBER meters to be handled with $USED_CORES cores....\n"

for i in $(seq 1 $USED_CORES); do
    debugPrint " handling now processor number $i..."
    STARTID=$(($FULL_STARTID + (($METERS_RANGE / $USED_CORES) * ($i - 1))))
    LASTID=$(($FULL_STARTID + (($METERS_RANGE / $USED_CORES) * $i)))
    if [ $i -eq $USED_CORES ]; then
	LASTID=$FULL_LASTID
    fi
    eval $SINGLE_PROCESS $METERS_NUMBER $BEGIN_DATE $END_DATE $INTERVAL $STARTID $LASTID $OUT $MAX_FILE_SIZE & 
done

# Since this script is generally invoked from a remote node with ssh, we have to block till all launched
# processed complete:

waitForProcessGroup $SINGLE_PROCESS
