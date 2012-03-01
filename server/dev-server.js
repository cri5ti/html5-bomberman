

var public = "../web/";

// IMPORTS ______________________________________________________

var http = require("http");
var fs = require("fs");
var express = require("express");
var site = express.createServer();
var url = require("url");

var _ = require("underscore")._;
var Backbone = require("backbone");


var server = require("./server");

//_______________________________________________________________
// IO

var io = require('socket.io').listen(1234);

//io.set('transports', [
//    'websocket',
//    'flashsocket'
//    'htmlfile',
//    'xhr-polling',
//    'jsonp-polling',
//]);

var s = new Server({io: io});


//_______________________________________________________________
// WebApp static resources

site.use("/css", express.static(public + "css"));
site.use("/js", express.static(public + "js"));
site.use("/html", express.static(public + "html"));
site.use("/res", express.static(public + "res"));


site.get("*", function(req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin' : 'http://dev.s2ih.fr'
    });

    fs.createReadStream(public + "index.html").pipe(res);
});


site.listen(8000);

console.log("Server listening on :8000");


