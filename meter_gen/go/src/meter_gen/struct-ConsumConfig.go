/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-08-01
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-17 14:41:04
**/

package meter_gen

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

type ConsumConfig struct {
	// {"elec":{"s20":{"coldS":{"wDay":{"Night":{"avg":2996,"stddev":30},...},...},...},...}
	elec map[string]map[string]map[string]map[string]ConsumConfValue `json:"elec"`
	gas  map[string]map[string]map[string]map[string]ConsumConfValue `json:"gas"`
}
type ConsumConfValue struct {
	avg   int `json:"avg"`
	stdev int `json:"stddev"`
}

func GetConsumConfig(climatFilePath string) ConsumConfig {
	fileBytes, err := ioutil.ReadFile(climatFilePath)
	if err != nil {
		panic(err)
	}

	var configConsum ConsumConfig
	err = json.Unmarshal(fileBytes, &configConsum) // get config file as json object
	if err != nil {
		panic(err)
	}

	fmt.Println("0...", climatFilePath)
	for a, b := range configConsum.elec {
		fmt.Println(a, ": ", b)
	}
	fmt.Println("1...")

	return configConsum
}
