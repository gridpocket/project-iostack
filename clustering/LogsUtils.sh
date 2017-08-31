#!/bin/bash

####################################################################################
#
# LogsUtilities contains utility functions used both by EntryScript and GETCount 
#
# Yosef Moatti   moatti@il.ibm.com
# 24th May 017
#
# version 2.3
#  remoteAction() moved to LogUtils
# 2.1
# mkdir -p ssflog added
# 2.0
# nextIp() moved to this file
# 1.1
# Initial version
#
####################################################################################

DEBUG_ROOT_DIRECTORY="./ssflogs"

function get_stack ()
{
   STACK=""
   # to avoid noise we start with 1 to skip get_stack caller
   local i
   local stack_size=${#FUNCNAME[@]}
   for (( i=1; i<$stack_size ; i++ )); do
      local func="${FUNCNAME[$i]}"
      [ x$func = x ] && func=MAIN
      local linen="${BASH_LINENO[(( i - 1 ))]}"
      local src="${BASH_SOURCE[$i]}"
      [ x"$src" = x ] && src=non_file_source

      STACK+=$'\n'"   "$func" "$src" "$linen
   done
   echo $STACK
}

function getDateNoSpace()
{
    echo  `date | sed 's/ /_/g'`
}

#
# This function builds the name of the log file for this script it assumes
# at least one parameter which is the suffix to which will be appended the date
# it may have additional parameters which will all be added in order as suffix
# with a "-" prefix for each of these parameters
#
function buildLogFileName()
{
    local result="$DEBUG_ROOT_DIRECTORY/$1"; shift;

    mkdir -p ./$DEBUG_ROOT_DIRECTORY

    ### handle each of the sufixed parameters:
    while [ $# -ge 1 ];do
	local NEXT_SUFIX="-$1"
	shift
	result=$result$NEXT_SUFIX
    done
    
    ### add `date` as a suffix:
    local DATE=`getDateNoSpace`
    
    echo "$result-$DATE"
}

function createLogsDirs()
{
    mkdir -p $DEBUG_ROOT_DIRECTORY        ### create directory where logs will be written.  No error if already existing
    mkdir -p $DEBUG_ROOT_DIRECTORY/BACK   ### create BACK directory for logs.  No error if already existing
}

function moveOldLogsToBack()
{
    cd $DEBUG_ROOT_DIRECTORY
    local COUNT=`ls *-* | wc -l`  ### any log file name contains a "-" character!
    if [ $COUNT -gt 0 ]; then
	mv *-* ./BACK
    fi
    cd ..
}

function isWindows()
{
    if [[ "`uname`" == "CYGWIN_NT-6.1" ]]; then
	echo "1"
    fi
}

function nextIp()
{
    local IP=$1
    local IP_HEX=$(printf '%.2X%.2X%.2X%.2X\n' `echo $IP | sed -e 's/\./ /g'`)
    local NEXT_IP_HEX=$(printf %.8X `echo $(( 0x$IP_HEX + 1 ))`)
    local NEXT_IP=$(printf '%d.%d.%d.%d\n' `echo $NEXT_IP_HEX | sed -r 's/(..)/0x\1 /g'`)

    echo "$NEXT_IP"
}

### returns "YES/NO" depending on whether sole string argument is an integer
function isInteger()
{
    inputString=$1
    regExp='^[0-9]+$'
    if  [[ $inputString =~ $regExp ]] ; then
	echo "YES"
    else
	echo "NO"
    fi
}

function localPrint()
{
    local TARGET=$1; shift
    echo "$@" > $TARGET
}

################################################################
#
#  Executes a command in a list of remote nodes
#
#  Expected parameters:
#  1.  DEBUG_FILE
#  2.  the first IP where the command should be executed
#  3.  the number of nodes  in which the command should be exectuted
#  4.  the password to access the remote nodes
#  5.  the command to be executed (may be a series of strings)
#
#  Note: the IPs of the nodes are assumed to form a convex segment (no hole)
#
################################################################

function remoteAction()
{
    if [ $# -lt 5 ]; then
	echo "remoteAction requires at least 5 parameters: DEBUG FILE FIRST_IP NUMBER_OF_NODES PASSWD  COMMAND , we only got the following:  $@"
	exit $E_BADARGS
    fi

    local DEBUG_FILE=$1; shift
    local BASEIP=$1; shift
    local MAX=$1; shift
    local PASSWD=$1; shift
    local COMMAND="$@"
    
    local SSH_NORMAL="ssh"
    local SSH_KNOWN_HOSTS="ssh -o \\\"StrictHostKeyChecking no\\\" "
    local SSHPASS="sshpass -p $PASSWD"
    local SSH=$SSH_NORMAL

    local FULL_RC=0

    localPrint $DEBUG_FILE get_stack
    ### set -x  ### 
    localPrint $DEBUG_FILE "remoteAction invoked on node $BASEIP and following $MAX -1 nodes):  \"$COMMAND\" " 
    NEXT_IP=$BASEIP
    localPrint $DEBUG_FILE  "NEXT_IP init is $NEXT_IP"
    for ((i = 1; i <= $MAX; i++)); do
        ### Invoke command on targetted node:
	FULL_COMMAND="$SSHPASS $SSH $NEXT_IP $COMMAND"
	localPrint $DEBUG_FILE "$FULL_COMMAND"
	###        RC= `$SSHPASS $SSH $NEXT_IP $COMMAND`
	eval $FULL_COMMAND
        EXIT_CODE=$?
        if [[ "$EXIT_CODE" -ne "0" ]]; then
    	    localPrint $DEBUG_FILE  "removeAction failure $EXIT_CODE for command: $FULL_COMMAND invoked on $NEXT_IP"
    	    exit $EXIT_CODE
        fi		

        localPrint $DEBUG_FILE  "Return code after $COMMAND for $NEXT_IP is " $RC
        FULL_RC="$FULL_RC $RC"

	### Increment NEXT_IP for next for loop iteration:
	NEXT_IP=$(nextIp $NEXT_IP)
	localPrint $DEBUG_FILE  "NEXT_IP increment -> $NEXT_IP"
    done

    localPrint $DEBUG_FILE " Returned code is $FULL_RC"
    localPrint $DEBUG_FILE "------ remoteAction completed ------"
    return $FULL_RC
}


################################################################
#
#  Waits till end of execution of a group of processes
#
#  Expected parameters:
#  1.  a string which permits to identity the processes that have to be waited for
#
#  Return as return code the number of processes which faile after completion of all waited for processes
#
################################################################

function waitForProcessGroup()
{
###    GREP_STRING=$1
    
    ### Since this script is in general invoked through sshpass from another node, we have to wait till
    ### all launched processed complete before we exit:
    FAIL=0
    for job in `jobs -p`
    do
	debugPrint "waiting for "  $job
	wait $job || let "FAIL+=1"
    done
    
    debugPrint " we had  $FAIL failed $SINGLE_PROCESS invocations"
    return $FAIL
}
