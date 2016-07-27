//Archivo de configuración del modulo
var SgCnf = {

	sgtoken : 'COL102',
	profile : 'server', //Valores posibles: server|cliente
	torrentOpt : {
		  //announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
		  //getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
		  maxWebConns: 8,       // Max number of simultaneous connections per web seed [default=4]
		  path: '/Users/macuser/sibaguide/videos/',              // Folder to download files to (default=`/tmp/webtorrent/`)
		  //store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
		},
	pathToSource: '/Users/macuser/sibaguide/videos/', //Ruta en el sistema de archivos que se "vigilará" por archivos nuevos
	pathToDest:'/Users/macuser/sibaguide/videos/', //Ruta hacia donde se depositarán los arhivos en la red bittorrent
	socketEndPoint:'http://localhost:9000',//Socketio server URL
	pathToDb: '/Users/macuser/Proyectos/sg-syncer/db/sgdb.db'//Ruta hacia el archivos que almacena la DB tipo sqlite

};

module.exports = exports = SgCnf;