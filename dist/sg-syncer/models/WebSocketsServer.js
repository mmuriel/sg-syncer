'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var socketio = require('socket.io');

var WebSocketsServer = function () {
	function WebSocketsServer(httpServer) {
		_classCallCheck(this, WebSocketsServer);

		/* Instancia un servidor de websockets */
		this.socketServer = new socketio(httpServer);
	}

	_createClass(WebSocketsServer, [{
		key: 'emmitMessageToSockets',
		value: function emmitMessageToSockets(eventType, msgObj) {

			this.socketServer.sockets.emit(eventType, msgObj);
		}
	}, {
		key: 'startToListenSocketsEvents',
		value: function startToListenSocketsEvents(sgDb, wtClient) {

			this.socketServer.sockets.on('connection', function (socket) {

				/* Registra el socket */
				socket.emit('message', { 'message': 'Te has conectado al servidor  de sockets exitosamente...' });
				//console.log(socketServer.sockets);
				console.log(socket.client);

				/* -------- */
				socket.on('subscribe', function (data) {
					socket.join(data.room);
				});

				socket.on('unsubscribe', function (data) {
					socket.leave(data.room);
				});

				socket.on('send', function (data) {
					socket.sockets.in(data.room).emit('message', data);
				});

				socket.on('message', function (data) {
					socket.emit('messageresponse', { "message": "200" });
				});

				socket.on('getlasttorrents', function (data) {

					console.log('Gestionando la peticion \'get last torrents\' para: Token: ' + data.token + ', Fecha: ' + data.date);

					sgDb.select("torrents", "hashid,created_at,magnetURI,filename", ' created_at >=\'' + data.date + '\' ').then(function (dataDb) {
						//Gestiona el exito de la busqueda
						console.log('Respondiendo a la peticion \'get last torrents\' de Token: ' + data.token);
						//socket.in(data.token).emit("last torrents",dataDb);
						socket.emit("last torrents", dataDb);
					}, function (dataDb) {
						//Gestiona el error de la búsqueda
						console.log(dataDb);
					});
				});

				socket.on('getalltorrents', function (data) {
					var torrentsIds = [];
					wtClient.torrents.forEach(function (tor, ind, arr) {
						torrentsIds.push(tor.infoHash);
					});
					socket.emit('pushalltorrents', { 'torrents': torrentsIds });
				});
			});
		}
	}]);

	return WebSocketsServer;
}();

//Usando require();


module.exports = exports = WebSocketsServer;

//Usando Import
//export default WebSocketsServer;