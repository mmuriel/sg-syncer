'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebServer = require('../models/WebServer');
var WebSocketsServer = require('../models/WebSocketsServer');
var FileWatcher = require('../models/FileWatcher');
var WtClient = require('../models/WtClient');
var SgDb = require('../classes/SgDb');
var SgHelpers = require('../classes/SgHelpers');

var SgServerController = function () {
	function SgServerController(sgConf) {
		_classCallCheck(this, SgServerController);

		this.db = {};
		this.helpers = {};
		this.socketsServer = {};
		this.fileWatcher = {};
		this.wtClient = {};
		this.sgConf = sgConf;

		this.dispatchForNewFile = function (data) {
			console.log('Data desde dispatchForNewFile... ' + data);
		};
	}

	_createClass(SgServerController, [{
		key: 'init',
		value: function init() {
			var _this = this;

			console.log("Iniciando...");

			var pathToPublic = void 0,
			    httpPort = void 0,
			    pathToSource = void 0,
			    pathToDb = void 0;
			pathToPublic = this.sgConf.pathToPublic;
			httpPort = this.sgConf.httpPort;
			pathToSource = this.sgConf.pathToSource;
			pathToDb = this.sgConf.pathToDb;

			//===========================================================================
			//Inicializa los servicios
			//===========================================================================
			this.db = new SgDb(pathToDb);
			this.helpers = new SgHelpers();
			//===========================================================================
			//1. Inicia el servidor de sockets
			//===========================================================================
			var webServer = new WebServer(pathToPublic, httpPort);
			this.socketsServer = new WebSocketsServer(webServer.wserver);
			//===========================================================================
			//2. Empieza a escuchar por nuevos archivos en la carpeta seleccionada
			//===========================================================================
			this.fileWatcher = new FileWatcher(pathToSource);
			var token = this.fileWatcher.subscribeToWatchFile(this.dispatchForNewFile);
			//console.log(token);

			//2.1. Inicia la observacion de archivos de video
			this.fileWatcher.startWatchForFiles(function (data) {
				//Cuando detecta un nuevo archivo...

				console.log('Nuevo archivo ingresado... ' + data);

				//2.2. 	Agrega al cliente de webtorrent el archivos de video,
				//		en términos del protocolo bittorrent "seed-ea" el archivo
				_this.wtClient.seedNewTorrentFile(data, {}).then(function (torrent) {
					//2.2.	Una vez "seed-eado" el archivo, se registra en la DB de archivos
					_this.db.select('torrents', '*', '(hashid = \'' + torrent.infoHash + '\')').then(function (data) {
						console.log('Recuperando los datos desde la DB: ' + data);
						if (data == 'undefined' || data == null) {
							var values = [torrent.infoHash, _this.helpers.getStrDateTimeForDB(new Date()), torrent.magnetURI, torrent.files[0].name];
							_this.db.insert('torrents', values);
						} else {
							console.log('Ya existe el registro del torrent ' + torrent.infoHash + ' en la DB');
						}
					});

					//2.3.	Se notifica a toda la red, de nuevo archivo de video
					_this.socketsServer.emitMessageToSockets('new torrent', { hashid: torrent.infohash, magnetUri: torrent.magnetURI });
				});
			});
			//===========================================================================
			//3. Inicializa el cliente de webtorrent
			//===========================================================================
			this.wtClient = new WtClient();
			//===========================================================================
			//4. Empieza a escuchar los sockets
			//===========================================================================
			this.socketsServer.startToListenSocketsEvents(this.db, this.wtClient);
		}
	}]);

	return SgServerController;
}();

module.exports = exports = SgServerController;