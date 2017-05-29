'use strict';
let sqlite = require('sqlite-sync');

//Connecting - if the file does not exist it will be created


class SgDb{

	constructor(pathToDb) {
		this.db = sqlite;
		this.db.connect(pathToDb);
		this.db.run("CREATE TABLE if not exists torrents (hashid text PRIMARY KEY,created_at text,magnetURI text,filename text)");

	}

	select (table,fields,where){

		return new Promise ((resolve, reject) => {
    

    		this.db.runAsync(`select ${fields} from ${table} where ${where}`,(res)=>{
				if (typeof res.error != 'undefined') {
					reject(res.error);
				}
				else {
					resolve(res);
				}
			});
		})
	}

	insert(table,values){

		return new Promise((resolve,reject)=>{
			this.db.insert(table,values,(res)=>{
				if (typeof res.error != 'undefined'){
					reject(res.error);
				}
				else{
					resolve(res);
				}
			});
		});

	}

}



//Exportamos el módulo
module.exports = exports = SgDb;