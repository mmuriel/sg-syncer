'use strict';

/* Requerimientos */
var socketIoClient = require('socket.io-client');
var SgCnf = require('./SgCnf.js');
var SgDb = require('./SgDb.js');
var SgHelper = require('./SgHelper.js');
var socket = socketIoClient.connect(SgCnf.socketEndPoint);
var WebTorrent = require('webtorrent');
var fs = require('fs');
var client = new WebTorrent();
var memwatch = require('memwatch-next');
var heapdump = require('heapdump');



var SgCliente = (function(socket,wtClient,fs,SgDb,SgCnf,SgHelper){

	var _startListenToSocket = function(){

		socket.on('new torrent', function(data){

			console.log("Nuevo torrent disponible: "+data.magnetURI);
			_addFileToTorrent(data.magnetURI).then(function(dataRes){

					console.log(`Exito descargando... ${dataRes.infoHash}`);
					console.log(`Destruyendo el torrent... ${dataRes.infoHash}`);
					dataRes.destroy();

				},
				function(err,dataRes){

					if (typeof dataRes.infoHash != 'undefined' && dataRes.infoHash != null){

						dataRes.destroy();

					}
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
								//console.log(dataRes);
								console.log(`Destruyendo el torrent... ${dataRes.infoHash}`);
								//dataRes.destroy();
								
							},function(dataErr,torrent){

								if (typeof torrent.infoHash != 'undefined' && typeof torrent.infoHash != null){

									console.log(`Error operando el torrent: ${torrent.infoHash}`);
								}
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

			var resAdd = wtClient.add(magnetURI,{path:SgCnf.pathToDest},function (torrent) {

				/* 

				Prints out to console what is happening with torrent

				*/


		        var interval = setInterval(function () {
		          console.log(`Torrent ${torrent.infoHash} `+'progress: ' + (torrent.progress * 100).toFixed(1) + '%');
		          let tpmProgress = parseInt((torrent.progress * 100).toFixed(1));
		          if (tpmProgress == 100)
		          	clearInterval(interval);	

		        }, 5000);

		        torrent.on('done', function () {
		          console.log(`Torrent ${torrent.infoHash} `+'Progress: 100%')
		          clearInterval(interval)
		        });

				//Gets the buffer and copi the file to destinationPath
				torrent.files.forEach(function (file) {
					console.log('Started saving ' + file.name)
					file.getBuffer(function (err, buffer) {
						if (err) {
							console.error('Error downloading ' + file.name)
							reject(err,torrent);//Promise error
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
							  reject(err,torrent);
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

							_addFileToTorrent(tor.magnetURI).then(function(dataRes){

								//let tmpInfoHash = dataRes.infoHash;
								//console.log(`Destruyendo el torrent... ${dataRes.infoHash}`);
								dataRes.destroy(function(tmpInfoHash){

										console.log(`Se ha destruido el torent... ${tmpInfoHash}`);
								});

							},function(dataErr){

								//if (typeof dataRes.infoHash != 'undefined' &&  dataRes.infoHash != null){

								//	let tmpInfoHash = dataRes.infoHash;
									dataRes.destroy(function(tmpInfoHash){

										console.log(`Se ha destruido el torent... ${tmpInfoHash}`);
									});

								//}
								//else {
								//	console.log(dataErr);
								//}

							});

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

			let bytesFaltantes = 0;

			if (tor.downloaded == 0 && tor.progress==0)
				bytesFaltantes = 'Aun no inicia descarga';
			else if  (tor.progress < 1)
				bytesFaltantes = parseInt(tor.downloaded / tor.progress);
			console.log("===================================");
			console.log(`[Torrent activo] ${tor.infoHash}`);
			console.log(`Total verified downloaded: ${tor.downloaded} bytes`);
			console.log(`Total progress: ${tor.progress}`);
			console.log(`Total bytes faltantes: ${bytesFaltantes}`);
			console.log(`Total size: ${tor.length}`);
			console.log("===================================");

		})
		console.log("===================================");
		console.log(`Total torrents activos: ${wtClient.torrents.length}`);
		console.log("===================================");
		console.log("\n");

	}

	var _memoryCheck = function(memwatch,heapdump){

		console.log("Iniciando la verificación de memoria...");

		memwatch.on('leak', function(info) {

			console.log("--------------------------------------------");
			console.log("Leak event fired...");
			console.log(info);
			console.log("--------------------------------------------");

		});


		/*
		setInterval(function(){

			heapdump.writeSnapshot('/home/siba/profile/' + Date.now() + '.heapsnapshot');

		},5000)
		*/

	}


	var _memoryController = function(){

		let totalDownloadedTorrents = 0;
		let totalPendingTorrents = 0;
		let totalBytesPendingDownloaded = 0;
		let totalBytesDownloaded = 0;
		let totalBytesPending = 0;
		let totaltorrents = 0;
		let torPending = 0;

		wtClient.torrents.forEach(function(tor){


			totaltorrents++;
			if (tor.progress == 1){

				totalDownloadedTorrents++;
				totalBytesDownloaded = parseInt(totalBytesDownloaded + parseInt(tor.files[0].length));

			}else{

				totalPendingTorrents++;
				torPending = parseFloat(tor.downloaded) / parseFloat(tor.progress);
				totalBytesPending = parseInt(totalBytesPending + torPending);
				totalBytesPendingDownloaded = parseInt (totalBytesPendingDownloaded + tor.downloaded);

			}


		});

		console.log("Report memory\n========================");
		console.log(`Total torrents: ${totaltorrents}`);
		console.log(`Total torrents downloaded: ${totalDownloadedTorrents}`);
		console.log(`Total bytes downloaded: ${totalBytesDownloaded}`);
		console.log(`Total torrents pending: ${totalPendingTorrents}`);
		console.log(`Total bytes pending: ${totalBytesPending}`);
		console.log(`Total bytes pending already downloaded: ${totalBytesPending}`);
		console.log("---------------------------------------\n\n");

	}


	return {

		startClient : function(){
			_startListenToSocket();
			//setTimeout(_reAddTorrentsToClient,15000);
			setInterval(_listAllActiveTorrents,60000);
			//setInterval(_memoryController,5000);
		},
		startMemwatcher: function(memwatch,heapdump){

			_memoryCheck(memwatch,heapdump);

		}

	}

}
)(socket,client,fs,SgDb,SgCnf,SgHelper);

SgCliente.startClient();
SgCliente.startMemwatcher(memwatch,heapdump);

module.exports = exports = SgCliente;