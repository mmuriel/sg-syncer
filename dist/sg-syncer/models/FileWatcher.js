'use strict';
/*

	Esta clase tiene como unica responsabilidad, notificar de la existencia
	de un nuevo archivo en una carpeta

	Responde al patrón pub/sub

*/

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileWatcher = function () {
	function FileWatcher() {
		_classCallCheck(this, FileWatcher);

		this.callBacks = {};
		this.subUid = -1;
	}

	_createClass(FileWatcher, [{
		key: 'subscribeToWatchFile',
		value: function subscribeToWatchFile(callback) {

			var token = (++this.subUid).toString();
			this.callBacks.push({ callback: callback, token: token });
			return token;
		}
	}]);

	return FileWatcher;
}();

module.exports = exports = FileWatcher;