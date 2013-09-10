

var fs = require("fs");

_ = require('underscore')._;

Monitor = function(sio, r) {

    var ep = sio.of('/monitoring');

    ep.on('connection', _.bind(this.connection, this));

    redis = r;

};


Monitor.prototype.connection = function(s) {

    var timer = setInterval(function() {
        s.volatile.emit('stat', buildStats());
    }, 1000);

    s.on('disconnect', function() {
        clearInterval(timer);
    });

};

exports.start = function(opt) {

    new Monitor(opt.io, opt.redis);

};

var sys = require('util')
var exec = require('child_process').exec;
var redis;

var buildStats = function(b) {

    var time = (new Date()).getTime();

    var startTime = lastStats.lastStartTime;

    return {
        time: time,
        users: global.counters.players,
        mapfill: Math.round(global.counters.mapfill * 10000) / 100,
        cpu: Math.round(lastCpuTime * 10000) / 100,
        server: {
            uptime: time - startTime,
            restarts: lastStats.restarts * 1,
            joinedplayers: lastStats.joinedPlayers * 1
        },
        kills: {
            total: lastStats.kills * 1,
            suicides: lastStats.killsSuicides * 1,
            kills: lastStats.killsKills * 1
        }

    };

}

var lastCpuTime = 0;
var lastStats = {};

var getUsage = function(cb) {
    fs.readFile("/proc/" + process.pid + "/stat", function(err, data){
        if (err) return;

        var elems = data.toString().split(' ');
        var utime = parseInt(elems[13]);
        var stime = parseInt(elems[14]);

        cb(utime + stime);
    });
}

setInterval(function() {

    // cpu
    getUsage(function(startTime) {
        setTimeout(function(){
            getUsage(function(endTime){
                var delta = endTime - startTime;

                lastCpuTime = 100 * (delta / 10000);
            });
        }, 1000);
    });

    // redis stats

    if (redis) {
        redis.multi()
            .get("stats.last-start-time")
            .get("counters.restarts")
            .get("counters.joined-players")
            .get("counters.kills")
            .get("counters.kills.suicides")
            .get("counters.kills.kills")
            .exec(function(err, res) {
                lastStats.lastStartTime     = res[0];
                lastStats.restarts          = res[1];
                lastStats.joinedPlayers     = res[2];
                lastStats.kills             = res[3];
                lastStats.killsSuicides     = res[4];
                lastStats.killsKills        = res[5];
            });
    }

}, 3000);