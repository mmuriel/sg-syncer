'use strict';
var SgCnf = require('./dist/sg-syncer/SgCnf');



// get the second argument passed
// in an invocation like $> node index server
// the process.argv array would be filled with
// ['node', 'index', 'server']
// so we take the second parameter to see if we need
// to instance a server or a client
if(process.argv[2] && typeof process.argv[2] === 'string'){

	switch(process.argv[2]){
		case 'server':
			let SgServerController = require('./sg-syncer/controllers/SgServerController');
			let sgcontroller = new SgServerController(SgCnf);
			sgcontroller.init();
			break;

		//client
		default:
			let SgClientController = require('./sg-syncer/controllers/SgClientController');
			let sgclient = new SgClientController(SgCnf);
			sgclient.init();
	}

}else{
	sgClient = require('./lib/SgCliente');
}

