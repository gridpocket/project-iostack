/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-25
**/

package meter_gen

import (
	"github.com/kardianos/osext"
	"runtime"
	"time"
)

type Params struct {
	metersNumber     uint64
	beginDate        time.Time
	endDate          time.Time
	interval         time.Duration // int64
	metersType       string
	maxFileSize      uint64
	startID          uint64
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

func IndexOf(s []string, e string) int {
	for i, a := range s {
		if a == e {
			return i
		}
	}
	return -1
}

func FileExists(name string) (bool, error) {
	err := os.Stat(name)
	if os.IsNotExist(err) {
		return false, nil
	}
	return err != nil, err
}
