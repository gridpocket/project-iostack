/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-31
**/

package meter_gen

import (
	"fmt"
	"time"
)

const (
	TYPE_ELE = "elec"
	TYPE_GAS = "gas"
	TYPE_MIX = "mix"
)

type Params struct {
	metersNumber     uint64
	firstDate        time.Time
	lastDate         time.Time
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
	var nbDates uint64 = uint64(p.lastDate.Unix()-p.firstDate.Unix()) / uint64(p.interval.Seconds())
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
		p.firstDate,
		p.lastDate,
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
