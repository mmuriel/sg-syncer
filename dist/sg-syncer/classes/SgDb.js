'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sqlite = require('sqlite-sync');

//Connecting - if the file does not exist it will be created


var SgDb = function () {
	function SgDb(pathToDb) {
		_classCallCheck(this, SgDb);

		this.db = sqlite;
		this.db.connect(pathToDb);
		this.db.run("CREATE TABLE if not exists torrents (hashid text PRIMARY KEY,created_at text,magnetURI text,filename text)");
	}

	_createClass(SgDb, [{
		key: 'select',
		value: function select(table, fields, where) {
			var _this = this;

			return new Promise(function (resolve, reject) {

				_this.db.runAsync('select ' + fields + ' from ' + table + ' where ' + where, function (res) {
					if (typeof res.error != 'undefined') {
						reject(res.error);
					} else {
						resolve(res);
					}
				});
			});
		}
	}, {
		key: 'insert',
		value: function insert(table, values) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				_this2.db.insert(table, values, function (res) {
					if (typeof res.error != 'undefined') {
						reject(res.error);
					} else {
						resolve(res);
					}
				});
			});
		}
	}]);

	return SgDb;
}();

//Exportamos el módulo


module.exports = exports = SgDb;