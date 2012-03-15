
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

            chart("cpu", stat.cpu, {val: stat.cpu+'%', chartRangeMin: 0, chartRangeMax: 100, fillColor: '#dfd'});
            chart("users", stat.users, {chartRangeMin: 0, fillColor: '#ddf'});
            chart("mapfill", stat.mapfill, {val: stat.mapfill+'%', chartRangeMin: 0, fillColor: '#ffd'});

        });

    });

    var vals = {};
    var chart = function(n, v, opt) {
        if (!vals[n]) vals[n] = [];
        var vs = vals[n];

        if (vs.length>60)
            vs.splice(0, 1);

        vs.push(v);

        $('#chart-'+n).sparkline(vs, _.extend(opt, {
            height: '50px'
        }));

        $("#curent-"+n).text(opt.val || v);
    }

});

