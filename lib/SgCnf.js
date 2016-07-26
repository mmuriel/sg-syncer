//Archivo de configuración del modulo
var SgCnf = {

	sgtoken : 'COL102',
	torrentOpt : {
		  //announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
		  //getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
		  maxWebConns: 8,       // Max number of simultaneous connections per web seed [default=4]
		  path: '/Users/macuser/sibaguide/videos/',              // Folder to download files to (default=`/tmp/webtorrent/`)
		  //store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
		},
	pathToSource: '/Users/macuser/sibaguide/videos/',
	pathToDest:'/Users/macuser/sibaguide/videos/',
	socketEndPoint:'http://localhost:9000',
	pathToDb: '/Users/macuser/Proyectos/sg-syncer/db/sgdb.db'

};

module.exports = exports = SgCnf;