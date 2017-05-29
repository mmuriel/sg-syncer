//Archivo de configuración del modulo
var SgCnf = {

	sgtoken : 'COL102', //Token to identify the client in network
	torrentOpt : {
		  //announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
		  //getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
		  maxWebConns: 8,       // Max number of simultaneous connections per web seed [default=4]
		  //path: '/videos/',              // Folder to download files to (default=`/tmp/webtorrent/`)
		  //store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
		},
	pathToSource: '/Users/macuser/Desktop/siba/videos/', //Path in filesystem to watch for new added files.
	pathToDest:'/Users/macuser/Desktop/siba/videos/', //Path in filesystem to save downloaded files
	socketEndPoint:'http://localhost:9000',//Socketio server URL
	pathToDb: __dirname+'/../db/sgdb.db',//Path to sqlite DB
	httpPort: '9000',
	pathToPublic: __dirname+'/../public/', //Path in filesystem to public http root folder

};

module.exports = exports = SgCnf;