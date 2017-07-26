/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-26
 *
 * Usage :
 *	  ./meter_gen (options...)
 *
 * Example usage:
 *	 ./meter_gen -metersNumber 10 -beginDate '2016/01/01' -endDate '2016/12/31' -interval 60 -metersType elec -location
**/

package main

import (
	"meter_gen"
	"os"
)

func main() {
	meter_gen.Main(os.Args[1:])
}
