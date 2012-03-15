
(function() {

    MapGenerator = Backbone.Model.extend({
        initialize: function(opt) {
            this.w = opt.w;
            this.h = opt.h;

            this.map = new Array(this.w * this.h);
            for(var i=0; i<this.w * this.h; i++)
                this.map[i] = 0;

            this.classicMapGenerator();
            this.borderedMapGenerator();
        },

        borderedMapGenerator: function() {
            for(var i=0; i<this.w; i++) {
                for(var j=0; j<this.h; j++) {
                    if (i==0 || i==this.w-1 || j==0 || j==this.h-1)
                        this.setMap(i,j, TILE_SOLID);
                }
            }
        },

        classicMapGenerator: function() {
            this.borderedMapGenerator();

            for(var i=0; i<this.w; i++) {
                for(var j=0; j<this.h; j++) {

                    if (i%2==0 && j%2==0)
                        this.setMap(i,j, TILE_SOLID);
                    else if ( Math.floor(Math.random()*5)==0)
                        this.setMap(i,j, TILE_BRICK);

                }
            }
        },

        setMap: function(x,y,c) {
            this.map[y * this.w + x] = c;
        },

        getMap: function() {
            return {
                width: this.w,
                height: this.h,
                map: this.map.join("")
            };
        }
    });


    Map = Backbone.Model.extend({
        defaults: {
            width: 50,
            height: 40,
            x: 5,
            y: 3
        },

        initialize: function() {
            var map = new MapGenerator({
                w: this.get('width'),
                h: this.get('height')
            }).getMap();
            this.set(map);
        },

        getAbsTile: function(x, y) {
            return this.getTile(x - this.get('x'), y - this.get('y'));
        },

        getTile: function(x, y) {
            // check bounds
            if (x<0) return -1;
            if (x>=this.get('width')) return -1;
            if (y<0) return -1;
            if (y>=this.get('height')) return -1;

            var c = this.get('map')[ y * this.get('width') + x ];
            return c*1;
        },

        getMap: function() {
            return {
                x: this.get('x'),
                y: this.get('y'),
                w: this.get('width'),
                h: this.get('height'),
                map: this.get('map')
            }
        },

        setAbsMap: function(x, y, c, silent) {
            if (silent === undefined) silent = false;
            var ix = (y - this.get('y')) * this.get('width') + (x - this.get('x'));
            var map = this.get('map');
            this.set('map', map.substr(0, ix) + c + map.substr(ix+1), {silent: silent});
        },

        getValidSpawnLocation: function() {
            var valid = false;
            do {
                var x = Math.floor(Math.random()*this.get('width')) + this.get('x');
                var y = Math.floor(Math.random()*this.get('height')) + this.get('y');

                console.log("trying to spawn at " + x + "," + y);

                if (this.getAbsTile(x,y) != TILE_SOLID) {
                    valid = true;

                    // clear room
                    for(var i=-2; i<=2; i++)
                        for(var j=-2; j<=2; j++)
                            if (this.getAbsTile(x+i, y+j) == TILE_BRICK) this.setAbsMap(x+i, y+j, TILE_EMPTY);
                }
            } while(!valid);

            this.trigger('notify');

            return {
                x: x + .5,
                y: y + .5
            };
        },

        update: function(g, now) {
            if (_.size(g.playersById)==0)
                return;

            var tot = 0;
            var cnt = 0;
            var m = this.attributes;

            for(var i=m.x; i<=m.x+m.width; i++)
                for(var j=m.y; j<=m.y+m.height; j++) {
                    tot++;
                    var t = this.getAbsTile(i, j);
                    if (t != TILE_SOLID) tot++;
                    if (t == TILE_BRICK) cnt++;
                }

            var fill = cnt / tot;
            console.log("Map fill = " + fill);
            global.counters.mapfill = fill;
            if (cnt > tot*0.15) return;

            var fills = 20;

            for(i=0; i<fills; i++) {
                var x = Math.floor(Math.random()*this.get('width')) + this.get('x');
                var y = Math.floor(Math.random()*this.get('height')) + this.get('y');

                if (_.any(g.playersById, function(p){
                    d = Math.abs(x - p.get('x')) + Math.abs(y - p.get('y'));
                    if (d < 5) return true;
                }))
                    continue;


                if (this.getAbsTile(x,y) == TILE_EMPTY) {
                    this.setAbsMap(x, y, TILE_BRICK);
                }
            }

            this.trigger('notify');
        }

    });

})();

