/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-24
 *
 * Usage :
 *	  ./meter_gen (options...)
 *
 * Example usage:
 *	 ./meter_gen -metersNumber 10 -beginDate '2016/01/01' -endDate '2016/12/31' -interval 60 -metersType elec -location
**/

package meter_gen

import (
	"encoding/json"
	"io"
	"os"
)

func main() {
	// Save file descriptors to faster use
	var openFiles = make(map[string]int)

	// Get command line arguments
	var params = getParameters(os.Args[1:])

	var configMeteo = getMeteoConfig(params.meteoFile)
	var configClimat = getClimatConfig(params.climatFile)

	var metersTab = generateMeters(params, configClimat.climatZone, configMeteo)

	data, err := ioutil.ReadFile(params.consumptionsFile)
	if err != nil {
		panic(err)
	}

	var configConsum = json.Unmarshal(data)

	generateDataLoop(params, configClimat, configConsum, metersTab, configMeteo)
}
