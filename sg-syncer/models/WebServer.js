'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');

class WebServer{

	constructor(pathToPublic,httpPort) {


		this.pathToPublic = pathToPublic;
		this.wserver = http.createServer((req,res)=>{

		    let path = url.parse(req.url).pathname;
		    let pathToHtmlFiles = this.pathToPublic+''+path;
		    console.log(req.url);
		    console.log(req.method);
		    switch(path){
		        case '/':
		            let localIndexHtml = `<!DOCTYPE html>
		<html>
		<head>
		    <meta charset='utf-8'>
		    <meta name='viewport' content='width=device-width, initial-scale=1'>
		    <title>SG-Syncer</title>
		</head>
		<body>
		    <h1>SG-Syncer system</h1>
		</body>
		</html>`;

		            res.writeHead(200,{'Content-Type':"text/html"});
		            res.write(localIndexHtml);
		            res.end();



		            break;
		        case '/socket.html':

		            fs.readFile(pathToHtmlFiles,(error, data)=>{
		                if (error){
		                    res.writeHead(404);
		                    res.write("opps this doesn't exist - 404");
		                    res.end();
		                }
		                else{
		                    res.writeHead(200, {"Content-Type": "text/html"});
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
		
	}

}

//Usando require();
module.exports = exports = WebServer;

//Usando Import
//export default FileWatcher;