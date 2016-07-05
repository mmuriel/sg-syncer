'use strict';

var WebTorrent = require('webtorrent')
var wtClient = new WebTorrent()

//let torrentFile =  __dirname + '/../torrents/' +'32675a3b9de4fe4440a188368f9b0588.mov.torrent';
var torrentOpt = {
  //announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
  getAnnounceOpts: function(){console.log('Hola mundo')}, // Custom callback to allow sending extra parameters to the tracker
  maxWebConns: 8,       // Max number of simultaneous connections per web seed [default=4]
  path: '/home/sibaguide/videos/',              // Folder to download files to (default=`/tmp/webtorrent/`)
  //store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
};
var resSeed = wtClient.seed('/home/sientificagit/sg-syncer/MM_Test10.mov',torrentOpt,function(torrent){

	console.log(torrent.name);
	console.log(torrent.infoHash);
	console.log(torrent.magnetURI);

});

