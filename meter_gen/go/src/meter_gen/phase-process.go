/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-08-01
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-03
**/

package meter_gen

import (
	"bufio"
	"fmt"
	"math"
	"math/rand"
	"os"
	"regexp"
	"time"
)

func getNewFileName(date *time.Time, outFormat string) string {
	return fmt.Sprintf(outFormat+"%[9]s", // print empty at the end to avoid print errors inside the string
		date.Year(),                       // 1 %Y
		date.Year()-(date.Year()/100)*100, // 2 %y
		date.Month(),                      // 3 %M
		date.YearDay(),                    // 4 %D
		date.Day(),                        // 5 %d
		date.Hour(),                       // 6 %H
		date.Minute(),                     // 7 %m
		"%[1]d",                           // 8 %N
		"")                                // print empty at the end to avoid print errors inside the string
}

var headerLine = "## ERROR: undefined header line ##\n"
var files = map[string]fileStruct{}
var totalWriten uint64

func GenerateDataLoop(params *Params, configClimat *ClimatConfig, configConsum *ConsumConfig, metersTab []Meter, configMeteo []MeteoRecord) {
	defer closeAll() // close all files when finished or in case of error

	headerLine = "vid,date,index,sumHC,sumHP,type,size"
	if params.temp {
		headerLine += ",temp"
	}
	if params.location {
		headerLine += ",city,region,lat,lng"
	}
	headerLine += "\n"

	// Declaring variables here for reusage (memory gestion)
	var minutesSinceMid int64 = 24*60 + 1 // hours since midnight, with decimals, 25 to force nextDay for first date
	var month float64
	var season string
	var dayOfWeek string
	var fileName string
	var fileNb uint64 = 1

	var progress uint64 = 0
	var progressMax uint64 = uint64(params.lastDate.Sub(params.firstDate).Minutes() / params.interval.Minutes()) // compute number of loops needed

	if params.debug {
		PrintProgress("data", progress, progressMax)
	}

	// do for each period of time
	for d := params.firstDate.Add(0); d.Before(params.lastDate); d = d.Add(params.interval) {
		minutesSinceMid += int64(params.interval.Minutes())
		var formattedDate = d.Format("2006-01-02T15:04:05-07:00")

		if minutesSinceMid >= 24*60 { // next day
			// reset day peak/offpeak indexes
			for _, meter := range metersTab {
				meter.index_op = 0
				meter.index_p = 0
			}

			// month since begining of the year, with decimals
			//month = d.diff(d.clone().startOf('year'), 'month', true);
			var startOfMonth = time.Date(d.Year(), d.Month(), 1, 0, 0, 0, 0, d.Location())
			var endOfMonth = startOfMonth.AddDate(0, 1, 0)
			var daysInYear = time.Date(d.Year(), time.December, 31, 0, 0, 0, 0, d.Location()).YearDay()
			month = float64(d.Month()) + (endOfMonth.Sub(startOfMonth).Hours()/24)/float64(daysInYear)

			// Hot season (April 1st -> October 31th)
			season = "coldS"
			if month >= 4 && month < 11 {
				season = "hotS"
			}

			dayOfWeek = "wDay"
			if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
				dayOfWeek = "wEnd"
			}

			minutesSinceMid -= 24 * 60
		}

		var hoursSinceMid float64 = float64(minutesSinceMid) / float64(60)

		var dayTime = "Evening" // Evening(17h -> 23h59)
		if hoursSinceMid <= 6 {
			dayTime = "Night" // Night (00h -> 06H)
		} else if hoursSinceMid <= 9 {
			dayTime = "Morning" // Morning (06h -> 09h)
		} else if hoursSinceMid <= 17 {
			dayTime = "Day" // Day (09h -> 17h)
		}

		var lastFileName = fileName
		fileName = getNewFileName(&d, params.out)
		if lastFileName != fileName {
			fileNb = 1
			closeAll()
		}
		var writeName = fmt.Sprintf(fileName+"%[2]s", fileNb, "")

		for _, meter := range metersTab {
			var subConfig = configConsum.gas["s"+meter.surface][season][dayOfWeek][dayTime]
			if meter.consoType == TYPE_ELE {
				subConfig = configConsum.elec["s"+meter.surface][season][dayOfWeek][dayTime]
			}

			var subClimat = configClimat.climats[meter.city.climat][season]

			var avg = float64(subConfig.avg) * float64(subClimat.RatioAvg)
			var stdev = float64(subConfig.stdev) * float64(subClimat.RatioStddev)

			// curr conso = random following avg and stdev, as consumption per interval (and not consumption per day like in data file)
			var curr_conso = (rand.NormFloat64()*stdev + avg) / (1440 / params.interval.Minutes()) // 1440 = nbMinutes per day

			// updating meter data
			meter.index += uint64(curr_conso)
			if hoursSinceMid >= 7 && hoursSinceMid <= 22 {
				meter.index_p += uint64(curr_conso * 0.001) // convert to KWh
			} else {
				meter.index_op += uint64(curr_conso * 0.001) // convert to KWh
			}

			if params.temp {
				meter.temp = computeTemperature(meter.meteoCoefs, hoursSinceMid, month)
			}

			//
			// Write to file
			var line = meter.toString(formattedDate, params.location, params.temp) + "\n"

			if !appendToFile(params, writeName, line) {
				closeFile(writeName)
				fileNb++
				writeName = fmt.Sprintf(fileName+"%[2]s", fileNb, "")
				if !appendToFile(params, writeName, line) {
					panic("ERROR: Line of data larger than given Max file size.")
				}
			}
			// Write to file
			//
		}

		if params.debug {
			progress++
			PrintProgress("data", progress, progressMax)
		}
	}

	if params.debug {
		fmt.Println() // jump over one line
	}
}

