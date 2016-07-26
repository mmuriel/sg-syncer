'use strict';

var WebTorrent = require('webtorrent')
var fs = require('fs')

var client = new WebTorrent()
var pathToSaveFiles = '/home/sibaguide/videos/';

//let torrentFile =  __dirname + '/../torrents/' +'32675a3b9de4fe4440a188368f9b0588.mov.torrent';
let torrentFile = `magnet:?xt=urn:btih:d9e5276067b5081887f1f29fce04c26314654a88&dn=MM_Test10.mov&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io`;
client.add(torrentFile, {path:pathToSaveFiles} ,function (torrent) {

  torrent.files.forEach(function (file) {
    console.log('Started saving ' + file.name)

    file.getBuffer(function (err, buffer) {
      if (err) {
        console.error('Error downloading ' + file.name)
        return
      }
      fs.writeFile(file.name, buffer, function (err) {

        if (err == null || typeof err == 'null'){

          console.log(`Downloading ${file.name}...`);

        }
        else{

          console.error(`Error: `);
          console.log(err);

        }
        
      })
    })
  })
})