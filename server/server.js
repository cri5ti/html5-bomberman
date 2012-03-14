
var express = require("express"),
    fs = require("fs");

var dir = __dirname + "/";

console.log("Working dir: ", dir);

global.counters = {};

//_______________________________________________________________
// HTTP + HTTPS

var http = express.createServer();
var https = express.createServer({
    key: fs.readFileSync(dir+"privatekey.pem"),
    cert: fs.readFileSync(dir+"certificate.pem")
});


//_______________________________________________________________
// IO

var sio = require('socket.io').listen(http);
//io.set('transports', ['websocket','flashsocket','htmlfile','xhr-polling','jsonp-polling']);

//_______________________________________________________________
// Server

var server = require("./game/server");

var s = new Server({io: sio});


var register = function (app) {

    app.use(express.bodyParser());

    app.use(express.static("web/game/"));

    app.use("/monitor/", express.static("web/monitor/"));
};

var monitor = require("./monitor.js").start({io: sio});

register(http);
http.listen(8000);

https.use(function(req,res) {
    res.redirect("http://playshortfuse.com");
    res.end();
});
https.listen(8443);

console.log("Server started.");


