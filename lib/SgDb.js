'use strict';

var sqlite = require('sqlite-sync'); //requiring
var SgCnf = require('./SgCnf.js');

//Connecting - if the file does not exist it will be created

var SgDb = (function(SgCnf,db){

	var _db = db;
	

	var _startDb = function(){

		_db.connect(SgCnf.pathToDb);
		_db.run("CREATE TABLE if not exists torrents (hashid text PRIMARY KEY,created_at text,magnetURI text,filename text)");
	
	}


	var _select = function(table,fields,where){

		return new Promise (function (fulfill, reject){
    

    		_db.runAsync(`select ${fields} from ${table} where ${where}`,function(res){

				if (typeof res.error != 'undefined') {
					console.log(`Error: ${res.error}`); 
					reject(res.error);
				}
				else {

					console.log(`Select: select ${fields} from ${table} where ${where} exitoso: ${res.length} registros`);
					fulfill(res);

				}

			});
		})

	}


	var _insert = function(table,values){

		return new Promise(function(fulfill,reject){

			_db.insert(table,values,function(res){

				if (typeof res.error != 'undefined'){

					console.log(`Error: ${res.error}`);
					reject(res.error);

				}
				else{

					console.log(`Se ha registrado un nuevo record con ID: ${res}`);
					fulfill(res);

				}

			});

		});

	}

	return {

		startDb : function(){

			_startDb();

		},
		select: function(table,fields,where){

			let promise = _select(table,fields,where);
			return promise;

		},
		delete: function(table,fields,where,limit){

		},
		create: function(table,fields,indexes){


		},
		drop: function (table){

		},
		insert: function(table,values){

			let promise = _insert(table,values);
			return promise;
		},
		update: function(table,fieldsValues,where){

		}

	}


})(SgCnf,sqlite);

//Inicializamos la base de datos
SgDb.startDb();

//Exportamos el módulo
module.exports = exports = SgDb;




/*

//Ejemplo para usar las promesas del módulo

var dateNow = new Date();

for (let i=101 ; i < 200; i++){


	let year = dateNow.getFullYear();
	SgDb.insert("torrents",{hashid:`AB${i}`,created_at:`${dateNow.getFullYear()}-${dateNow.getMonth()}-${dateNow.getDate()} ${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}.000`,magnetURI:'magnet:?xt=urn:btih:9a90ec8759e8d0975c3f42ba8aa686281e2bd966',filename:'FN.txt'}).then(
		function(data){

			console.log("Ejecutando asincronamente por que se ejecuto adecuadamente");
			console.log(data);

		},
		function(error){

			console.log("Ejecutando asincronamente por que se ejecuto erradamente");
			console.log(error);

		}
	);

}
console.log("Test...");
*/
