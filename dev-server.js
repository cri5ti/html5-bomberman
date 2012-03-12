

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

site.get("*", function(req, res) {

    res.writeHead(302, {
        'Location': 'http://ec2-176-34-217-95.eu-west-1.compute.amazonaws.com/'
    });

    res.end();
});



var port = process.env.PORT || 8000;

site.listen(port);


console.log("Server listening on :" + port);

