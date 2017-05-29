'use strict';
let WebSocketsServer = require('../models/WebSocketsServer');
let WebServer = require('../models/WebServer');
let FileWatcher = require('../models/FileWatcher');
let WtClient = require('../models/WtClient');
let SgDb = require('../classes/SgDb');
let SgHelpers = require('../classes/SgHelpers');

class SgServerController{

	constructor() {
		
		this.db = {};
		this.helpers = {};
		this.socketsServer = {};
		this.fileWatcher = {};
		this.wtClient = {};
		this.dispatchForNewFile = function(data){
			console.log(`Data desde dispatchForNewFile... ${data}`);
		}
	}


	init(pathToPublic,httpPort,pathToSource,pathToDb){

		console.log("Iniciando...");

		//===========================================================================
		//Inicializa los servicios
		//===========================================================================
		this.db = new SgDb(pathToDb);
		this.helpers = new SgHelpers();
		//===========================================================================
		//1. Inicia el servidor de sockets
		//===========================================================================
		let webServer = new WebServer(pathToPublic,httpPort);
		this.socketsServer = new WebSocketsServer(webServer);
		

		//===========================================================================
		//2. Empieza a escuchar por nuevos archivos en la carpeta seleccionada
		//===========================================================================
		this.fileWatcher = new FileWatcher(pathToSource);
		let token = this.fileWatcher.subscribeToWatchFile(this.dispatchForNewFile);
		console.log(token);

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
		this.socketsServer.startToListenSocketsEvents(this.db,this.wtClient);
		
		
	}


	

}


module.exports = exports = SgServerController;