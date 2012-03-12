

var public = "web/";

// IMPORTS ______________________________________________________

var http = require("http");
var fs = require("fs");
var express = require("express");
var site = express.createServer();
var url = require("url");

var _ = require("underscore")._;
var Backbone = require("backbone");


var server = require("./server/server");

//_______________________________________________________________
// IO

var io = require('socket.io').listen(site);

io.set('transports', [
    'websocket',
//    'flashsocket'
//    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
]);

var s = new Server({io: io});


// ________
// XMPP

//var junction = require('junction');

//var options = {
//    type        : 'client',
//    jid         : "mihai.a.cristian@gmail.com",    // this is a special account for this app, so don't bother..
//    password    : "notaweakpassword",
//    host        : 'talk.google.com',
//    port        : 5222
//};
//
//var connection = junction.createConnection(options);
//connection.on('online', function() {
//    console.log('Connected as: ' + connection.jid);
//    connection.send(new junction.elements.Presence());
//
//    connection.send(new junction.elements.Message() );
//});
//
//connection.use(junction.presence(function(handler) {
//    handler.on('available', function(stanza) {
//        console.log(stanza.from + ' is available');
//    });
//    handler.on('unavailable', function(stanza) {
//        console.log(stanza.from + ' is unavailable');
//    });
//}));
//
//connection.use(junction.serviceUnavailable());
//connection.use(junction.errorHandler());




//_______________________________________________________________
// WebApp static resources

site.use("/css", express.static(public + "css"));
site.use("/js", express.static(public + "js"));
site.use("/html", express.static(public + "html"));
site.use("/res", express.static(public + "res"));
site.use("/snd", express.static(public + "snd"));


site.get("*", function(req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin' : 'http://dev.s2ih.fr'
    });

    fs.createReadStream(public + "index.html").pipe(res);
});


var port = process.env.PORT || 8000;

site.listen(port);


console.log("Server listening on :" + port);

