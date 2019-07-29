'use strict';
let WebServer = require('../models/WebServer');
let WebSocketsServer = require('../models/WebSocketsServer');
let FileWatcher = require('../models/FileWatcher');
let WtClient = require('../models/WtClient');
let SgDb = require('../classes/SgDb');
let SgHelpers = require('../classes/SgHelpers');

class SgServerController{

	constructor(sgConf) {
		this.db = {};
		this.helpers = {};
		this.socketsServer = {};
		this.fileWatcher = {};
		this.wtClient = {};
		this.sgConf = sgConf;

		this.dispatchForNewFile = function(data){
			console.log(`Data desde dispatchForNewFile... ${data}`);
		}
	}

	init(){

		console.log("Iniciando...");

		let pathToPublic, httpPort, pathToSource, pathToDb;
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
		let webServer = new WebServer(pathToPublic,httpPort);
		this.socketsServer = new WebSocketsServer(webServer.wserver);
		//===========================================================================
		//2. Empieza a escuchar por nuevos archivos en la carpeta seleccionada
		//===========================================================================
		this.fileWatcher = new FileWatcher(pathToSource);
		let token = this.fileWatcher.subscribeToWatchFile(this.dispatchForNewFile);
		//console.log(token);

		//2.1. Inicia la observacion de archivos de video
		this.fileWatcher.startWatchForFiles(

			(data)=>{//Cuando detecta un nuevo archivo...

				console.log(`Nuevo archivo ingresado... ${data}`);

				//2.2. 	Agrega al cliente de webtorrent el archivos de video,
				//		en términos del protocolo bittorrent "seed-ea" el archivo
				this.wtClient.seedNewTorrentFile(data).then((torrent)=>{

					console.log(`Nuevo torrent: ${torrent.path}`);

					//2.2.	Una vez "seed-eado" el archivo, se registra en la DB de archivos
					this.db.select('torrents','*',`(hashid = '${torrent.infoHash}')`).then((data)=>{
						//console.log(data);
						if (data.length === 0){
							let values = {
								hashid:torrent.infoHash,
								created_at:this.helpers.getStrDateTimeForDB(new Date()),
								magnetURI:torrent.magnetURI,
								filename:torrent.files[0].name
							};
							this.db.insert('torrents',values);
						}
						else{
							console.log(`Ya existe el registro del torrent ${torrent.infoHash} en la DB`)
						}
					});

					//2.3.	Se notifica a toda la red, de nuevo archivo de video
					this.socketsServer.emitMessageToSockets('new torrent',{hashid:torrent.infohash,magnetUri:torrent.magnetURI});

				});

			}
		);
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