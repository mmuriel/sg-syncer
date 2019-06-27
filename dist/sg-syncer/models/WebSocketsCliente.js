'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var socketIoClient = require('socket.io-client');

var WebSocketsCliente = function () {
	function WebSocketsCliente(socketEndPoint, SgCnf) {
		_classCallCheck(this, WebSocketsCliente);

		/* Instancia un cliente  */
		this.socket = socketIoClient.connect(socketEndPoint);
		this.sgCnf = SgCnf;
		this.startListenToSocket();
	}

	_createClass(WebSocketsCliente, [{
		key: 'startListenToSocket',
		value: function startListenToSocket() {
			var _this = this;

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
				_this.socket.emit('subscribe', { 'room': '' + _this.sgCnf.sgtoken });

				//Pide los ultimos videos para sincronizarse con el servidor
				var dateNow = new Date(Date.now() - 3600 * 24 * 15 * 1000);
				//let dateNow = new Date(Date.now() + (3000  * 1000));
				//console.log(dateNow);
				var strDateNow = SgHelper.getStrDateTimeForDB(dateNow);
				_askForVideos(strDateNow);
			});

			this.socket.on('last torrents', function (data) {
				var _loop = function _loop(i) {
					//console.log(data[i]);
					if (!_checkIfTorrentIsActive(data[i].hashid)) {

						var promise = SgDb.select('torrents', 'hashid,created_at,magnetURI,filename', ' hashid="' + data[i].hashid + '" ');
						promise.then(function (dataDb) {
							//Gestiona la promesa en exito

							//1. Verifica si se retornaron registros para el nombre de archivo generado
							if (dataDb.length === 0) {

								_addFileToTorrent(data[i].magnetURI).then(function (dataRes) {
									console.log(dataRes);
								}, function (dataErr) {
									console.log(dataErr);
								});
							}
						}, function (err) {

							//Gestiona la promesa en error
							console.log("Error: ");
							console.log(err);
						});
					} else {

						console.log('El torrent ' + data[i].hashid + ' ya est\xE1 activo...');
					}
				};

				//console.log(data);
				for (var i = 0; i < data.length; i++) {
					_loop(i);
				}
			});

			this.socket.on('pushalltorrents', function (data) {

				console.log('Recibiendo el reporte de todos los torrents activos en el server...');
				data.torrents.forEach(function (infoHash, index, arr) {
					console.log(infoHash);
				});
			});
		}
	}]);

	return WebSocketsCliente;
}();