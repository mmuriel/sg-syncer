'use strict';
let socketIoClient = require('socket.io-client');
let WtClient = require('../models/WtClient');
let SgDb = require('../classes/SgDb');
let SgHelpers = require('../classes/SgHelpers');

class SgClientController{

	constructor(SgCnf) {
		
		this.db = {};
		this.helpers = {};
		this.socket = {};
		this.wtClient = {};
		this.sgCnf = SgCnf;
	}


	init(){

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

		this.socket.on('new torrent', (data)=>{

			console.log("Nuevo torrent disponible: "+data.magnetUri);
			this.wtClient.addTorrent(data.magnetUri,this.sgCnf.pathToDest).then((torrent) => {

				console.log(`Se ha descargado satisfactoriamente el torrent al cliente ${torrent.infoHash}`);

			},(err)=>{
				console.log(`Error descargando el archivo torrent: ${err}`);
			});

		});

		this.socket.on('connect',()=>{

			console.log("Conectado");
			/*
			socket.emit("message",{"message":"Soy yo..."});
			socket.emit('personalizado',{"id":"MacBookPro","name":"MM"});
			*/

			//Se suscribe a un canal de chat para comunicación privada
			this.socket.emit('subscribe',{'room':`${this.sgCnf.sgtoken}`});


			//Pide los ultimos videos para sincronizarse con el servidor
			let dateNow = new Date(Date.now() - (3600 * 24 * 15 * 1000));
			//let dateNow = new Date(Date.now() + (3000  * 1000));
			//console.log(dateNow);
			let strDateNow = this.helpers.getStrDateTimeForDB(dateNow);

		});
	}
}


module.exports = exports = SgClientController;