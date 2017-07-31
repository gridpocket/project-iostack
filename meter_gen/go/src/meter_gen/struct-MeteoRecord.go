/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-28
**/

package meter_gen

import (
	"encoding/json"
	//"fmt"
	"io/ioutil"
	//"strconv"
)

type MeteoRecord struct {
	//id   string
	Lat  float64   `json:"lat"`
	Lng  float64   `json:"lng"`
	Min  []float64 `json:"min"`
	Max  []float64 `json:"max"`
	Heat []float64 `json:"heat"`
	Cool []float64 `json:"cool"`
}

func GetMeteoConfig(meteoFileName string) []MeteoRecord {
	fileBytes, err := ioutil.ReadFile(meteoFileName)
	if err != nil {
		panic(err)
	}

	var meteoConfig []MeteoRecord
	err = json.Unmarshal(fileBytes, &meteoConfig)
	if err != nil {
		panic(err)
	}

	return meteoConfig
}
