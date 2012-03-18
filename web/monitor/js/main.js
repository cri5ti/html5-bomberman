
require.config(
    {
        baseUrl: "js",
        paths: {
            "backbone": "lib/backbone",
            "underscore": "lib/underscore",
            "sparkline": "lib/sparkline"
        }
    }
);


require([
    "jquery", "underscore", "backbone",
    "sparkline"
],function($, _, Backbone, core) {



    $(function() {

        var socket = io.connect('/monitoring');

        var oldUsers = 0;

        socket.on('stat', function(stat) {

            chart("cpu", stat.cpu, stat.cpu+'%', {chartRangeMin: 0, chartRangeMax: 100, fillColor: '#0f0'});
            chart("users", stat.users, stat.users, {chartRangeMin: 0, fillColor: '#339'});
            chart("mapfill", stat.mapfill, stat.mapfill+'%', {chartRangeMin: 0, fillColor: '#933'});

            if (oldUsers < stat.users) {
                play("player-up");
            }
            oldUsers = stat.users;

            if (stat.cpu < 20)
                $("#curent-cpu").css({'color': '#0f0'});
            else if (stat.cpu < 60)
                $("#curent-cpu").css({'color': '#fa0', 'font-size': '110%'});
            else {
                $("#curent-cpu").css({'color': '#f00', 'font-size': '120%'});
                alertSound();
            }

            var time = new Date(stat.time);
            $("#lastupdate").text( time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() );

            $("#stat-uptime").text(formatTimespan(stat.server.uptime));
            $("#stat-restarts").text(stat.server.restarts);
            $("#stat-joins").text(stat.server.joinedplayers);

            $("#stat-kills").text(stat.kills.total);
            $("#stat-kills-kil").text(stat.kills.kills);
            $("#stat-kills-sui").text(stat.kills.suicides);

        });

    });

    var formatTimespan = function(t) {
        t = Math.floor( t/1000 );

        if (t < 60) return t + " sec";

        di = t % 60;
        ds = Math.floor(t / 60);
        if (ds < 60) return ds + " min " + di + " sec";

        di = ds % 60;
        ds = Math.floor(ds / 60);
        if (ds < 60) return ds + " hr " + di + " min";

        di = ds % 24;
        ds = Math.floor(ds / 24);
        return ds + " days " + di + " hr";

        return t;
    }

    var vals = {};
    var chart = function(n, v, tv, opt) {
        if (!vals[n]) vals[n] = [];
        var vs = vals[n];

        if (vs.length>60)
            vs.splice(0, 1);

        vs.push(v);

        $('#chart-'+n).sparkline(vs, _.extend(opt, {width: '100px', height: '30px'}));

        $("#curent-"+n).text(tv);
    }

    var alertSound = _.throttle(function() {
        play("alert");
    }, 10000);

    function play(snd) {
        var a = new Audio("res/" + snd + ".wav");
        a.play();
    }

});

