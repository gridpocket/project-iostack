#!/bin/sh
#
# @Author: Nathaël Noguès
# @Date:   2017-07-26
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-07-26

SCRIPTPATH=$(dirname "$(readlink -f "$0")")
cd $SCRIPTPATH

if [ -z $GOPATH ]; then export GOPATH=$HOME/.go/; fi

mkdir -p $GOPATH/src/meter_gen/
rm -rf $GOPATH/src/meter_gen/*
cp ./src/meter_gen/* $GOPATH/src/meter_gen/

go build ./src/meter_gen.go