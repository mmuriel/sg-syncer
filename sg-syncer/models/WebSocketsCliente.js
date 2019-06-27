'use strict';
let socketIoClient = require('socket.io-client');


class WebSocketsCliente{


	constructor(socketEndPoint,SgCnf) {
		
		/* Instancia un cliente  */
		this.socket = socketIoClient.connect(socketEndPoint);
		this.sgCnf = SgCnf;
		this.startListenToSocket();
		
	}


	startListenToSocket (){

		this.socket.on('new torrent', (data)=>{

			console.log("Nuevo torrent disponible: "+data.magnetURI);
			this.addFileToTorrent(data.magnetURI).then((data)=>{

					console.log(`Exito descargando... ${data.infoHash}`);

				},
				(err)=>{

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
			this.socket.emit('subscribe',{'room':`${this.sgCnf.sgtoken}`});


			//Pide los ultimos videos para sincronizarse con el servidor
			let dateNow = new Date(Date.now() - (3600 * 24 * 15 * 1000));
			//let dateNow = new Date(Date.now() + (3000  * 1000));
			//console.log(dateNow);
			let strDateNow = SgHelper.getStrDateTimeForDB(dateNow);
			_askForVideos(strDateNow);

		});

		this.socket.on('last torrents',(data)=>{

			
			//console.log(data);
			for (let i=0; i < data.length;i++){
				//console.log(data[i]);
				if (! _checkIfTorrentIsActive(data[i].hashid)){

					let promise = SgDb.select('torrents','hashid,created_at,magnetURI,filename',` hashid="${data[i].hashid}" `);
					promise.then(function(dataDb){
						//Gestiona la promesa en exito

						//1. Verifica si se retornaron registros para el nombre de archivo generado
						if(dataDb.length === 0){
							
							_addFileToTorrent(data[i].magnetURI).then(function(dataRes){
								console.log(dataRes);
								
							},function(dataErr){
								console.log(dataErr);
								
							});
							
						}
						
						
					},function(err){

						//Gestiona la promesa en error
						console.log("Error: ");
						console.log(err);
					});
				}
				else {

					console.log(`El torrent ${data[i].hashid} ya está activo...`);

				}
			}			

		});


		this.socket.on('pushalltorrents',(data)=>{

			console.log('Recibiendo el reporte de todos los torrents activos en el server...');
			data.torrents.forEach((infoHash,index,arr) => {
				console.log(infoHash);

			})

		});

	}


}