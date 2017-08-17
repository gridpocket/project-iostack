/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-08-17 13:25:05
**/

package meter_gen

import "fmt"

type Meter struct {
	vid        uint64
	index      uint64
	index_op   uint64
	index_p    uint64
	consoType  string
	surface    string
	lat        float64
	lng        float64
	city       *City
	temp       float64
	meteoCoefs map[*MeteoRecord]float64
}

func (this *Meter) toString(formattedDate string, printsLocation, printsTemp bool) string {
	var text = fmt.Sprintf("METER%06d,%s,%v,%v,%v,%s,%s",
		this.vid,
		formattedDate,
		this.index,
		this.index_op,
		this.index_p,
		this.consoType,
		this.surface)

	if printsLocation {
		text = fmt.Sprintf("%s,%.06f,%.06f,%s,%s",
			text,
			this.lat,
			this.lng,
			this.city.name,
			this.city.region)
	}
	if printsTemp {
		text = fmt.Sprintf("%s,%.2f", text, this.temp)
	}
	return text
}

type City struct {
	name    string
	country string
	region  string
	climat  string
}
