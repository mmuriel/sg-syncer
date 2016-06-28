'use strict';

/* Requerimientos */
var socketIoClient = require('socket.io-client');
var socket = socketIoClient.connect('http://192.168.1.2:9000');

socket.on('message', function(data){
	console.log(data.message);
});

socket.on('new torrent', function(data){

	console.log("Nuevo torrent disponible: "+data.message);

});

socket.on('connect',function(){

	console.log("Conectado");
	console.log(socket.io.constructor.name);
	socket.emit("message",{"message":"Soy yo..."});
	socket.emit('personalizado',{"id":"MacBookPro","name":"MM"});
	socket.emit('subscribe',{'room':'MMTest'});

});