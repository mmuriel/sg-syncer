'use strict';

/* Requerimientos del servidor de sockets */
var http = require('http');
var url = require('url');
var fs = require('fs');
var socketio = require('socket.io');



/* Iniciando las rutinas del servidor de sockets */
var httpServ = http.createServer(function(req,res){

    var path = url.parse(req.url).pathname;
    console.log(req.url);
    console.log(req.method);

    switch(path){

        case '/':

            let localIndexHtml = "<!DOCTYPE html>";
            localIndexHtml += "<html>";
            localIndexHtml += "<head>";
            localIndexHtml += "    <meta charset='utf-8'>";
            localIndexHtml += "    <meta name='viewport' content='width=device-width, initial-scale=1'>";
            localIndexHtml += "    <title></title>";
            localIndexHtml += "</head>";
            localIndexHtml += "<body>";
            localIndexHtml += "    <h1>Test de conexión por websockets</h1>";
            localIndexHtml += "</body>";
            localIndexHtml += "</html>";

            res.writeHead(200,{'Content-Type':"text/html"});
            res.write(localIndexHtml);
            res.end();



            break;
        case '/socket.html':

            let pathToHtmlFiles = __dirname + '/../public' +path;
            console.log(pathToHtmlFiles);


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
    Servidor de sockets
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
    Empieza a enviar notificaciones
*/


/*
var handlerevent = setInterval(function(){
    //console.log(socketServer);
    //console.log(Date.now());
    //socket.emit('message', {'message': ''+Date.now()+''});
    //socketServer.sockets.emit('message',{'message':''+Date.now()+''});

},3000);
*/





//console.log(fs);


/*


    Analiza el comportamiento de un directorio buscando cambios en el mismo
    usando la libreria chokidar, ya que el recurso nativo fs de nodejs, presenta
    inconsistencias


*/
/*
var fs = require('fs');
var fsWatcher = fs.watch("/var/www/html/siba_videos/files",function(e,chng){

    console.log(e);
    console.log(chng);

});
*/
var chokidar = require('chokidar');
var watcher = chokidar.watch("/var/www/html/siba_videos/files/");
watcher.on('add',function(path){

    let expReg = new RegExp("\\.torrent$");
    if (typeof path == 'string'){

        if (expReg.test(path)){
            console.log(path);
            /* Notifica a los clientes que hay nuevos archivos */
            socketServer.sockets.emit('new torrent',{'message':''+path+''});

        }
    }
});
