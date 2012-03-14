
require.config(
    {
        baseUrl: "js",
        paths: {
            "backbone": "lib/backbone",
            "underscore": "lib/underscore",
            "highcharts": "lib/highcharts"
        },
    }
);


require([
    "jquery", "underscore", "backbone",
    "highcharts"
],function($, _, Backbone, core) {

    var chartCpu = new Highcharts.Chart({
        chart: {
            renderTo: 'chart-cpu',
            type: 'area',
            animation: false
        },
        title: { text: "" },
        credits: {
            enabled: false
        },
        plotOptions: {
            area: {
                animation: false,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            max: 100,
            title: { text: 'CPU' }
        },
        series: [{
            name: 'node',
            data: []
        }]
    });

    var chartUsers = new Highcharts.Chart({
            chart: {
                renderTo: 'chart-users',
                type: 'area',
                animation: false
            },
            title: { text: "" },
            credits: { enabled: false },
            plotOptions: {
                area: {
                    animation: false,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: { text: 'Users' }
            },
            series: [{
                name: 'node',
                data: []
            }]
        });

    $(function() {

        var socket = io.connect('/monitoring');

        socket.on('stat', function(stat) {
            var s = chartCpu.series[0];
            s.addPoint([stat.time, stat.cpu], true, s.data.length > 60);

            s = chartUsers.series[0];
            s.addPoint([stat.time, stat.users], true, s.data.length > 60);
        });

    });

});

