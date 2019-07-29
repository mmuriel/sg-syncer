'use strict'

/* Dependiencias */
let chokidar = require('chokidar');

/*

	Esta clase tiene como unica responsabilidad, notificar de la existencia
	de un nuevo archivo en una carpeta

	Responde al patrón pub/sub

*/ 


class FileWatcher {

	constructor (pathToSource){

		this.callBacks  = [];
		this.subUid = -1;
		this.watcher = chokidar.watch(pathToSource,{awaitWriteFinish:
			{
				stabilityThreshold: 6000,
    			pollInterval: 100
			}
		});// El parametro awaitWriteFinish:true, sirve para esperar hasta la finalización de la carga del archivo

	}

	subscribeToWatchFile(callback){

		let token = (++this.subUid).toString();
		this.callBacks.push({fncallback:callback,token:token});
		return token;

	}

	publishNewFile(data){


		for(let i = 0; i < this.callBacks.length; i++){
			
			if (typeof this.callBacks[i].fncallback == 'function')
				this.callBacks[i].fncallback(data);

		}
		return true;
	}


	startWatchForFiles(notify){

		this.watcher.on('add',(pathToSource,data)=>{
		    let expReg = new RegExp("\\.mov$|\\.mpg$|\\.mpeg$|\\.wmv$",'i');
		    if (typeof pathToSource == 'string'){

		        if (expReg.test(pathToSource)){

		        	this.publishNewFile(pathToSource);
		        	notify(pathToSource);

		        }
		        else{
		        	console.log(`No es un archivo de video ${pathToSource}`);
		        }
		    }
		    else{
		    	console.log("No se ha definido un path valido hasta el archivo");
		    }

		});
	}




}


//Usando require();
module.exports = exports = FileWatcher;

//Usando Import
//export default FileWatcher;