var SgCnf = require('./lib/SgCnf');
var sgClient;


// get the second argument passed
// in an invocation like $> node index server
// the process.argv array would be filled with
// ['node', 'index', 'server']
// so we take the second parameter to see if we need
// to instance a server or a client
if(process.argv[2] && typeof process.argv[2] === 'string'){

	switch(process.argv[2]){
		case 'server':
			sgClient = require('./lib/SgServer');
		break;

		//client
		default:
			sgClient = require('./lib/SgCliente');
	}

}else{
	sgClient = require('./lib/SgCliente');
}

