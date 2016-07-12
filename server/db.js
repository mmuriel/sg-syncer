'use strict';

var sqlite = require('sqlite-sync'); //requiring

//Connecting - if the file does not exist it will be created
sqlite.connect('db/test.db');
sqlite.run("CREATE TABLE torrents (hashid text PRIMARY KEY,created_at text,magnetURI text)");

var dateNow = new Date();

for (let i=101 ; i < 200; i++){


	let year = dateNow.getFullYear();
	sqlite.insert("torrents",{hashid:`AB${i}`,created_at:`${dateNow.getFullYear()}-${dateNow.getMonth()}-${dateNow.getDate()} ${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}.000`,magnetURI:'magnet:?xt=urn:btih:9a90ec8759e8d0975c3f42ba8aa686281e2bd966'},function(res){

		if(res.error)
			throw res.error;
		console.log(res);
		selectAllRecords();
		/* Recupera por consola los datos */
	});

}
console.log("Test...");



function selectAllRecords(){

	let allRec = sqlite.runAsync("select * from torrents",function(rows){

		console.log(rows);

	})

}