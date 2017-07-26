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
	//"encoding/json"
	//"io"
	"fmt"
	"meter_gen"
	"os"
)

func main() {

	// Get command line arguments
	/*var params =*/ fmt.Println(meter_gen.GetParameters(os.Args[1:]))

	/*

		//
		// TODO
		//

		// Save file descriptors to faster use
		var openFiles = make(map[string]int)

		var configMeteo = GetMeteoConfig(params.meteoFile)
		var configClimat = GetClimatConfig(params.climatFile)

		var metersTab = GenerateMeters(params, configClimat.climatZone, configMeteo)

		data, err := ioutil.ReadFile(params.consumptionsFile)
		if err != nil {
			panic(err)
		}

		var configConsum = json.Unmarshal(data)

		generateDataLoop(params, configClimat, configConsum, metersTab, configMeteo)

	*/
}
