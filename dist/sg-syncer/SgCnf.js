'use strict';

//Archivo de configuración del modulo
var SgCnf = {

	sgtoken: 'COL102', //Token to identify the client in network
	torrentOpt: {
		//announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
		//getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
		maxWebConns: 8 },
	pathToSource: '/Users/macuser/Desktop/siba/videos/', //Path in filesystem to watch for new added files.
	pathToDest: '/Users/macuser/Desktop/siba/videos/', //Path in filesystem to save downloaded files
	socketEndPoint: 'http://localhost:9000', //Socketio server URL
	pathToDb: __dirname + '/../db/sgdb.db', //Path to sqlite DB
	httpPort: '9000',
	pathToPublic: __dirname + '/../public/' };

module.exports = exports = SgCnf;