/*!
 * adBDetect v0.0.1
 * Author https://github.com/MuhBayu
 * Licensed under MIT
 * Based on Javascript
*/
var adBDetect = {
	detect:false,
	pageLoad:'ad-detect.html', // Default
	timeLoad:500, // Default
	setPage:function(n) {
		return adBDetect.pageLoad = n;
	},
	setTime:function(n) {
		return adBDetect.timeLoad = n;
	},
	loadPage:function() {
		var xmlhttp = new XMLHttpRequest();
    	xmlhttp.open("GET", adBDetect.pageLoad, false);
    	xmlhttp.send();
    	window.setTimeout(function() {
    		return document.getElementsByTagName('html')[0].innerHTML = xmlhttp.responseText;
    	}, adBDetect.timeLoad);
	},
	init:function() {
		var ad = document.createElement('div');
		ad.innerHTML = '&nbsp;&nbsp;&nbsp;';
		ad.className = window.atob('YWRzYnlnb29nbGU=');
		document.body.appendChild(ad);
		if(ad.offsetHeight===0) adBDetect.detect = true;
		return this;
	},
	isEnabled:function() {
		adBDetect.init();
		return adBDetect.detect;
	},
	start:function() {
		if(adBDetect.isEnabled()){
			adBDetect.loadPage();
		}
	}
};