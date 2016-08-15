'use strict';

/* Requerimientos */
var socketIoClient = require('socket.io-client');
var SgCnf = require('./SgCnf.js');
var SgDb = require('./SgDb.js');
var SgHelper = require('./SgHelper.js');
var socket = socketIoClient.connect(SgCnf.socketEndPoint);
var WebTorrent = require('webtorrent')
var fs = require('fs')
var client = new WebTorrent();



var SgCliente = (function(socket,wtClient,fs,SgDb,SgCnf,SgHelper){

	var _startListenToSocket = function(){

		socket.on('new torrent', function(data){

			console.log("Nuevo torrent disponible: "+data.magnetURI);
			_addFileToTorrent(data.magnetURI).then(function(data){

					console.log(`Exito descargando... ${data.infoHash}`);

				},
				function(err){

					console.log("Error descargando el torrent");
					console.log(err);

				}
			);
		});

		socket.on('connect',function(){

			console.log("Conectado");
			/*
			socket.emit("message",{"message":"Soy yo..."});
			socket.emit('personalizado',{"id":"MacBookPro","name":"MM"});
			*/

			//Se suscribe a un canal de chat para comunicación privada
			socket.emit('subscribe',{'room':`${SgCnf.sgtoken}`});


			//Pide los ultimos videos para sincronizarse con el servidor
			let dateNow = new Date(Date.now() - (3600 * 24 * 15 * 1000));
			//let dateNow = new Date(Date.now() + (3000  * 1000));
			//console.log(dateNow);
			let strDateNow = SgHelper.getStrDateTimeForDB(dateNow);
			_askForVideos(strDateNow);

		});

		socket.on('last torrents',function(data){

			
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
			

			//console.log('Recibiendo get last torrents');			

		});


		socket.on('pushalltorrents',function(data){

			console.log('Recibiendo el reporte de todos los torrents activos en el server...');

			data.torrents.forEach((infoHash,index,arr) => {

				console.log(infoHash);

			})

		});

	}

	var _addFileToTorrent = function (magnetURI){

		return new Promise (function(fulfill,reject){

			var resAdd = wtClient.add(magnetURI,{},function (torrent) {
			//wtClient.add(magnetURI,{path:`${SgCnf.pathToDest}`},function (torrent) {	

				//console.log(torrent.infoHash);
				//fulfill(torrent);
				torrent.files.forEach(function (file) {
					console.log('Started saving ' + file.name)
					file.getBuffer(function (err, buffer) {
						if (err) {
							console.error('Error downloading ' + file.name)
							reject(err);//Promise error
							return
						}
						// Mueve el archivo hasta la carpeta de destino 
						fs.writeFile(`${SgCnf.pathToDest}/${file.name}`, buffer, function (err) {
							if (err == null || typeof err == 'null'){
							  console.log(`Downloading ${file.name}...`);
							  //Registra en la base de datos una vez el archivo torrent se ha descargado
							  let dateNow = new Date();
							  let values = {

								hashid:`${torrent.infoHash}`,
								created_at:SgHelper.getStrDateTimeForDB(dateNow),
								magnetURI:`${torrent.magnetURI}`,
								filename:`${torrent.name}`

							  };
							  SgDb.insert('torrents',values);
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

	var _askForVideos = function (date){

		socket.emit('getlasttorrents',{'token':`${SgCnf.sgtoken}`,'date':`${date}`});

	}

	var _askForActiveTorrentsOnServer = function(){

		socket.emit('getalltorrents',{'token':`${SgCnf.sgtoken}`});		

	}

	var _checkIfTorrentIsActive = function (infohash){

		for (let i =0 ; i < wtClient.torrents.length; i++){
			if (wtClient.torrents[i].infoHash === infohash){
				return true;
			}
		}
		return false;
	}


	var _reAddTorrentsToClient = function(){

		let dateNow = new Date(Date.now() - (3600 * 24 * 20 * 1000));
		let promise = SgDb.select('torrents','hashid,created_at,magnetURI,filename',` created_at > "${SgHelper.getStrDateTimeForDB(dateNow)}" `);
		promise.then(function(dataDb){

				if (dataDb.length > 0){

					dataDb.forEach(function(tor,index){

						if (! _checkIfTorrentIsActive(tor.hashid)){

							_addFileToTorrent(tor.magnetURI);

						}

					});

				}

			},
			function(err){

				console.log("Error: ");
				console.log(err);

			});

	}

	var _listAllActiveTorrents = function (){

		console.log("-----------------------------");
		wtClient.torrents.forEach(function(tor){

			console.log(`[Torrent activo] ${tor.infoHash}`);

		})

	}

	return {

		startClient : function(){
			_startListenToSocket();
			setTimeout(_reAddTorrentsToClient,15000);
			setInterval(_listAllActiveTorrents,60000);
		}

	}

}
)(socket,client,fs,SgDb,SgCnf,SgHelper);

SgCliente.startClient();

module.exports = exports = SgCliente;