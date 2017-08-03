/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-02
**/

package meter_gen

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

type ClimatConfig struct {
	// {"FR":{"01":"Mediteranean", "02":"Oceanic", ...}, "US":{...}, ...}
	//       country    region  climatName
	zones map[string]map[string]string

	//{"Mediteranean":{"coldS":<coefs>, "hotS":<coefs>},"Oceanic":{...}, ...}
	//      climatName    season
	climats map[string]map[string]Coefs
}
type Coefs struct {
	// {"RatioAvg":0.66, "RatioStddev":1.24}
	RatioAvg    float32 `json:"RatioAvg"`
	RatioStddev float32 `json:"RatioStddev"`
}

type jsonClimatConfig struct {
	//       climatName    season
	Climats map[string]map[string]Coefs `json:"climats"`

	//              country  climatName  regionID
	ClimatsZones map[string]map[string][]interface{} `json:"climatZone"`
}

func GetClimatConfig(climatFilePath string) ClimatConfig {
	fileBytes, err := ioutil.ReadFile(climatFilePath)
	if err != nil {
		panic(err)
	}

	var configFile jsonClimatConfig
	err = json.Unmarshal(fileBytes, &configFile) // get config file as json object
	if err != nil {
		panic(err)
	}

	var ret ClimatConfig
	ret.climats = configFile.Climats
	ret.zones = map[string]map[string]string{}

	for countryName, cMap := range configFile.ClimatsZones {
		ret.zones[countryName] = make(map[string]string)
		for climatName, rSlice := range cMap {
			for _, regionName := range rSlice {
				ret.zones[countryName][fmt.Sprint(regionName)] = climatName
			}
		}
	}

	return ret
}

func (this *ClimatConfig) GetCoefsFor(country, region, season string) Coefs {
	return this.climats[this.zones[country][region]][season]
}
