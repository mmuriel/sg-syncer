'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var socketIoClient = require('socket.io-client');
var WtClient = require('../models/WtClient');
var SgDb = require('../classes/SgDb');
var SgHelpers = require('../classes/SgHelpers');

var SgClientController = function () {
	function SgClientController(SgCnf) {
		_classCallCheck(this, SgClientController);

		this.db = {};
		this.helpers = {};
		this.socket = {};
		this.wtClient = {};
		this.sgCnf = SgCnf;
	}

	_createClass(SgClientController, [{
		key: 'init',
		value: function init() {
			var _this = this;

			console.log("Iniciando cliente...");

			//===========================================================================
			//Inicializa los servicios
			//===========================================================================
			this.db = new SgDb(pathToDb);
			this.helpers = new SgHelpers();
			//===========================================================================
			//1. Inicilializa el cliente de webtorrent
			//===========================================================================
			this.wtClient = new WtClient();
			//===========================================================================
			//2. Inicializa el cliente de webtorrent
			//===========================================================================
			this.socket = socketIoClient.connect(this.sgCnf.socketEndPoint);
			//===========================================================================
			//3. Empieza a escuchar eventos del servidor de sockets
			//===========================================================================

			this.socket.on('new torrent', function (data) {

				console.log("Nuevo torrent disponible: " + data.magnetURI);
				_this.addFileToTorrent(data.magnetURI).then(function (data) {

					console.log('Exito descargando... ' + data.infoHash);
				}, function (err) {

					console.log("Error descargando el torrent");
					console.log(err);
				});
			});

			this.socket.on('connect', function () {

				console.log("Conectado");
				/*
    socket.emit("message",{"message":"Soy yo..."});
    socket.emit('personalizado',{"id":"MacBookPro","name":"MM"});
    */

				//Se suscribe a un canal de chat para comunicación privada
				_this.socket.emit('subscribe', { 'room': '' + SgCnf.sgtoken });

				//Pide los ultimos videos para sincronizarse con el servidor
				var dateNow = new Date(Date.now() - 3600 * 24 * 15 * 1000);
				//let dateNow = new Date(Date.now() + (3000  * 1000));
				//console.log(dateNow);
				var strDateNow = _this.helpers.getStrDateTimeForDB(dateNow);
			});
		}
	}, {
		key: 'addFileToTorrent',
		value: function addFileToTorrent(magnetURI) {
			var _this2 = this;

			return new Promise(function (fulfill, reject) {

				var resAdd = _this2.wtClient.add(magnetURI, {}, function (torrent) {
					//wtClient.add(magnetURI,{path:`${SgCnf.pathToDest}`},function (torrent) {	

					//console.log(torrent);
					//fulfill(torrent);
					torrent.files.forEach(function (file) {
						console.log('Started saving ' + file.name);
						file.getBuffer(function (err, buffer) {
							if (err) {
								console.error('Error downloading ' + file.name);
								reject(err); //Promise error
								return;
							}
							// Mueve el archivo hasta la carpeta de destino 
							fs.writeFile(_this2.sgCnf.pathToDest + '/' + file.name, buffer, function (err) {
								if (err == null || typeof err == 'null') {
									console.log('Downloading ' + file.name + '...');
									//Registra en la base de datos una vez el archivo torrent se ha descargado
									var dateNow = new Date();
									var values = {

										hashid: '' + torrent.infoHash,
										created_at: _this2.helpers.getStrDateTimeForDB(dateNow),
										magnetURI: '' + torrent.magnetURI,
										filename: '' + torrent.name

									};
									_this2.db.insert('torrents', values);
									fulfill(torrent); //Promise OK
								} else {
									console.log(err);
								}
							});
						});
					});
				});

				//console.log(resAdd);
			});
		}
	}]);

	return SgClientController;
}();

module.exports = exports = SgClientController;