'use strict';
//const sqlite = require('sqlite-sync'); //Deprecada por errores con las pruebas en chai
const sqlite3 = require('sqlite3').verbose();


//Connecting - if the file does not exist it will be created


class SgDb{

	constructor(pathToDb) {


		this.db = new sqlite3.Database(pathToDb);
		//this.db.connect(pathToDb);
		this.db.run("CREATE TABLE if not exists torrents (hashid text PRIMARY KEY,created_at text,magnetURI text,filename text)",[],(error)=>{
			if(error){
				console.log(`Error generando la tabla de la DB ${error}`);
			}
		});

	}

	select (table,fields,where){

		return new Promise ((resolve, reject) => {
    		this.db.get(`select ${fields} from ${table} where ${where}`,[],(error,res)=>{
				if (typeof error != 'undefined' && error != null) {
					reject(error);
				}
				else {
					resolve(res);
				}
			});
		})
	}

	insert(table,values){

		return new Promise((resolve,reject)=>{
				this.db.run(`INSERT INTO torrents (hashid,created_at,magnetURI,filename) VALUES (?,?,?,?)`,values,(error)=>{
				if (typeof error != 'undefined' && error != null){
					reject(error);
				}
				else{
					//console.log(this);
					resolve(true);
				}
			});
		});

	}

}



//Exportamos el módulo
module.exports = exports = SgDb;