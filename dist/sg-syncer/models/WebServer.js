'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var http = require('http');
var url = require('url');
var fs = require('fs');

var WebServer = function WebServer(pathToPublic, httpPort) {
	var _this = this;

	_classCallCheck(this, WebServer);

	this.pathToPublic = pathToPublic;
	this.wserver = http.createServer(function (req, res) {

		var path = url.parse(req.url).pathname;
		var pathToHtmlFiles = _this.pathToPublic + '' + path;

		console.log(req.method + ': ' + req.url);
		console.log('---------------\n');

		switch (path) {
			case '/':
				var localIndexHtml = '<!DOCTYPE html>\n\t\t<html>\n\t\t<head>\n\t\t    <meta charset=\'utf-8\'>\n\t\t    <meta name=\'viewport\' content=\'width=device-width, initial-scale=1\'>\n\t\t    <title>SG-Syncer</title>\n\t\t</head>\n\t\t<body>\n\t\t    <h1>SG-Syncer system</h1>\n\t\t</body>\n\t\t</html>';

				res.writeHead(200, { 'Content-Type': "text/html" });
				res.write(localIndexHtml);
				res.end();

				break;
			case '/socket.html':

				fs.readFile(pathToHtmlFiles, function (error, data) {
					if (error) {
						res.writeHead(404);
						res.write("opps this doesn't exist - 404");
						res.end();
					} else {
						res.writeHead(200, { "Content-Type": "text/html" });
						res.write(data, "utf8");
						res.end();
					}
				});
				break;

			default:
				res.writeHead(404);
				res.write("opps this doesn't exist - 404");
				res.end();
				break;
		}

		//console.log(res);
	});
	this.wserver.listen(httpPort);
};

//Usando require();


module.exports = exports = WebServer;

//Usando Import
//export default FileWatcher;