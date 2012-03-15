
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

        socket.on('stat', function(stat) {

            chart("cpu", stat.cpu, stat.cpu+'%', {chartRangeMin: 0, chartRangeMax: 100, fillColor: '#0f0'});
            chart("users", stat.users, stat.users, {chartRangeMin: 0, fillColor: '#339'});
            chart("mapfill", stat.mapfill, stat.mapfill+'%', {chartRangeMin: 0, fillColor: '#933'});

            if (stat.cpu < 20)
                $("#curent-cpu").css({'color': '#0f0'});
            else if (stat.cpu < 60)
                $("#curent-cpu").css({'color': '#fa0', 'font-size': '110%'});
            else
                $("#curent-cpu").css({'color': '#f00', 'font-size': '120%'});
        });

    });

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

});

