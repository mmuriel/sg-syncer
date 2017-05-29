'use strict';

/* Dependiencias */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chokidar = require('chokidar');

/*

	Esta clase tiene como unica responsabilidad, notificar de la existencia
	de un nuevo archivo en una carpeta

	Responde al patrón pub/sub

*/

var FileWatcher = function () {
	function FileWatcher(pathToSource) {
		_classCallCheck(this, FileWatcher);

		this.callBacks = [];
		this.subUid = -1;
		this.watcher = chokidar.watch(pathToSource);
		//this.publishNewFile = this.publishNewFile.bind(this);
	}

	_createClass(FileWatcher, [{
		key: 'subscribeToWatchFile',
		value: function subscribeToWatchFile(callback) {

			var token = (++this.subUid).toString();
			this.callBacks.push({ callback: callback, token: token });
			return token;
		}
	}, {
		key: 'publishNewFile',
		value: function publishNewFile(data) {

			for (var i = 0; i < this.callBacks.length; i++) {

				this.callBacks[i].callback(data);
			}
			return true;
		}
	}, {
		key: 'startWatchForFiles',
		value: function startWatchForFiles(notify) {
			var _this = this;

			this.watcher.on('add', function (pathToSource, data) {
				var expReg = new RegExp("\\.mov$|\\.mpg$|\\.mpeg$|\\.wmv$");
				if (typeof pathToSource == 'string') {

					if (expReg.test(pathToSource)) {

						_this.publishNewFile(pathToSource);
						notify(pathToSource);
					} else {
						console.log('No es un archivo de video ' + pathToSource);
					}
				} else {
					console.log("No se ha definido un path valido hasta el archivo");
				}
			});
		}
	}]);

	return FileWatcher;
}();

//Usando require();


module.exports = exports = FileWatcher;

//Usando Import
//export default FileWatcher;