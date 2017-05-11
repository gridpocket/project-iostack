/*
* @Author: Nathaël Noguès
* 
* GridPocket SAS Copyright (C) 2016 All Rights Reserved
* This source is property of GridPocket SAS. Please email contact@gridpocket.com for more information.
* 
* @File name:	map.js
* @Date:   2017-05-11
* @Last Modified by:   Nathaël Noguès
* @Last Modified time: 2017-05-11
*
* @Description:
*/

/* jshint esversion: 6 */

var map1;

console.log('LOADED !!');
function initMap1() {
	map1 = new Map('map1');
}

function Map(mapName) {
	const mapParams = {zoom: 5,center: {lat:42, lng:7}}; // show mediteranean zone by default
	this.map = new google.maps.Map(document.getElementById(mapName), mapParams);
	this.data = new google.maps.MVCArray();

	this.minMark = { 
		mark: new google.maps.Marker({
			position: new google.maps.LatLng(0,0), 
			map: this.map, 
			label: '-', 
			title: 'Minimum', 
			icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png'
		}),
		wgtValue: null
	};

	this.maxMark = {
		mark: new google.maps.Marker({
			position: new google.maps.LatLng(0,0),
			map: this.map,
			label: '+',
			title: 'Maximum',
			icon: 'http://maps.google.com/mapfiles/ms/icons/red.png'
		}),
		wgtValue: null
	};

	this.heatmap = new google.maps.visualization.HeatmapLayer({
		data: this.data,
		map: this.map,
		gradient:[
			'rgba(255, 0, 255, 0)',
			'rgba(0, 0, 255, 1)',
			'rgba(0, 255, 255, 1)',
			'rgba(0, 255, 0, 1)',
			'rgba(127, 255, 0, 1)',
			'rgba(255, 255, 0, 1)',
			'rgba(255, 127, 0, 1)',
			'rgba(255, 0, 0, 1)']
	});

	this.addPoint = function(lat, lng, wgt) {
		const thisPoint = {
			location: new google.maps.LatLng(lat,lng), 
			weight: wgt
		};

		this.data.push(thisPoint);

		if(this.maxMark.wgtValue === null || wgt > this.maxMark.wgtValue) {
			this.maxMark.mark.setPosition(thisPoint.location);
			this.maxMark.wgtValue = wgt;
		}
		if(this.minMark.wgtValue === null || wgt < this.minMark.wgtValue) {
			this.minMark.mark.setPosition(thisPoint.location);
			this.minMark.wgtValue = wgt;
		}
	};

	this.rmAllPoints = function() {
		this.data.clear();
		this.maxMark.wgtValue = null;
		this.minMark.wgtValue = null;
	};

	this.centerAndZoom = function() {
		if(this.heatmap.data.length < 2) // Needs at least 2 points
			return;
		
		//places is an array that contains the search result
	    const bounds = new google.maps.LatLngBounds();
	    for (let i=this.data.getLength()-1; i>=0; i--) {
	    	bounds.extend(this.data.getAt(i).location);
	    }
	    //tell your map to sets the viewport to contain all the places.
	    this.map.fitBounds(bounds);
	};

	this.changeRadiusAndIntensity = function(radius, intensity) {
        this.heatmap.set('radius', radius);
        this.heatmap.set('maxIntensity', intensity);
    };
}
