
var express = require("express"),
    fs = require("fs");

//var auth= require('connect-auth');


var dir = __dirname + "/";

console.log("Working dir: ", dir);

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


/////////////

const fbCallbackAddress= "http://localhost:8000/";

var fb = require("./facebook/facebook").setup({
    appId: "209351425839638",
    appSecret: "f96d4be66d931678b7c5f12ee02e8db4"
});

var register = function (app) {

//    app.use(express.cookieParser());
//    app.use(express.logger());
//    app.use(express.session({ secret: "raging bull" }));
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

// FIXME
global.counters = {};
// var monitor = require("./monitor.js").start({io: sio});

var server = require("./game/server");

var s = new Server({io: sio});


register(http);
http.listen(8000);

https.use(function(req,res) {
    res.redirect("http://playshortfuse.com");
    res.end();
});
https.listen(8443);

console.log("Server started.");


