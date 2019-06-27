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

		this.socket.on('new torrent', (data)=>{

			console.log("Nuevo torrent disponible: "+data.magnetURI);
			this.addFileToTorrent(data.magnetURI).then((data)=>{

					console.log(`Exito descargando... ${data.infoHash}`);

				},
				function(err){

					console.log("Error descargando el torrent");
					console.log(err);

				}
			);
		});

		this.socket.on('connect',()=>{

			console.log("Conectado");
			/*
			socket.emit("message",{"message":"Soy yo..."});
			socket.emit('personalizado',{"id":"MacBookPro","name":"MM"});
			*/

			//Se suscribe a un canal de chat para comunicación privada
			this.socket.emit('subscribe',{'room':`${SgCnf.sgtoken}`});


			//Pide los ultimos videos para sincronizarse con el servidor
			let dateNow = new Date(Date.now() - (3600 * 24 * 15 * 1000));
			//let dateNow = new Date(Date.now() + (3000  * 1000));
			//console.log(dateNow);
			let strDateNow = this.helpers.getStrDateTimeForDB(dateNow);

		});
	}

	addFileToTorrent (magnetURI){

		return new Promise ((fulfill,reject)=>{

			var resAdd = this.wtClient.add(magnetURI,{},(torrent) => {
			//wtClient.add(magnetURI,{path:`${SgCnf.pathToDest}`},function (torrent) {	

				//console.log(torrent);
				//fulfill(torrent);
				torrent.files.forEach((file) => {
					console.log('Started saving ' + file.name)
					file.getBuffer((err, buffer) => {
						if (err) {
							console.error('Error downloading ' + file.name)
							reject(err);//Promise error
							return
						}
						// Mueve el archivo hasta la carpeta de destino 
						fs.writeFile(`${this.sgCnf.pathToDest}/${file.name}`, buffer, (err) => {
							if (err == null || typeof err == 'null'){
							  console.log(`Downloading ${file.name}...`);
							  //Registra en la base de datos una vez el archivo torrent se ha descargado
							  let dateNow = new Date();
							  let values = {

								hashid:`${torrent.infoHash}`,
								created_at:this.helpers.getStrDateTimeForDB(dateNow),
								magnetURI:`${torrent.magnetURI}`,
								filename:`${torrent.name}`

							  };
							  this.db.insert('torrents',values);
							  fulfill(torrent);//Promise OK
							}
							else{
							  console.log(err);
							} 
						})
						
					})
				})
			})

			//console.log(resAdd);
		})
	}




}


module.exports = exports = SgClientController;