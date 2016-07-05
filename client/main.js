'use strict';

/* Requerimientos */
var socketIoClient = require('socket.io-client');
var socket = socketIoClient.connect('http://192.168.1.2:9000');
var WebTorrent = require('webtorrent')
var fs = require('fs')
var client = new WebTorrent();





socket.on('message', function(data){
	console.log(data.message);
});




socket.on('new torrent', function(data){

	console.log("Nuevo torrent disponible: "+data.magnetURI);
	client.add(data.magnetURI, function (torrent) {

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
	console.log(socket.io.constructor.name);
	socket.emit("message",{"message":"Soy yo..."});
	socket.emit('personalizado',{"id":"MacBookPro","name":"MM"});
	socket.emit('subscribe',{'room':'MMTest'});

});