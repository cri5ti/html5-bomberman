
var express = require("express"),
    fs = require("fs");

//var auth= require('connect-auth');


var dir = __dirname + "/";

console.log("Working dir: ", dir);

//_______________________________________________________________
// HTTP + HTTPS

var http = express.createServer();
var https = express.createServer({
    key: fs.readFileSync(dir+"privatekey.key"),
    cert: fs.readFileSync(dir+"certificate.cer")
});


//_______________________________________________________________
// IO

var sio = require('socket.io').listen(https);
//io.set('transports', ['websocket','flashsocket','htmlfile','xhr-polling','jsonp-polling']);

var redis = require("redis").createClient();


/////////////

const fbCallbackAddress= "http://localhost:8000/";

var fb = require("./facebook/facebook").setup({
    appId: "209351425839638",
    appSecret: "f96d4be66d931678b7c5f12ee02e8db4"
});

var register = function (app) {

    app.use(express.bodyParser());

    app.use("/", fb.auth( { redirectUrl: "http://apps.facebook.com/shortfuse/" } ));

    app.post("/", function(req,res,next) {
        res.redirect(req.url);
    });

    app.get("/fb/static/", express.static("web/facebook/static/", {maxAge: 60*60*24*365}))
    app.use("/fb/", express.static("web/facebook/"));

    // game
    app.use(express.static("web/game/"));

    // monitor
    app.use("/monitor/", express.static("web/monitor/"));
};

global.counters = {};
var monitor = require("./monitor.js").start({io: sio, redis: redis});

var server = require("./game/server");

var s = new Server({io: sio, redis: redis});


//register(http);
http.get('*',function(req,res){
    res.redirect('https://www.playshortfuse.com'+req.url);
})
http.listen(8000);

register(https);
https.listen(8443);

console.log("Server started.");


