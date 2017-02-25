'use strict'
/*

	Esta clase tiene como unica responsabilidad, notificar de la existencia
	de un nuevo archivo en una carpeta

	Responde al patrón pub/sub

*/ 


class FileWatcher {

	constructor (){
		this.callBacks  = {};
		this.subUid = -1;
	}

	subscribeToWatchFile(callback){

		let token = (++this.subUid).toString();
			this.callBacks.push({callback:callback,token:token});
		return token;

	}




}


module.exports = exports = FileWatcher;