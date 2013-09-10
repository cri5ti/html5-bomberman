
var express = require("express");
var app = express();

var server = require('http').Server(app);
var socketio = require('socket.io').listen(server);
//socketio.set('transports', ['websocket','flashsocket','htmlfile','xhr-polling','jsonp-polling']);


var redis = null;
if (!process.env.SHORTFUSE_LIGHT)
     redis = require("redis").createClient();

/////////////


global.counters = {};
var monitor = require("./monitor.js").start({io: socketio, redis: redis});

var Server = require("./game/server");

new Server({io: socketio, redis: redis});


app.use(express.bodyParser());

// game
app.use(express.static(__dirname + "/../web/game/"));

// monitor
app.use("/monitor/", express.static(__dirname + "/../web/monitor/"));

server.listen(3000);

module.exports = app;
