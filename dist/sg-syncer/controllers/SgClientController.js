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
			this.db = new SgDb(this.sgCnf.pathToDb);
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

				console.log("Nuevo torrent disponible: " + data.magnetUri);
				_this.wtClient.addTorrent(data.magnetUri, _this.sgCnf.pathToDest).then(function (torrent) {

					console.log('Se ha descargado satisfactoriamente el torrent al cliente ' + torrent.infoHash);
				}, function (err) {
					console.log('Error descargando el archivo torrent: ' + err);
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
				var strDateNow = _this.helpers.getStrDateTimeForDB(dateNow);
			});
		}
	}]);

	return SgClientController;
}();

module.exports = exports = SgClientController;