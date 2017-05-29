'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebSocketsServer = require('../models/WebSocketsServer');
var WebServer = require('../models/WebServer');
var FileWatcher = require('../models/FileWatcher');
var WtClient = require('../models/WtClient');
var SgDb = require('../classes/SgDb');
var SgHelpers = require('../classes/SgHelpers');

var SgServerController = function () {
	function SgServerController() {
		_classCallCheck(this, SgServerController);

		this.dispatchForNewFile = this.dispatchForNewFile.bind(this);
	}

	_createClass(SgServerController, [{
		key: 'init',
		value: function init(pathToPublic, httpPort, pathToSource, pathToDb) {

			console.log("Iniciando...");

			//===========================================================================
			//Inicializa los servicios
			//===========================================================================
			this.db = new SgDb(pathToDb);
			this.helpers = new SgHelpers();
			//===========================================================================
			//1. Inicia el servidor de sockets
			//===========================================================================
			var webServer = new WebServer(pathToPublic, httpPort);

			/*
   this.socketsServer = new WebSocketsServer(webServer);
   
   	//===========================================================================
   //2. Empieza a escuchar por nuevos archivos en la carpeta seleccionada
   //===========================================================================
   this.fileWatcher = new FileWatcher(pathToSource);
   this.fileWatcher.startWatchForFiles((data)=>{
   		console.log(`Nuevo archivo ingresado... ${data}`);
   	});
   		//===========================================================================
   //3. Inicializa el cliente de webtorrent
   //===========================================================================
   this.wtClient = new WtClient();
   		//===========================================================================
   //4. Empieza a escuchar los sockets
   //===========================================================================
   this.socketsServer.startListenToSockets(this.db,this.wtClient);
   	//===========================================================================
   //5. Vincula la funcion con pub/sub de nuevos archivos
   //===========================================================================
   this.fileWatcher.subscribeToWatchFile(this.dispacthForNewFile);
   */
		}
	}, {
		key: 'dispatchForNewFile',
		value: function dispatchForNewFile(data) {

			console.log('Data desde dispatchForNewFile... ' + data);
		}
	}]);

	return SgServerController;
}();

module.exports = exports = SgServerController;