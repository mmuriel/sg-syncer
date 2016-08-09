var SgCnf = require('./lib/SgCnf.js');
if (SgCnf.profile === 'server'){
	var SgServer = require('./lib/SgServer.js');
	console.log(SgServer);
}
else if (SgCnf.profile === 'client'){
	var SgCliente = require('./lib/SgCliente.js');
	console.log(SgCliente);
}

