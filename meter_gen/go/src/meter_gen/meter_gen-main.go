/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-26
 *
**/

package meter_gen

import (
	//"encoding/json"
	//"io"
	"fmt"
)

func Main(args []string) {

	// Get command line arguments
	/*var params =*/ fmt.Println(GetParameters(args))
	// Save file descriptors to faster use
	/*var openFiles = make(map[string]int)*/

	/*var configMeteo = fmt.Println(GetMeteoConfig(params.meteoFile))*/
	/*var configClimat =*/ fmt.Println(GetClimatConfig(params.climatFile))

	/*
		//
		// TODO
		//

		var metersTab = GenerateMeters(params, configClimat.climatZone, configMeteo)

		data, err := ioutil.ReadFile(params.consumptionsFile)
		if err != nil {
			panic(err)
		}

		var configConsum = json.Unmarshal(data)

		generateDataLoop(params, configClimat, configConsum, metersTab, configMeteo)
	*/
}

func getClimatConfig(climatFilePath string) map[string]map[string]string {
	var climatMap = make(map[string]map[string]string)
	/* {
	 *    "FR": {
	 *       "a": "Climat1",
	 *       "b": "Climat1",
	 *       "c": "Climat2",
	 *       "d": "Climat2"
	 *    },
	 *    "US": {
	 *       "a": "Climat1",
	 *       "b": "Climat1",
	 *       "c": "Climat2",
	 *       "d": "Climat2"
	 *    }
	 * }
	 */

	var jsonData = JsonFileToStrMap(climatFilePath)
	/* {
	 *    "FR": "{\"Climat1\":[\"a\",\"b\"], \"Climat2\":[\"c\",\"d\"]}",
	 *    "US": "{\"Climat1\":[\"a\",\"b\"], \"Climat2\":[\"c\",\"d\"]}"
	 *    ...
	 * }
	 */

	for countryID, strClimats := range jsonData {
		// countryID:   "FR"
		var subMap = make(map[string]string)

		var climats = JsonToStrMap([]byte(strClimats))
		// {
		//    "Climat1": "[\"a\",\"b\"]",
		//    "Climat2": "[\"c\",\"d\"]"
		//    ...
		// }

		for climat, strRegions := range climats {
			// climat:	"Climat1"

			var regions = JsonToStrSlice([]byte(strRegions))
			// [a b]

			for _, region := range regions {
				subMap[region] = climat
			}
		}

		climatMap[countryID] = subMap
	}

	return climatMap
}
