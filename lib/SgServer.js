'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');
var socketio = require('socket.io');
var WebTorrent = require('webtorrent');
var chokidar = require('chokidar');
var SgCnf = require('./SgCnf.js');
var SgDb = require('./SgDb.js');

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
httpServ.listen(9000);
/*
    mensajes a la consola sobre operación
*/
console.log("Servidor escuchando puerto 9000");


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

/* Emite mensaje para el evento onconnect */
socketServer.sockets.on('connection', function(socket){

    /* Registra el socket */
    socket.emit('message', {'message': 'hello world'});
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

    socket.on('personalizado',function(data){

        console.log(data);

    })

});


/*
---------------------------------------------------
---------------------------------------------------
    GENERA Y EXPONE EL API
---------------------------------------------------
---------------------------------------------------
*/

var SgServer = (function(socketServer,wtClient,filesWatcher,sgCnf,httpServer,db){

	var _socketServer = socketServer;
	var _wtClient = wtClient;
	var _filesWatcher = filesWatcher;
	var _torrentOpts = sgCnf.torrentOpts;
	var _httpServer = httpServer;
	var _sgCnf = sgCnf;
	var _sgDb = db;


	var _emmitMessageToSockets = function(eventType,msgObj){

		_socketServer.sockets.emit(eventType,msgObj);

	}


	var _seedNewTorrentFile = function(pathToFile){

		var resSeed = _wtClient.seed(pathToFile,_torrentOpts,function(torrent){

		        console.log(torrent.name);
		        console.log(torrent.infoHash);
		        /* Notifica a los clientes que hay nuevos archivos */
		        return torrent;
		        //socketServer.sockets.emit('new torrent',{'magnetURI': `${torrent.magnetURI}`});

    		});
	}

	var _startWatchFiles = function(){


		return new Promise(function(fulfill,reject){

			_filesWatcher.on('add',function(err,data,more,next){

				console.log(err);
				console.log(data);
				console.log(more);
				console.log(next);
				console.log(`-------------------`);

				/*
			    let expReg = new RegExp("\\.mov$|\\.mpg$|\\.mpeg$|\\.wmv$");
			    if (typeof pathToSource == 'string'){

			        if (expReg.test(pathToSource)){
			            // Genera una semilla del nuevo archivo 
			            _seedNewTorrentFile(pathToSource);
			            console.log("Seeding para: "+_cleanPathFromFile(pathToSource));
			            
			        }
			    }
			    */
			});
		});

	}


	var _cleanPathFromFile = function(pathToFile){

		var arrPath = pathToFile.split(/\//);
		//console.log(arrPath[(arrPath.length - 1)]);
		return arrPath[(arrPath.length - 1)];

	}







	return {

		setSocketServer : function(socketServer){

			_socketServer = socketServer;

		},
		setWtClient: function (wtClient){
			
			_wtClient = wtClient;

		},
		setfilesWatcher: function(chokidarWatcher){

			_filesWatcher = chokidarWatcher;

		},
		setTorrentOpts: function(torrentOpt){

			_torrentOpts = torrentOpt;

		},
		seedWTFile: function(pathToFile){

			_seedNewTorrentFile(pathToFile);

		},
		emmitMessageToSockets: function(typeEvent,msgObject){

			_emmitMessageToSockets(typeEvent,msgObject);

		},
		startWatchFiles: function(){

			_startWatchFiles();

		}

	}

}
)(socketServer,wtClient,watcher,SgCnf,httpServ,SgDb);

SgServer.startWatchFiles();

module.exports = exports = SgServer;

