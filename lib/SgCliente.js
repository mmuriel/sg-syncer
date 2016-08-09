'use strict';

/* Requerimientos */
var socketIoClient = require('socket.io-client');
var SgCnf = require('./SgCnf.js');
var SgDb = require('./SgDb.js');
var socket = socketIoClient.connect(SgCnf.socketEndPoint);
var WebTorrent = require('webtorrent')
var fs = require('fs')
var client = new WebTorrent();



var SgCliente = (function(socket,wtClient,fs,SgDb,SgCnf){

	var _startListenToSocket = function(){

		socket.on('new torrent', function(data){

			console.log("Nuevo torrent disponible: "+data.magnetURI);
			wtClient.add(data.magnetURI,{path:`${SgCnf.pathToDest}`},function (torrent) {
			  torrent.files.forEach(function (file) {
			    console.log('Started saving ' + file.name)
			    file.getBuffer(function (err, buffer) {
			      if (err) {
			        console.error('Error downloading ' + file.name)
			        return
			      }
			      fs.writeFile(file.name, buffer, function (err) {
			        if (err == null || typeof err == 'null'){
			          console.log(`Downloading ${file.name}...`);
			        }
			        else{
			          console.error(`Error: `);
			          console.log(err);
			        } 
			      })
			    })
			  })
			})
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
			let dateNow = new Date((Date.UTC() - (3600 * 24 * 15 * 1000)));
			let strDateNow = `${dateNow.getFullYear()}-${dateNow.getMonth()}-${dateNow.getDate()} 00:00:00.000`;
			_askForVideos(strDateNow);

		});

		socket.on('last torrents',function(data){

			console.log(data);
			/*
			for (let i=0; i < data.length;i++){

				console.log(data[i]);

			}
			*/

		});

	}



	var _askForVideos = function (date){

		return new Promise(function(fulfill,reject){


			socket.emmit('get last torrents',{token:SgCnf.sgtoken,date:strDateNow});

		});

	}

	return {

		startClient : function(){
			_startListenToSocket();
		}

	}

}
)(socket,client,fs,SgDb,SgCnf);

SgCliente.startClient();

module.exports = exports = SgCliente;