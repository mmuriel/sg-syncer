'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SgHelper = function () {
	function SgHelper() {
		_classCallCheck(this, SgHelper);
	}

	_createClass(SgHelper, [{
		key: 'getStrDateTimeForDB',
		value: function getStrDateTimeForDB(datetime) {
			var month = datetime.getMonth();
			month++;
			if (month < 10) month = '0' + month;
			var day = datetime.getDate();
			if (day < 10) day = '0' + day;
			var hour = datetime.getHours();
			if (hour < 10) hour = '0' + hour;
			var min = datetime.getMinutes();
			if (min < 10) min = '0' + min;
			var sec = datetime.getSeconds();
			if (sec < 10) sec = '0' + sec;
			return datetime.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '.000';
		}
	}]);

	return SgHelper;
}();

module.exports = exports = SgHelper;