func computeTemperature(meteoCoefs map[*MeteoRecord]float64, hoursSinceMid, months float64) float64 {
	if len(meteoCoefs) <= 0 {
		return 0
	}

	// compute meteo value
	var min1 float64 = 0 // current month maximum & minimum temperatures
	var max1 float64 = 0
	var min2 float64 = 0 // next month maximum & minimum temperatures
	var max2 float64 = 0

	var month1 = int(months)                // current month
	var month2 = (month1 + 1) % 12          // next month
	var progress = months - float64(month1) // % of current month elapsed

	for meteoRecord, meteoCoef := range meteoCoefs {
		min1 += meteoCoef * meteoRecord.Min[month1]
		max1 += meteoCoef * meteoRecord.Max[month1]
		min2 += meteoCoef * meteoRecord.Min[month2]
		max2 += meteoCoef * meteoRecord.Max[month2]
	}

	// interpol months data
	max1 = max1*(1-progress) + max2*progress
	min1 = min1*(1-progress) + min2*progress

	var addedError = rand.Float64()*2 - 1 // random -1 to +1 °C

	// interpol day data (as minimum temperature is at 4AM, and maximum temperature at 4PM) and return
	if hoursSinceMid >= 4 && hoursSinceMid <= 16 { // day (temp increasing)
		// [4,16] -> [0,1] -> [min,max]
		return ((hoursSinceMid-4)/12*(max1-min1) + min1) + addedError
	}
	//else: night (temp reducing)
	// [0,4]u[16,24] -> [0,1] -> [min,max]
	return ((1-math.Mod(hoursSinceMid+8, 24)/12)*(max1-min1) + min1) + addedError
}

type fileStruct struct {
	f    *os.File
	buf  *bufio.Writer
	size uint64
}

func closeAll() {
	for fileName := range files {
		closeFile(fileName)
	}
}

func appendToFile(params *Params, fileName, line string) bool {
	var file = getFile(fileName)

	var lng = uint64(len([]byte(line)))

	if params.maxFileSize > 0 && file.size+lng > params.maxFileSize {
		return false
	}

	_, err := file.buf.WriteString(line)
	if err != nil {
		panic(err)
	}

	a, err := file.f.Stat()
	if err != nil {
		panic(err)
	}
	totalWriten -= file.size
	file.size = uint64(a.Size())
	totalWriten += file.size
	return true
}

var REGEXP_FOLDER = regexp.MustCompile(".*/")

func getFile(fileName string) *fileStruct {
	var file, hasFile = files[fileName]
	if !hasFile {
		os.MkdirAll(REGEXP_FOLDER.FindString(fileName), os.ModePerm)
		f, err := os.Create(fileName)
		if err != nil {
			panic(err)
		}

		file.f = f
		file.buf = bufio.NewWriter(f)
		files[fileName] = file

		// writting header
		_, err = file.buf.WriteString(headerLine)
		if err != nil {
			panic(err)
		}

		a, err := file.f.Stat()
		if err != nil {
			panic(err)
		}
		totalWriten -= file.size
		file.size = uint64(a.Size())
		totalWriten += file.size
	}

	return &file
}
func closeFile(fileName string) {
	var file, hasFile = files[fileName]
	if hasFile {
		file.buf.Flush()
		delete(files, fileName)
		file.f.Close()
	}
}
