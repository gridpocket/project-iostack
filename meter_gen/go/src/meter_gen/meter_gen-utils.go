/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-26
**/

package meter_gen

import (
	"fmt"
	"github.com/kardianos/osext"
	"os"
	"path"
	"time"
)

const (
	TYPE_ELE = "elec"
	TYPE_GAS = "gas"
	TYPE_MIX = "mix"
)

type Params struct {
	metersNumber     uint64
	beginDate        time.Time
	endDate          time.Time
	interval         time.Duration // int64
	metersType       string
	maxFileSize      uint64
	firstID          uint64
	lastID           uint64
	temp             bool
	location         bool
	consumptionsFile string
	climatFile       string
	meteoFile        string
	locationsFile    string
	out              string
	debug            bool
}

func (p Params) String() string {
	var nbDates uint64 = uint64(p.endDate.Unix()-p.beginDate.Unix()) / uint64(p.interval.Seconds())
	var nbData uint64 = nbDates * (p.lastID - p.firstID)
	var nbDataTotal uint64 = nbDates * p.metersNumber

	return fmt.Sprintf(`Params:
	Meters %d to %d/%d (%d/%d data),
	from: %v,
	to:   %v,
	each: %v minutes,
	type: %s,
	maxFileSize: %d B,
	consumptionsFile: %s,
	climatFile:       %s,
	meteoFile:        %s,
	locationsFile:    %s,
	out: %v,
	temp:     %v,
	location: %v,
	debug:    %v`,
		p.firstID,
		p.lastID-1,
		p.metersNumber,
		nbData,
		nbDataTotal,
		p.beginDate,
		p.endDate,
		int(p.interval.Minutes()),
		p.metersType,
		p.maxFileSize,
		p.consumptionsFile,
		p.climatFile,
		p.meteoFile,
		p.locationsFile,
		p.out,
		p.temp,
		p.location,
		p.debug)
}

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

func JsonFileToStrMap(filePath string) (map[string]string, error) {
	fileBytes, err := ioutil.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	return JsonAsMapStr(fileBytes)
}
func JsonToStrMap(jsonObject []byte) (map[string]string, error) {
	var strMap = make(map[string]string)

	var jsonMap map[string]interface{}
	err = json.Unmarshal(jsonObject, &jsonMap) // get config file as json object
	if err != nil {
		return strMap, err
	}

	for key, val := range jsonMap {
		strMap[key] = fmt.Sprint(val)
	}

	return strMap, nil
}
func JsonToStrSlice(jsonObject []byte) ([]string, error) {
	var strSlice = make([]string)

	var jsonMap []interface{}
	err = json.Unmarshal(jsonObject, &jsonMap) // get config file as json object
	if err != nil {
		return strSlice, err
	}

	for _, val := range jsonMap {
		strSlice.append(fmt.Sprint(val))
	}

	return strSlice, nil
}
