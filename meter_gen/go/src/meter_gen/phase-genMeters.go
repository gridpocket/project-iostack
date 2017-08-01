/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-28
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-01
**/

package meter_gen

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"math/rand"
	//"sort"
)

const SIZE_POP_RATIO = 121.519 // average france density, used as constant ratio to reduce size of smallest cities
type location struct {
	Country string      `json:"country"`
	Region  interface{} `json:"region"`
	Name    string      `json:"name"`
	City    string      `json:"city"`
	Lat     float64     `json:"latitude"`
	Lng     float64     `json:"longitude"`
	Pop     uint64      `json:"population"`
	Density uint64      `json:"density"`
	radius  float64
}
type locChance struct {
	index    int
	roundErr float64
}

func getLocations(fileName string, totalPop uint64) []location {
	fileBytes, err := ioutil.ReadFile(fileName)
	if err != nil {
		panic(err)
	}

	var locations []location
	err = json.Unmarshal(fileBytes, &locations)
	if err != nil {
		panic(err)
	}

	var sum_pop uint64 = 0
	var readIndex int = 0
	var writeIndex int = 0
	var locLen = len(locations)

	// compute sum population and remove cities with no population
	for ; readIndex < locLen; readIndex++ {
		var curr_loc = locations[readIndex]

		if curr_loc.Pop < 1 {
			continue // not enough population in this city, not taken into acount
		}

		sum_pop += curr_loc.Pop
		if curr_loc.Density < 1 {
			curr_loc.radius = math.Sqrt(float64(curr_loc.Pop) / (math.Pi * (float64(1) + SIZE_POP_RATIO)))
		} else {
			curr_loc.radius = math.Sqrt(float64(curr_loc.Pop) / (math.Pi * (float64(curr_loc.Density) + SIZE_POP_RATIO)))
		}
		locations[writeIndex] = curr_loc
		writeIndex++
	}
	locations = locations[:writeIndex]

	// Divide city populations to obtain wanted meters number
	var chances []locChance
	var metersRemaining = totalPop

	for i := writeIndex - 1; i >= 0; i-- {
		var lc locChance
		lc.index = i

		var computedPop = float64(locations[i].Pop) * float64(totalPop) / float64(sum_pop)
		locations[i].Pop = uint64(computedPop) // rounding down

		lc.roundErr = computedPop - float64(locations[i].Pop)
		metersRemaining -= locations[i].Pop
		chances = append(chances, lc)
	}

	// Sort list as cities with more rounding errors are first indexes
	readIndex = 0
	for readIndex = len(chances) - 1; readIndex > 0; readIndex-- {
		val := chances[readIndex]
		for index2 := readIndex - 1; index2 >= 0; index2-- {
			val2 := chances[index2]
			if val.roundErr > val2.roundErr ||
				(val.roundErr == val2.roundErr && locations[val.index].Pop > locations[val2.index].Pop) {
				chances[readIndex], chances[index2] = chances[index2], chances[readIndex]
			}
		}
	}
	/*sort.Slice(chances, func(b locChance, a locChance) bool {
		if a.roundErr == b.roundErr {
			return locations[b.index].Pop > locations[a.index].Pop
		}

		return a.roundErr > b.roundErr
	})*/

	// Add missing population to have exactly the wanted meters number
	for i := 0; metersRemaining > 0; metersRemaining-- {
		idx := chances[i].index
		locations[idx].Pop++
		i++
	}

	// Remove locations with no people
	readIndex = 0
	writeIndex = 0
	locLen = len(locations)
	for ; readIndex < locLen; readIndex++ {
		var curr_loc = locations[readIndex]

		if curr_loc.Pop < 1 {
			continue // not enough population in this city, not taken into acount
		}

		locations[writeIndex] = curr_loc
		writeIndex++
	}
	locations = locations[:writeIndex]

	return locations
}

