/*
* @Author: Nathaël Noguès
* 
* GridPocket SAS Copyright (C) 2016 All Rights Reserved
* This source is property of GridPocket SAS. Please email contact@gridpocket.com for more information.
* 
* @File name:	meteoCSVtoJSON.js
* @Date:   2017-05-09
* @Last Modified by:   Nathaël Noguès
* @Last Modified time: 2017-05-09
*
* @Description:
*/

/*jshint esversion: 6 */

// Read file Tempe_REF_mensuel.txt
// For each line
// If starts with #, ignore
// else split ';'
// Column0 = id
// Column1 = Latitude
// Column2 = Longitude
// Column5 = Mois (1-12)
// Column7 = Minimum temp
// Column8 = Maximum temp
// Column23 = Intégration de degré-jours de chauffage (°C)
// Column24 = Intégration de degré-jours de climatisation (°C)

const map = new Map();
const lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('Tempe_REF_mensuel.txt')
});


lineReader.on('line', line => {
	if(line.charAt(0) === '#')
		return; // nextLine

	const tab = line.split(';');
	const id = tab[0]|0; // parseint
	const month = (tab[5]|0) -1; // parseint

	if(!map.has(id)) {	
		const obj = {
			id: id,
			lat: parseFloat(tab[1]),
			lon: parseFloat(tab[2]),
			min: [null,null,null,null,null,null,null,null,null,null,null,null],
			max: [null,null,null,null,null,null,null,null,null,null,null,null],
			heat: [null,null,null,null,null,null,null,null,null,null,null,null],
			cool: [null,null,null,null,null,null,null,null,null,null,null,null]
		};

		map.set(id, obj);
	}

	const obj = map.get(id);
	obj.min[month] = parseFloat(tab[7]);
	obj.max[month] = parseFloat(tab[8]);
	obj.heat[month] = parseFloat(tab[23]);
	obj.cool[month] = parseFloat(tab[24]);
}).on('close', () => {
	// convert map to json object
	let mapIter = map.values();

	console.log('['+JSON.stringify(mapIter.next().value));

	for(let v of mapIter) {
		console.log(','+JSON.stringify(v));
	}
	console.log(']');

  	process.exit(0);
});

