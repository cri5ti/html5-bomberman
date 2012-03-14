
require.config(
    {
        baseUrl: "js",
        paths: {
            "backbone": "lib/backbone",
            "underscore": "lib/underscore",
            "sparkline": "lib/sparkline"
        },
    }
);


require([
    "jquery", "underscore", "backbone",
    "sparkline"
],function($, _, Backbone, core) {



    $(function() {

        var socket = io.connect('/monitoring');

        var cpuvalues = [];
        var usersvalues = [];

        socket.on('stat', function(stat) {

            if (cpuvalues.length>60)
                cpuvalues.splice(0, 1);

            cpuvalues.push(stat.cpu);
            $('#chart-cpu').sparkline(cpuvalues, {
                height: '50px',
                chartRangeMin: 0,
                chartRangeMax: 100,
                fillColor: '#eee'
            });
            $("#curent-cpu").text(stat.cpu + "%");

            //

            if (usersvalues.length>60)
                usersvalues.splice(0, 1);

            usersvalues.push(stat.users);
            $('#chart-users').sparkline(usersvalues, {
                height: '50px',
                fillColor: '#eee',
                chartRangeMin: 0
            });
            $("#curent-users").text(stat.users);

        });

    });

});

