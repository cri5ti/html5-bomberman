

Monitor = function(sio) {

    var ep = sio.of('/monitoring');

    ep.on('connection', _.bind(this.connection, this));

};


Monitor.prototype.connection = function(s) {

    console.log("new");

    var timer = setInterval(function() {

        buildStats(function(stat) {
            s.emit('stat', stat);
            console.log(stat);
        });

    }, 1000);

    s.on('disconnect', function() {
        console.log("bye");
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

    var pid = process.pid;

    var stat = {
        time: time,
        users: Math.round(Math.random() * 20)
    };

    child = exec("ps -p" + pid + " -opcpu | sed -n '2p'", function (error, stdout, stderr) {
        stat.cpu = stdout*1;
        b(stat);
    });

}
