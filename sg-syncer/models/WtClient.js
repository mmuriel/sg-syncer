'use strict';
var WebTorrent = require('webtorrent');
var fs = require('fs');


/*


	Esta clase tiene como responsabilidad, gestionar todas los métodos
	que tengan que ver con el cliente WebTorrent aplicado únicamente 
	al proyecto.


*/

class WtClient{


	constructor() {

		this.wtClient = new WebTorrent();	
		this.addTorrent = this.addTorrent.bind(this);
		this.seedNewTorrentFile = this.seedNewTorrentFile.bind(this);
		this.startLoggingTorrentActivity = this.startLoggingTorrentActivity.bind(this);


		this.wtClient.on("error",(error)=>{

			console.log(`WtClient.OnError event: ${error}`);

		});



		this.wtClient.on("torrent",(torrent)=>{

			console.log(`OnTorrent event: ${torrent.infoHash}`);

		})

	}

	seedNewTorrentFile (pathToFile,torrentOpts){

		return new Promise((resolve,reject)=>{

			this.wtClient.seed(pathToFile,torrentOpts,(torrent)=>{

				console.log(`Se ha iniciado el proceso de 'seeding' para el torrent:  torrent.infoHash`);
				this.startLoggingTorrentActivity(torrent);
				resolve(torrent);

    		});

		});

	}

	addTorrent(magnetURI,pathToDest){

		return new Promise ((resolve,reject)=>{


			let torrentRaw = this.wtClient.add(magnetURI,{},(torrent)=>{

				console.log("Lanzando antes del foreach...");

				torrent.files.forEach(function (file) {

					console.log(file);
					file.getBuffer(function (err, buffer) {
						if (err) {
							reject(err);//Promise error
							return
						}
						// Mueve el archivo hasta la carpeta de destino 
						fs.writeFile(`${pathToDest}/${file.name}`, buffer, function (err) {
							if (err == null || typeof err == 'null'){							  
								resolve(torrent);//Promise OK
							}
							else{
								reject(err);//Promise rejected
							} 
						})
					})
				})
			})
			//======================================
			this.startLoggingTorrentActivity(torrentRaw);			
		})
	}



	startLoggingTorrentActivity(torrentRaw){

		torrentRaw.on('infohash',(data)=>{

				console.log(`Infohash: ${data}`);

			})

			torrentRaw.on('metadata',(data)=>{

				console.log(`Metadata: ${data}`);

			})

			torrentRaw.on('ready',(data)=>{

				console.log(`Ready: ${data}`);

			})

			torrentRaw.on('warning',(data)=>{

				console.log(`Warning: ${data}`);

			})

			torrentRaw.on('error',(data)=>{

				console.log(`Error: ${data}`);
				reject(data);

			})

			torrentRaw.on('download',(data)=>{

				console.log(`Download: ${data}`);

			})

			torrentRaw.on('wire',(data)=>{

				console.log(`Wire: ${data}`);

			})

	}


}


//Usando require();
module.exports = exports = WtClient;

//Usando Import
//export default WtClient;