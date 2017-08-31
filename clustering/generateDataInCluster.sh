#!/bin/bash

####################################################################################
#
# generateDataInCluster.sh distributes the data generation in the cluster
#
#
# Yosef Moatti   moatti@il.ibm.com
# 25th June 017
#
# version 2.4
# Initial working version
#
# Assumptions:
# 1. sshpass is installed on all the targetted machines of the cluster
#
#######################################################################

### Constants definitions:
LOCAL_DIR="/home/wce/clsadmin/yosef"
UTILITIES_PROGRAM="$LOCAL_DIR/LogsUtils.sh"
SWIFT_ENV="$LOCAL_DIR/SwiftEnv.sh"
SINGLE_NODE="$LOCAL_DIR/generateDataSingleNode.sh"

### load utility functions:
source $UTILITIES_PROGRAM
source $SWIFT_ENV

############################################################
# Usage function                                           #
############################################################
usage ()
{
    echo $1
    echo "Usage: $scriptName clusterLowIP clusterSize passwd meter# startDate  endDate    interval out      maxFileSize "
    echo "  Ex:  $scriptName 10.30.1.21   3             myPw 10000  2016/02/01 2016/02/05 30       outYosef 3M"
    exit 1
}

function debugPrint()
{
    echo "$@"
}

if [ $# -ne 9 ]; then
    usage
    exit $E_BADARGS
fi

#############

scriptName=`basename "$0"`
echo "scriptName is $scriptName"
DEBUG_FILE="$scriptName"-"`getDateNoSpace`"
echo " InCluster running in `hostname` DEBUG_FILE is $DEBUG_FILE"

BASE_IP=$1; shift
CLUSTER_SIZE=$1; shift
PASSWD=$1; shift
METERS_NUMBER=$1; shift
BEGIN_DATE=$1; shift
END_DATE=$1; shift
INTERVAL=$1; shift
OUT=$1; shift
MAX_FILE_SIZE=$1; shift

debugPrint "$scriptName Running in `hostname` from " `pwd` " $METERS_NUMBER meters...\n"

NEXT_IP=$BASE_IP
debugPrint $DEBUG_FILE  "NEXT_IP init is $NEXT_IP"
for i in $(seq 1 $CLUSTER_SIZE); do
    debugPrint " handling now node number $i..."
    PER_NODE=$(($METERS_NUMBER / $CLUSTER_SIZE))
    STARTID=$(( $PER_NODE * ($i - 1) ))
    LASTID=$(( $PER_NODE * $i ))
    if [ $i -eq $CLUSTER_SIZE ]; then
	LASTID=$METERS_NUMBER
    fi
    GENERATE_COMMAND="$SINGLE_NODE $METERS_NUMBER $BEGIN_DATE $END_DATE $INTERVAL $OUT $MAX_FILE_SIZE $STARTID $LASTID"
    debugPrint $scriptName "about to invoke remoteAction in " $NEXT_IP " with command = " $GENERATE_COMMAND
    sshpass -p $PASSWD ssh $NEXT_IP $GENERATE_COMMAND & 

    ### Increment the IP for next loop iteration:
    NEXT_IP=$(nextIp $NEXT_IP)
    
done

# Since this script is generally invoked from a remote node with ssh, we have to block till all launched
# processed complete:
waitForProcessGroup $SINGLE_NODE
