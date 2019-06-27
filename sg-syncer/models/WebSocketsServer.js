'use strict';
var socketio = require('socket.io');

class WebSocketsServer{

	constructor(httpServer) {
		
		/* Instancia un servidor de websockets */
		this.socketServer = new socketio(httpServer);
	}

	emmitMessageToSockets (eventType,msgObj){

		this.socketServer.sockets.emit(eventType,msgObj);

	}


	startToListenSocketsEvents (sgDb,wtClient){

		this.socketServer.sockets.on('connection', (socket)=>{

		    /* Registra el socket */
		    socket.emit('message', {'message': 'Te has conectado al servidor  de sockets exitosamente...'});
		    //console.log(socketServer.sockets);
		    console.log(socket.client);

		    /* -------- */
		    socket.on('subscribe', (data)=>{ 
		        socket.join(data.room); 
		    })

		    socket.on('unsubscribe', (data)=>{  
		        socket.leave(data.room); 
		    })

		    socket.on('send', (data)=>{
		        socket.sockets.in(data.room).emit('message', data);
		    });

		    socket.on('message',(data)=>{
		        socket.emit('messageresponse',{"message":"200"});
		    });

		    socket.on('getlasttorrents',(data)=>{

		    	console.log(`Gestionando la peticion 'get last torrents' para: Token: ${data.token}, Fecha: ${data.date}`);

		        sgDb.select("torrents","hashid,created_at,magnetURI,filename",` created_at >='${data.date}' `)
		        .then(function(dataDb){
		        	//Gestiona el exito de la busqueda
		        	console.log(`Respondiendo a la peticion 'get last torrents' de Token: ${data.token}`);
		        	//socket.in(data.token).emit("last torrents",dataDb);
		        	socket.emit("last torrents",dataDb);
		        },function(dataDb){
		        	//Gestiona el error de la búsqueda
		        	console.log(dataDb);

		        });

		    });

		    socket.on('getalltorrents',(data)=>{
		    	var torrentsIds = [];
		    	wtClient.torrents.forEach((tor,ind,arr)=>{
		    		torrentsIds.push(tor.infoHash);
		    	})
		    	socket.emit('pushalltorrents',{'torrents':torrentsIds});
		    });

		});

	};

}


//Usando require();
module.exports = exports = WebSocketsServer;

//Usando Import
//export default WebSocketsServer;