func GenerateMeters(params Params, configMeteo []MeteoRecord, zones map[string]map[string]string) []Meter {
	var locations = getLocations(params.locationsFile, params.metersNumber)

	var houseSurfaceChances = map[string]float64{"20": 0.25, "50": 0.25, "70": 0.25, "100": 0.25}
	var consoTypeChances = map[string]float64{"elec": 0.25, "gas": 0.75}

	var meterList = make([]Meter, 0)
	var curr_id uint64 = 0

	// Go forwoard until the startID (ignoring the firsts locations)
	for curr_id < params.firstID {
		var city = locations[0]
		var dec = params.firstID - curr_id
		if city.Pop < params.firstID-curr_id {
			dec = city.Pop
		}

		city.Pop -= dec
		curr_id += dec

		if city.Pop <= 0 {
			locations = locations[1:]
		}
	}

	// Compute these meters (between startID and lastID)
	var cityMeteoCenters []*MeteoRecord
	var metersCities = make(map[*location]*City)
	var lastCity *location
	var city = &locations[0]
	locations = locations[1:]
	var progress uint64 = 0
	var progressMax uint64 = params.lastID - params.firstID // computer needed number of loops

	if params.debug {
		PrintProgress("meters", 0, progressMax)
	}

	for ; curr_id < params.lastID; curr_id++ {
		var meter Meter
		meter.vid = curr_id

		// region climat
		if metersCities[city] == nil {
			var c City
			c.name = city.Name
			c.country = city.Country
			c.region = fmt.Sprint(city.Region)
			c.climat = zones[city.Country][c.region]
			metersCities[city] = &c
		}

		meter.city = metersCities[city]
		meter.surface = chooseBetween(houseSurfaceChances)

		if params.metersType == TYPE_MIX {
			meter.consoType = chooseBetween(consoTypeChances)
		} else {
			meter.consoType = params.metersType
		}

		if params.temp || params.location {
			// ÷2 (stddev should be radius/2)
			meter.lat = rand.NormFloat64()*city.radius*0.00450664730 + city.Lat // 360/39941 = 0.00901329460 ( 360° / Earth circumference (polar) in km ) ÷2 to obtain a good standard dev
			meter.lng = rand.NormFloat64()*city.radius*0.00449157829 + city.Lng // 360/40075 = 0.00898315658 ( 360° / Earth circumference (equator) in km ) ÷2 to obtain a good standard dev

			if params.temp {
				// If changed city, and cityMeteoCenters not already = Array.from(configMeteo.values());
				if lastCity != city && !(lastCity != nil && lastCity.Pop <= 1 && city.Pop <= 1) {
					cityMeteoCenters = make([]*MeteoRecord, 0)

					if city.Pop >= 2 {
						// compute city's nearest meteo centers (only for cities of 2 or more meters)

						// find nearest meteo data in all France meteo centers
						for _, thisConfMeteo := range configMeteo {
							if distance(city.Lat, city.Lng, thisConfMeteo.Lat, thisConfMeteo.Lng) < 1 {
								// ignore far data (data from more than 1°Lat/lng distance)
								cityMeteoCenters = append(cityMeteoCenters, &thisConfMeteo)
							}
						}

					}
				}

				if len(cityMeteoCenters) <= 0 {
					// Add all
					for _, conf := range configMeteo {
						cityMeteoCenters = append(cityMeteoCenters, &conf)
					}
				}

				// find meter's nearest meteo centers

				// sorting by distance
				for i := len(cityMeteoCenters) - 1; i > 0; i-- {
					for j := i - 1; j >= 0; j-- {
						if distance(meter.lat, meter.lng, cityMeteoCenters[i].Lat, cityMeteoCenters[i].Lng) <
							distance(meter.lat, meter.lng, cityMeteoCenters[j].Lat, cityMeteoCenters[j].Lng) {
							cityMeteoCenters[i], cityMeteoCenters[j] = cityMeteoCenters[j], cityMeteoCenters[i]
						}
					}
				}

				// Keep only nearest
				// and compute total of coefs (to reduce-it to 1)
				var meteoCoefs = make(map[*MeteoRecord]float64)
				var totalCoefs float64
				for i := int(math.Max(5, float64(len(cityMeteoCenters)))) - 1; i >= 0; i-- {
					var coef = 1 / (distance(meter.lat, meter.lng, cityMeteoCenters[i].Lat, cityMeteoCenters[i].Lng) + 0.0001)
					meteoCoefs[cityMeteoCenters[i]] = coef
					totalCoefs += coef
				}

				// compute meteo coefs for the meter
				for key := range meteoCoefs {
					meteoCoefs[key] /= totalCoefs
				}
			}
		}

		// Add data to files for this meter
		meterList = append(meterList, meter)

		// If this is the last person on this city, following loop will use next location
		city.Pop--

		if city.Pop <= 0 && len(locations) > 0 {
			city = &locations[0]      // next turn on the next city
			locations = locations[1:] // shift array
		}

		if params.debug {
			progress++
			PrintProgress("meters", progress, progressMax)
		}
	}

	if params.debug {
		fmt.Println()
	}

	return meterList
}

func chooseBetween(m map[string]float64) string {
	var rnd = rand.Float64()

	for key, chance := range m {
		rnd -= chance
		if rnd <= 0 {
			return key
		}
	}

	return ""
}

func distance(lat1, lng1, lat2, lng2 float64) float64 {
	return math.Sqrt((lat1-lat2)*(lat1-lat2) + (lng1-lng2)*(lng1-lng2))
}
