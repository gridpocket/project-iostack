/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-01
**/

package meter_gen

import (
	"encoding/json"
	"fmt"
	"github.com/kardianos/osext"
	"os"
	"path"
)

func GetMeterGenDir() string {
	ex, err := osext.Executable()
	if err != nil {
		panic(err)
	}
	return path.Dir(ex)
}

func GetExecutionDir() string {
	return "."
}

func IndexOf(arr []string, test string) int {
	for i, a := range arr {
		if a == test {
			return i
		}
	}
	return -1
}

func FileExists(filePath string) (bool, error) {
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		return false, nil
	}
	return err == nil, err
}

func JsonToStrMap(jsonObject []byte) (map[string]string, error) {
	var strMap = make(map[string]string)

	var jsonMap map[string]interface{}
	err := json.Unmarshal(jsonObject, &jsonMap) // get config file as json object
	if err != nil {
		return strMap, err
	}

	for key, val := range jsonMap {
		strMap[key] = fmt.Sprint(val)
	}

	return strMap, nil
}
func JsonToStrSlice(jsonObject []byte) ([]string, error) {
	var strSlice []string

	var jsonMap []interface{}
	err := json.Unmarshal(jsonObject, &jsonMap) // get config file as json object
	if err != nil {
		return strSlice, err
	}

	for _, val := range jsonMap {
		strSlice = append(strSlice, fmt.Sprint(val))
	}

	return strSlice, nil
}

func InterfaceSliceToFloat64(slice []interface{}) ([]float64, interface{}) {
	var ret = make([]float64, 0)

	for _, val := range slice {
		floatVal, b := val.(float64)
		if b {
			ret = append(ret, floatVal)
		} else {
			return nil, val
		}
	}

	return ret, nil
}

func InterfaceSliceToString(slice []interface{}) []string {
	var ret = make([]string, 0)

	for _, val := range slice {
		ret = append(ret, fmt.Sprint(val))
	}

	return ret
}

func PrintProgress(phase string, progress uint64, max uint64) {
	// TODO
	fmt.Printf("%s: %d/%d (%5.2f%%)\r", phase, progress, max, float64(100*progress)/float64(max))
}
