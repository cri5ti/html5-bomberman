
var fs = require("fs");

Monitor = function(sio) {

    var ep = sio.of('/monitoring');

    ep.on('connection', _.bind(this.connection, this));

};


Monitor.prototype.connection = function(s) {

    var timer = setInterval(function() {
        console.log(buildStats());
        s.volatile.emit('stat', buildStats());
    }, 1000);

    s.on('disconnect', function() {
        clearInterval(timer);
    });

};

exports.start = function(opt) {

    new Monitor(opt.io);

};

var sys = require('util')
var exec = require('child_process').exec;

var buildStats = function(b) {

    var time = (new Date()).getTime();

    return {
        time: time,
        users: global.counters.players,
        mapfill: Math.round(global.counters.mapfill * 10000) / 100,
        cpu: Math.round(lastCpuTime * 10000) / 100
    };

}

var lastCpuTime = -1;

var getUsage = function(cb) {
    fs.readFile("/proc/" + process.pid + "/stat", function(err, data){
        console.log(err);
        if (err) return;

        var elems = data.toString().split(' ');
        var utime = parseInt(elems[13]);
        var stime = parseInt(elems[14]);

        cb(utime + stime);
    });
}

setInterval(function() {
    getUsage(function(startTime) {
        setTimeout(function(){
            getUsage(function(endTime){
                var delta = endTime - startTime;

                lastCpuTime = 100 * (delta / 10000);
            });
        }, 1000);
    });
}, 3000);