'use strict';
let soap =  require("soap");

class SoapClient{

  

	constructor(wsdlUrl){

		this.soapClient = {};
		soap.createClient(wsdlUrl,(err, client) => {this.soapClient = client;});
	}
  

	call(args,fnSuccess,fnError){

		return (new Promise ((fnSuccess,fnError)=>{

  				let data = {};
  				fnSuccess(data);

  			})
  		)
  	}

  	/*
  	client(){

  		return this.soapClient;

  	}
  	*/



}

module.exports = exports =  SoapClient;