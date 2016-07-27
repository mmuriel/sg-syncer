'use strict';

/* Requerimientos */
var socketIoClient = require('socket.io-client');
var SgCnf = require('./../SgCnf.js');
var SgDb = require('./SgDb.js');
var socket = socketIoClient.connect(SgCnf.socketEndPoint);
var WebTorrent = require('webtorrent')
var fs = require('fs')
var client = new WebTorrent();



var SgCliente = (function(socket,wtClient,fs,SgDb,SgCnf){

	var _startListenToSocket = function(){

		socket.on('new torrent', function(data){

			console.log("Nuevo torrent disponible: "+data.magnetURI);
			client.add(data.magnetURI,{path:`${SgCnf.pathToDest}`},function (torrent) {
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
			socket.emit('subscribe',{'room':`${SgCnf.sgtoken}`});

		});

	}

	return {

		startClient : function(){
			_startListenToSocket = function()
		},
		fun2: function (){
			console.log("Desde fun2"+ var1++);
		},
		fun3: function(){
			console.log("Desde fun3"+ var1++);
		}

	}

}
)(socket,wtClient,fs,SgDb,SgCnf);

SgCliente.startClient();

module.exports = exports = SgCliente;