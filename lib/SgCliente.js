'use strict';
var SgCliente = (function(){

	let var1 = 1;

	return {

		fun1 : function(){
			console.log("Desde fun1: "+ var1++);
		},
		fun2: function (){
			console.log("Desde fun2"+ var1++);
		},
		fun3: function(){
			console.log("Desde fun3"+ var1++);
		}

	}

}
)();

module.exports = exports = SgCliente;