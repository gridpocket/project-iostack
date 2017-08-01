/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-01
 *
**/

package meter_gen

func Main(args []string) {
	// Get command line arguments
	var params = GetParameters(args)

	// Get configs needed to generate meters
	var configMeteo = GetMeteoConfig(params.meteoFile)
	var configClimat = GetClimatConfig(params.climatFile)

	// Generate meters
	var metersTab = GenerateMeters(params, configMeteo, configClimat.zones)

	// Get configs needed to generate data
	var configConsum = GetConsumConfig(params.consumptionsFile)

	// Generate data
	GenerateDataLoop(params, configClimat, configConsum, metersTab, configMeteo)
}
