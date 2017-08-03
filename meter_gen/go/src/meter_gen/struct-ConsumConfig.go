/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-08-01
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-02
**/

package meter_gen

import (
	"encoding/json"
	"io/ioutil"
)

type ConsumConfig struct {
	// {"elec":{"s20":{"coldS":{"wDay":{"Night":{"avg":2996,"stddev":30},...},...},...},...}
	elec map[string]map[string]map[string]map[string]consumConfValue `json:"elec"`
	gas  map[string]map[string]map[string]map[string]consumConfValue `json:"gas"`
}
type consumConfValue struct {
	avg   int `json:"avg"`
	stdev int `json:"stddev"`
}

func GetConsumConfig(climatFilePath string) ConsumConfig {
	fileBytes, err := ioutil.ReadFile(climatFilePath)
	if err != nil {
		panic(err)
	}

	var configFile ConsumConfig
	err = json.Unmarshal(fileBytes, &configFile) // get config file as json object
	if err != nil {
		panic(err)
	}

	return configFile
}
