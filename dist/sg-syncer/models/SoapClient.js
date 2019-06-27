'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var soap = require("soap");

var SoapClient = function () {
  function SoapClient(wsdlUrl) {
    var _this = this;

    _classCallCheck(this, SoapClient);

    this.soapClient = {};
    soap.createClient(wsdlUrl, function (err, client) {
      _this.soapClient = client;
    });
  }

  _createClass(SoapClient, [{
    key: "call",
    value: function call(args, fnSuccess, fnError) {

      return new Promise(function (fnSuccess, fnError) {

        var data = {};
        fnSuccess(data);
      });
    }

    /*
    client(){
    		return this.soapClient;
    	}
    */

  }]);

  return SoapClient;
}();

module.exports = exports = SoapClient;