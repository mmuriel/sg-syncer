'use strict';

let assert = require('assert');
let chai = require('chai');


let fs = require('fs');
let SgCnf = require('../dist/sg-syncer/SgCnf.js');
let request = require('request');
let socketIoClient = require('socket.io-client');




/*

	Loading modules to test

*/

let FileWatcher = require('../dist/sg-syncer/models/FileWatcher.js');
let WtClient = require('../dist/sg-syncer/models/WtClient.js');
let SgDb = require('../dist/sg-syncer/classes/SgDb.js');
let SgHelpers = require('../dist/sg-syncer/classes/SgHelpers.js');
let WebServer = require('../dist/sg-syncer/models/WebServer.js');
let WebSocketsServer = require('../dist/sg-syncer/models/WebSocketsServer.js');



/*
	Starting test cases
*/

describe('FileWatcher',function(){
	it ('Si se agrega un archivo a una carpeta lo notifica via callback sobre fw.startWatchForFiles y con registro tipo pub/sub',function(done){
		let fw = new FileWatcher(__dirname+"/files/origen/");
		let expReg = new RegExp("\\.mov$|\\.mpg$|\\.mpeg$|\\.wmv$");
		let fnPubSub = function (data){
			chai.assert.match(data, expReg,'El resultado devuelto mediante el pub/sub no pasó la expresión regular');
		}
		fw.subscribeToWatchFile(fnPubSub);
		fw.startWatchForFiles(function(path){
			//chai.assert.equal('COL102',path,'No se pued acceder al valor de configuración del proyecto');
			chai.assert.match(path,expReg,'El resultado devuelto mediante el callback no pasó la expresión regular');
			done();	
		});
	});
});



describe('WtClient',function(){
	//Sets timeout more than default 2000 milisecs
	this.timeout(50000);
	it ('Iniciar un nuevo torrent a partir de un archivo local en el F/S',function(done){
		let wtClient = new WtClient();
		let fileToTest = __dirname+"/files/origen/09578301f8d2528f9f0f4a8fa7c17019.mov";
		let promTorrent = wtClient.seedNewTorrentFile (fileToTest,SgCnf.torrentOpt);
		promTorrent.then(function(data){
			//Verifica que el objeto contruido por el método sea uno tipo torrent
			chai.assert.equal(data.constructor.name,'Torrent',`El objeto retornado no es del prototipo Torrent`);
			//Verifica que el objeto tenga al menos el path esperado
			chai.assert.equal(data.path,__dirname+"/files/origen",`El objeto retornado no está definido en el path esperado`);
			//Temrina el test basado en una promesa
			done();			
		});
		promTorrent.catch(function(err){

			chai.assert.isNotOk('error', `Ha ocurrido un error generando el torrent a partir `);
			done();
		});
	});


	/*
	it ('Iniciar un nuevo torrent a partir de una URI tipo Magnet (magnetURI)',function(done){

		let wtClient = new WtClient();
		let magnetURI = 'magnet:?xt=urn:btih:208437b0350cf9794f8d903719e73c052c5cdb17&dn=logo_fusm_colombia.png&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';
		let promAdd = wtClient.addTorrent(magnetURI,__dirname+"/files/dest/");
		promAdd.then(function(torrent){

			console.log('MMMMM');
			console.log(torrent);
			done();

		});

		promAdd.catch(function(err){

			console.log(err);
			done();

		})

	});
	*/
	
	
});


describe('SgHelpers',function(){
	//Sets timeout more than default 2000 milisecs

	it ('Si se entrega el instante 2017/1/1 1:10:8 am debe retornar 2017-01-01 01:10:08',function(){
		let sgHelper = new SgHelpers();
		let dateTest = new Date(2017,0,1,1,10,8,0);//En Javascript los meses arranca en 0=Enero, 1=Febrero, 2=Marzo...
		chai.assert.equal(sgHelper.getStrDateTimeForDB(dateTest),'2017-01-01 01:10:08.000',`La fecha generada no tiene el formato correcto para adicionar a la DB sqlite`);

	});


	
	
});




