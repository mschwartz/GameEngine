GameEngine.onReady(function () {
    window.game = new GameEngine('playfield');

    var CANVAS_WIDTH = game.CANVAS_WIDTH,
        CANVAS_HEIGHT = game.CANVAS_HEIGHT;

    var Starfield = Playfield.extend({
        vx            : 0,
        vy            : 0,
        numPlanes     : 3,
        planes        : [],
        starsPerPlane : parseInt(CANVAS_WIDTH * CANVAS_HEIGHT / 1000, 10),
        planeColors   : [ '#ffffff', '#bfbfbf', '#7f7f7f' ],

        constructor : function () {
            this.base();
            console.log('Starfield constructor');
            var numPlanes = this.numPlanes,
                starsPerPlane = this.starsPerPlane;

            for (var p = 0; p < numPlanes; p++) {
                var plane = [];
                for (var s = 0; s < starsPerPlane; s++) {
                    plane.push({ x : random(CANVAS_WIDTH), y : random(CANVAS_HEIGHT) });
                }
                this.planes.push(plane);
            }
        },
        draw        : function (ctx) {
            var numPlanes = this.numPlanes,
                starsPerPlane = this.starsPerPlane,
                planeColors = this.planeColors;

            this.x += this.vx;
            this.y += this.vy;

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            for (var p = 0; p < numPlanes; p++) {
                ctx.fillStyle = planeColors[p];
                var plane = this.planes[p];
                var wx = this.x >> (p + 1),
                    wy = this.y >> p;

                for (var s = 0; s < starsPerPlane; s++) {
                    var star = plane[s];
                    var x = (star.x - wx) % CANVAS_WIDTH;
                    if (x < 0) {
                        x += CANVAS_WIDTH;
                    }
                    var y = (star.y - wy) % CANVAS_HEIGHT;
                    if (y < 0) {
                        y += CANVAS_HEIGHT;
                    }

                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    });


    function createSprite() {
        var sprite = SpriteManager.allocSprite(AnimatedSprite);
        sprite.x = 100;
        sprite.y = 100;
        sprite.startAnimation(earthAnimation);
        SpriteManager.addSprite(sprite);
    }

    var earthAnimation = [],
        shipContactSheet;

    var LoaderProcess = Process.extend({
        type        : 'loader',
        constructor : function () {
            console.log('LoaderProcess constructor');
            var me = this;
            me.base(this.run);
            me.imagesToLoad = 0;

            function imageLoaded() {
                me.imagesToLoad--;
            }
            function loadImage(url) {
                me.imagesToLoad++;
                var img = new Image();
                img.onload = imageLoaded;
                img.src = url;
                return img;
            }
            for (var i = 1; i <= 30; i++) {
                earthAnimation.push(loadImage('img/earth/frame-' + i + '.gif'));
            }
            shipContactSheet = loadImage('img/ship360_32.png');
        },
        run         : function () {
            if (this.imagesToLoad <= 0) {
                ProcessManager.birth(GameProcess);
                this.suicide();
            }
        }
    });
    ProcessManager.birth(LoaderProcess);

    var GameProcess = Process.extend({
        type        : 'game',
        constructor : function () {
            this.base(this.run);
            createSprite();
            ProcessManager.birth(DebugProcess);
            ProcessManager.birth(ClockProcess);
            ProcessManager.birth(PlayerProcess);
            game.playfield = new Starfield();
        },
        run         : function () {

        }
    });

    var DebugProcess = Process.extend({
        type        : 'debug',
        constructor : function () {
            this.base(this.run);
            this.debug = document.getElementById('debug');
        },
        run         : function () {
            var playfield = game.playfield;
            this.debug.innerHTML = player.sprite.bearing + ' ' + parseInt(playfield.x*100, 10)/100 + ',' + parseInt(playfield.y*100, 10)/100;
            this.sleep(1, this.run);
        }
    });

    var ClockProcess = Process.extend({
        type: 'clock',
        constructor: function() {
            this.base(this.start);
            this.seconds = 0;
            this.jiffies = 0;
            this.wait = new Date().getSeconds();
            this.clock = document.getElementById('clock');
        },
        start: function() {
            var seconds = new Date().getSeconds();
            if (this.wait === seconds) {
                return;
            }
            this.seconds = seconds;
            this.sleep(1, this.run);
        },
        run: function() {
            this.jiffies++;
            if (this.jiffies >= 60) {
                this.jiffies = 0;
                this.seconds++;
                if (this.seconds >= 60) {
                    this.seconds = 0;
                }
            }
            this.clock.innerHTML = this.seconds + ' ' + new Date().getSeconds();
        }

    })
    var PlayerSprite = Sprite.extend({
        type: 'player',
        constructor: function() {
            this.base();
            this.bearing = 0;
            this.velocity = 0;
            this.image = shipContactSheet;
            this.x = game.CANVAS_WIDTH/2;
            this.y = game.CANVAS_HEIGHT/2;
        },
        draw: function(ctx, worldX, worldY) {
            var x = this.x - 16 - worldX,
                y = this.y - 16 - worldY;

            var ang = 90 - this.bearing,
                angle = parseInt((ang < 0 ? ang + 360 : ang) / 5, 10),
                row = parseInt(angle / 6, 10),
                col = parseInt(angle % 6, 10);

            ctx.drawImage(this.image, col*32,row*32, 32,32, x, y, 32, 32);
        },
        afterDraw: function() {
            game.playfield.x = this.x - 16 - game.CANVAS_WIDTH/2;
            game.playfield.y = this.y - 16 - game.CANVAS_HEIGHT/2;
        }
    });

    var player;

    var PlayerProcess = Process.extend({
        type: 'player',
        constructor: function() {
            player = this;
            this.base(this.run);
            this.sprite = SpriteManager.allocSprite(PlayerSprite);
            SpriteManager.addSprite(this.sprite);
        },
        run: function() {
            var sprite = this.sprite,
                keyPressed = Input.keyPressed,
                keyDown = Input.keyDown,
                playfield = game.playfield;

            if (keyPressed(38)) {
                sprite.velocity++;
            }
            else if (keyPressed(40)) {
                sprite.velocity--;
            }
            else if (keyDown(39)) {
                sprite.bearing--;
                if (sprite.bearing < 0) {
                    sprite.bearing += 360;
                }
            }
            else if (keyDown(37)) {
                sprite.bearing++;
                sprite.bearing %= 360;
            }
            sprite.vx = Math.cos(sprite.bearing * Math.PI/180) * sprite.velocity;
            sprite.vy = -Math.sin(sprite.bearing * Math.PI/180) * sprite.velocity;
            playfield.x = sprite.x - 16 - game.CANVAS_WIDTH/2;
            playfield.y = sprite.y - 16 - game.CANVAS_HEIGHT/2;

        }
    });

});
