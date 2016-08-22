'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');
var socketio = require('socket.io');
var WebTorrent = require('webtorrent');
var chokidar = require('chokidar');
var SgCnf = require('./SgCnf.js');
var SgDb = require('./SgDb.js');
var SgHelper = require('./SgHelper.js');

var wtClient = new WebTorrent();
var watcher = chokidar.watch(SgCnf.pathToSource);


/*
---------------------------------------------------
---------------------------------------------------
    INICIALIZA EL SERVIDOR WEB, BASE DEL SOCKETIO
---------------------------------------------------
---------------------------------------------------
*/

var httpServ = http.createServer(function(req,res){

    var path = url.parse(req.url).pathname;
    console.log(req.url);
    console.log(req.method);

    switch(path){

        case '/':

            let localIndexHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>SG-Syncer</title>
</head>
<body>
    <h1>SG-Syncer system</h1>
</body>
</html>`;

            res.writeHead(200,{'Content-Type':"text/html"});
            res.write(localIndexHtml);
            res.end();



            break;
        case '/socket.html':

            let pathToHtmlFiles = __dirname + '/public' +path;
            fs.readFile(pathToHtmlFiles, function(error, data){
                if (error){
                    res.writeHead(404);
                    res.write("opps this doesn't exist - 404");
                    res.end();
                }
                else{
                    res.writeHead(200, {"Content-Type": "text/html"});
                    res.write(data, "utf8");
                    res.end();
                }
            });
            break;

        default:
            res.writeHead(404);
            res.write("opps this doesn't exist - 404");
            res.end();
            break;
    }
    
    //console.log(res);

});
httpServ.listen(SgCnf.httpPort);
/*
    mensajes a la consola sobre operación
*/
console.log(`http server listening on port ${SgCnf.httpPort}`);


/*
---------------------------------------------------
---------------------------------------------------
    INICIALIZA EL SERVIDOR SOCKETS
---------------------------------------------------
---------------------------------------------------
*/


/* Instancia un servidor de websockets */
var socketServer = new socketio();
/* Vincula el server HTTP al WebSocket Server */
socketServer.listen(httpServ);


/*
---------------------------------------------------
---------------------------------------------------
    GENERA Y EXPONE EL API
---------------------------------------------------
---------------------------------------------------
*/

var SgServer = (function(socketServer,wtClient,filesWatcher,sgCnf,httpServer,db,SgHelper){

	var _socketServer = socketServer;
	var _wtClient = wtClient;
	var _filesWatcher = filesWatcher;
	var _torrentOpts = sgCnf.torrentOpts;
	var _httpServer = httpServer;
	var _sgCnf = sgCnf;
	var _sgDb = db;



	/* Wrapper para el metodo emmit del cliente socketio */
	var _emmitMessageToSockets = function(eventType,msgObj){

		_socketServer.sockets.emit(eventType,msgObj);

	}

	/* Metodo de control de registro de torrents en la red */
	var _checkIfTorrentMustBeNotified = function(torrent){

		return new Promise(function(fulfill,reject){

			let promise = _sgDb.select('torrents','hashid,created_at,magnetURI,filename',` filename="${torrent.name}" `);
			promise.then(function(data){

				//Gestiona la promesa en exito

				//1. Verifica si se retornaron registros para el nombre de archivo generado
				if(data.length == 0){

					let dateNow = new Date();
					let obtjToInsertDb = {

						hashid:`${torrent.infoHash}`,
						created_at:SgHelper.getStrDateTimeForDB(dateNow),
						magnetURI:`${torrent.magnetURI}`,
						filename:`${torrent.name}`

					}
					SgDb.insert('torrents',obtjToInsertDb);
					fulfill({res:true,torrent:torrent});

				}
				else{

					fulfill({res:false,torrent:torrent});
				}

			},function(err){

				//Gestiona la promesa en error
				console.log(err);
				reject({error:err});

			});

		});

	}

	/* Registra un nuevo torrent en el servidor */
	var _seedNewTorrentFile = function(pathToFile){

		return new Promise(function(fulfill,reject){

			_wtClient.seed(pathToFile,_torrentOpts,function(torrent){

				console.log(torrent.name);
		        console.log(torrent.infoHash);
				fulfill(torrent);
		        //socketServer.sockets.emit('new torrent',{'magnetURI': `${torrent.magnetURI}`});

    		});

		});

	}

	/* Inicia el control de adición de archivos sobre el sistema de archivo */
	var _startWatchFiles = function(){


		_filesWatcher.on('add',function(pathToSource,data){
				
		    let expReg = new RegExp("\\.mov$|\\.mpg$|\\.mpeg$|\\.wmv$");
		    if (typeof pathToSource == 'string'){

		        if (expReg.test(pathToSource)){
		            // Genera una semilla del nuevo archivo 
		            //_seedNewTorrentFile(pathToSource);
		            //fulfill({path:pathToSource});
		            console.log("Seeding para: "+_cleanPathFromFile(pathToSource));
		            _seedNewTorrentFile(pathToSource).then(_checkIfTorrentMustBeNotified).then(function(data){

		            	if (typeof data.res != 'undefined'){

		            		if(data.res){
		            			_emmitMessageToSockets('new torrent',{magnetURI: `${data.torrent.magnetURI}`,name:`${data.torrent.name}`,hashid:`${data.torrent.hashid}`});
								console.log(`Se hace seeding de un nuevo torrent en la red y se notifica a los clientes conectados... ${data.torrent.name}`);		            			
		            		}

		            	}
		            	else{

		            		console.log(`Se hace seeding del archivo ${data.torrent.name} pero no se reporta a la red`);

		            	}

		            });
		            
		        }
		        else{

		        	console.log(`No es un archivo de video ${pathToSource}`);
		        	
		        }
		    }
		    else{

		    	console.log("No se ha definido un path valido hasta el archivo");
		    }

		});

	}

	/* Funcion de ayuda para limpiar el path de un nombre de archivo */
	var _cleanPathFromFile = function(pathToFile){

		var arrPath = pathToFile.split(/\//);
		//console.log(arrPath[(arrPath.length - 1)]);
		return arrPath[(arrPath.length - 1)];

	}


	var _startToListenSocketsEvents = function(){

		socketServer.sockets.on('connection', function(socket){

		    /* Registra el socket */
		    //socket.emit('message', {'message': 'hello world'});
		    //console.log(socketServer.sockets);
		    //console.log(socket.client);

		    /* -------- */
		    socket.on('subscribe', function(data) { 
		        console.log('joining room', data.room);
		        socket.join(data.room); 
		    })

		    socket.on('unsubscribe', function(data) {  
		        console.log('leaving room', data.room);
		        socket.leave(data.room); 
		    })

		    socket.on('send', function(data) {
		        console.log('sending message');
		        socket.sockets.in(data.room).emit('message', data);
		    });

		    socket.on('message', function(data) {
		        console.log(data.message);
		    });

		    socket.on('getlasttorrents',function(data){

		    	console.log(`Gestionando la peticion 'get last torrents' para: Token: ${data.token}, Fecha: ${data.date}`);

		        SgDb.select("torrents","hashid,created_at,magnetURI,filename",` created_at >='${data.date}' `)
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

		    socket.on('getalltorrents',function(data){

		    	console.log("Recibiendo la petición de verificación de torrents...");
		    	var torrentsIds = [];
		    	_wtClient.torrents.forEach(function(tor,ind,arr){
		    		torrentsIds.push(tor.infoHash);
		    		console.log(`InfoHash: ${tor.infoHash}`);
		    	})


		    	socket.emit('pushalltorrents',{'torrents':torrentsIds});
		    	

		    });

		});

	};




	/*


		Public API


	*/



	return {

		emmitMessageToSockets: function(typeEvent,msgObject){

			_emmitMessageToSockets(typeEvent,msgObject);

		},
		startServer: function(){

			_startToListenSocketsEvents();
			_startWatchFiles();

		}

	}

}
)(socketServer,wtClient,watcher,SgCnf,httpServ,SgDb,SgHelper);

SgServer.startServer();

module.exports = exports = SgServer;

