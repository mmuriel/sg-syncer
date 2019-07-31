'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebTorrent = require('webtorrent');
var fs = require('fs');

/*


	Esta clase tiene como responsabilidad, gestionar todas los métodos
	que tengan que ver con el cliente WebTorrent aplicado únicamente 
	al proyecto.


*/

var WtClient = function () {
	function WtClient() {
		_classCallCheck(this, WtClient);

		/*
  this.wtClient = new WebTorrent({
  	tracker: {
  		wrtc
    		}
    	});
    	*/
		this.wtClient = new WebTorrent();
		this.addTorrent = this.addTorrent.bind(this);
		this.seedNewTorrentFile = this.seedNewTorrentFile.bind(this);
		this.startLoggingTorrentActivity = this.startLoggingTorrentActivity.bind(this);

		this.wtClient.on("error", function (error) {

			console.log('WtClient.OnError event: ' + error);
		});

		this.wtClient.on("torrent", function (torrent) {

			console.log('OnTorrent event: ' + torrent.infoHash);
		});
	}

	_createClass(WtClient, [{
		key: 'seedNewTorrentFile',
		value: function seedNewTorrentFile(pathToFile, torrentOpts) {
			var _this = this;

			var self = this;
			return new Promise(function (resolve, reject) {

				_this.wtClient.seed(pathToFile, torrentOpts, function (torrent) {

					console.log('Se ha iniciado el proceso de \'seeding\' para el torrent:  ' + torrent.infoHash);
					self.startLoggingTorrentActivity(torrent);
					resolve(torrent);
				});
			});
		}
	}, {
		key: 'addTorrent',
		value: function addTorrent(magnetURI, pathToDest) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				var torrentRaw = _this2.wtClient.add(magnetURI, {}, function (torrent) {

					console.log("Lanzando antes del foreach...");

					torrent.files.forEach(function (file) {
						file.getBuffer(function (err, buffer) {
							if (err) {
								reject(err); //Promise error
								return;
							}
							// Mueve el archivo hasta la carpeta de destino 
							fs.writeFile(pathToDest + '/' + file.name, buffer, function (err) {
								if (err == null || typeof err == 'null') {
									resolve(torrent); //Promise OK
								} else {
									reject(err); //Promise rejected
								}
							});
						});
					});
				});
				//======================================
				_this2.startLoggingTorrentActivity(torrentRaw);
			});
		}
	}, {
		key: 'startLoggingTorrentActivity',
		value: function startLoggingTorrentActivity(torrentRaw) {

			torrentRaw.on('infohash', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Infohash event: ' + data);
			});

			torrentRaw.on('metadata', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Metadata event: ' + data);
			});

			torrentRaw.on('ready', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Ready event: ' + data);
			});

			torrentRaw.on('warning', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Warning event: ' + data);
			});

			torrentRaw.on('error', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Error event: ' + data);
				reject(data);
			});

			torrentRaw.on('download', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Download event: ' + data);
			});

			torrentRaw.on('wire', function (data) {

				console.log('[' + torrentRaw.infoHash + '] Wire event: ' + data);
			});
		}
	}]);

	return WtClient;
}();

//Usando require();


module.exports = exports = WtClient;

//Usando Import
//export default WtClient;