describe('SgDb',function(){
	//Sets timeout more than default 2000 milisecs
	this.timeout(50000);
	let dateNow = new Date();
	let sgHelper = new SgHelpers();
	let fileToDBTest = __dirname+"/files/db/test.db";
	let sgdb = new SgDb(fileToDBTest);
	let values = {
			hashid:`Ad205i28DfGG`+Math.random(100,10000),
			created_at:sgHelper.getStrDateTimeForDB(dateNow),
			magnetURI:'magnet:?xt=urn:btih:208437b0350cf9794f8d903719e73c052c5cdb17&dn=logo_fusm_colombia.png&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
			filename:'TEST FILE' 
		};


	it ('Agrega un nuevo registro a la DB y debe retornar un valor numerico mayor que cero (el ID dentro de la DB)',function(done){
		
		
				
		let promInsert = sgdb.insert('torrents',values);
		promInsert.then(function(data){
			//Verifica que el objeto contruido por el método sea uno tipo torrent
			//chai.assert.equal(data.constructor.name,'Torrent',`El objeto retornado no es del prototipo Torrent`);
			//Verifica que el objeto tenga al menos el path esperado
			//chai.assert.equal(data.path,__dirname+"/files/origen",`El objeto retornado no está definido en el path esperado`);
			//Temrina el test basado en una promesa
			chai.assert.isNumber(data,'No se ha retornado un numero como resultado del proceso insert');
			chai.assert.isAbove(data,0,'El ID no retornado no es mayor que cero');
			done();			
		});
		promInsert.catch(function(err){

			//chai.assert.isNotOk('error', `Ha ocurrido un error generando el torrent a partir `);
			console.log(err);
			done();
		});
	});


	it ('Recupera mediante el comando select el registro anteriormente registrado',function(done){

		let promSelect = sgdb.select('torrents','*',`(hashid = '${values.hashid}')`);
		promSelect.then(function(data){
			chai.assert.isArray(data,'No es un array el retorno de la busqueda en el comando select');
			chai.assert.equal(data.length,1,'No se han retornado elementos en la busqueda');
			done();			
		});
		promSelect.catch(function(err){

			//chai.assert.isNotOk('error', `Ha ocurrido un error generando el torrent a partir `);
			console.log(err);
			done();
		});

	});


	it ('Intenta un comando select que no retorna nada',function(done){

		let promSelectNoReturnData = sgdb.select('torrents','*',`(hashid = 'MMMMMM')`);
		promSelectNoReturnData.then(function(data){
			chai.assert.equal(data.length,0,'No se han retornado elementos en la busqueda');
			done();			
		});
		promSelectNoReturnData.catch(function(err){

			//chai.assert.isNotOk('error', `Ha ocurrido un error generando el torrent a partir `);
			console.log(err);
			done();
		});

	})
});


describe('WebSocketServer',function(){



	this.timeout(50000);
	let pathToPublic = __dirname+"/public/";
	let webserver = new WebServer(pathToPublic,SgCnf.httpPort);
	let socketiosrv = new WebSocketsServer(webserver.wserver);	



	it (`Al realizar una petición http tipo GET hacia el puerto ${SgCnf.httpPort} este debe responder con una página que contenga: <h1>SG-Syncer system</h1>`,(done)=>{

		
		
		request.get(SgCnf.socketEndPoint,(error,response,body)=>{
			if(error){
				console.log(error);
				chai.assert.isNotOk(true,'Ha ocurrido un error iniciando el servidor web base del servidor de sockets');
				done();
			}
			else{
				
				chai.assert(response.body,/\<h1\>SG\-Syncer system\<\/h1\>/,'Ha ocurrido un error iniciando el servidor web base del servidor de sockets')
				done();
			}
		});

	})





	
	it (`Al conectar un cliente al servidor de sockets debe recibir el mensaje: Te has conectado al servidor  de sockets exitosamente...`,(done)=>{

		let socket = socketIoClient.connect(SgCnf.socketEndPoint);
		socket.on('connect',(data)=>{
			console.log("		Se conecto exitosamente el socket...");
			chai.assert.isOk(true,"No fallo la conexión al socket");
			done();
		});
	})




	it (`Al generar un nuevo torrent en el servidor de contenidos, se recibe una cadena de caracteres tipo magnet en los equipos cliente SIBAGUIDE`,(done)=>{


		let socket2 = socketIoClient.connect(SgCnf.socketEndPoint);
		socket2.on("new torrent",(data)=>{
			//console.log("Un nuevo torrent ha llegado...");
			chai.assert.equal('a9g919danc183odc1038d9387vur9829co98af3189',data.message);
			done();
		});

		setTimeout(()=>{
			socketiosrv.emitMessageToSockets ('new torrent',{'message': 'a9g919danc183odc1038d9387vur9829co98af3189'});
		},1500);
		//console.log(socketiosrv.socketServer.sockets);
		//done();
	})


	it (`Un cliente SIBA envia un mensaje al servidor, este responde con un mensaje codigo 200`,(done)=>{

		let socket3 = socketIoClient.connect(SgCnf.socketEndPoint);
		socket3.on("messageresponse",(data)=>{
			console.log("		Capturando la respuesta del servidor.");
			chai.assert.equal('200',data.message);
			done();
		});
		
		setTimeout(()=>{
			console.log(`		Emitiendo desde el setTimeout #1`);
			socket3.emit('message',{'message': 'MMMMMM'},(data)=>{
				console.log(`		Respuesta desde el servidor de sockets: ${data}`);
			});
			setTimeout(()=>{
				console.log("		Emitiendo desde el setTimeout #2");
				done();
			},1200)
		},1200);
		
		
		//console.log(socketiosrv.socketServer.sockets);
		//done();
	})
})







