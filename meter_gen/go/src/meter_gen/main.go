/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-31
 *
**/

package meter_gen

import (
	//"encoding/json"
	//"io"
	"fmt"
	//"io/ioutil"
)

func Main(args []string) {

	// Get command line arguments
	var params = GetParameters(args)

	// Save file descriptors to faster use
	/*var openFiles = make(map[string]int)*/

	var configMeteo = GetMeteoConfig(params.meteoFile)
	var configClimat = GetClimatConfig(params.climatFile)

	var metersTab = GenerateMeters(params, configMeteo, configClimat.zones)

	fmt.Print(len(metersTab), metersTab[0])

	/*
		//
		// TODO
		//

		data, err := ioutil.ReadFile(params.consumptionsFile)
		if err != nil {
			panic(err)
		}

		var configConsum = json.Unmarshal(data)

		GenerateDataLoop(params, configClimat, configConsum, metersTab, configMeteo)
	*/
}
