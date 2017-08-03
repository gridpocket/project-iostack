/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-03
 *
**/

package meter_gen

import (
	"fmt"
	"time"
)

func Main(args []string) {
	var start = time.Now().UnixNano()

	// Get command line arguments
	var params = GetParameters(args)
	// fmt.Println(params.String())

	// Get configs needed to generate meters
	var configMeteo = GetMeteoConfig(params.meteoFile)
	var configClimat = GetClimatConfig(params.climatFile)

	// Get configs needed to generate data
	var configConsum = GetConsumConfig(params.consumptionsFile)

	if params.debug {
		var afterLoadedConfigs = time.Now().UnixNano()
		fmt.Printf("params: %.2fs\n", float64(afterLoadedConfigs-start)/float64(time.Second))
	}

	// Generate meters
	var metersTab = GenerateMeters(&params, configMeteo, configClimat.zones)

	if params.debug {
		var afterGeneratedMeters = time.Now().UnixNano()
		fmt.Printf("meters: %.2fs\n", float64(afterGeneratedMeters-afterLoadedConfigs)/float64(time.Second))
	}

	// Generate data
	GenerateDataLoop(&params, &configClimat, &configConsum, metersTab, configMeteo)

	if params.debug {
		var end = time.Now().UnixNano()
		fmt.Printf("data: %.2fs\n", float64(end-afterGeneratedMeters)/float64(time.Second))
		fmt.Printf("total: %.2fs\n", float64(end-start)/float64(time.Second))
	}
}
