'use strict';
var SgCnf = require('./SgCnf.js');

var SgHelper = (function(SgCnf){
	
	return {

		//It recieves a Date object
		getStrDateTimeForDB : function (datetime){

					let month = datetime.getMonth();
					month++;
					if (month < 10)
						month = `0${month}`;
					let day = datetime.getDate();
					if (day < 10)
						day = `0${day}`;
					let hour = datetime.getHours();
					if (hour < 10)
						hour = `0${hour}`;
					let min = datetime.getMinutes();
					if (min < 10)
						min = `0${min}`;
					let sec = datetime.getSeconds();
					if (sec < 10)
						sec = `0${sec}`;

					return `${datetime.getFullYear()}-${month}-${day} ${hour}:${min}:${sec}.000`;
		}

	}

})(SgCnf);

module.exports = exports = SgHelper;