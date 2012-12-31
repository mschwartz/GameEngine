GameEngine.onReady(function () {
    window.game = new GameEngine('playfield');

    var Starfield = Playfield.extend({
        numPlanes     : 3,
        planes        : [],
//        planeColors   : [],
        planeColors   : [ '#ffffff', '#bfbfbf', '#7f7f7f' ],

        constructor : function () {
            this.base();
            console.log('Starfield constructor');
        },
        resize: function() {
            var numPlanes = this.numPlanes,
                planeColors = this.planeColors,
                CANVAS_WIDTH = game.CANVAS_WIDTH,
                CANVAS_HEIGHT = game.CANVAS_HEIGHT;

            var starsPerPlane = this.starsPerPlane = parseInt(CANVAS_WIDTH * CANVAS_HEIGHT / 2000, 10);

            this.planes = [];
            console.log('resize ' + CANVAS_WIDTH + 'x' + CANVAS_HEIGHT);
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
                planeColors = this.planeColors,
                CANVAS_WIDTH = game.CANVAS_WIDTH,
                CANVAS_HEIGHT = game.CANVAS_HEIGHT;

            ctx.fillStyle = 'black';
//            ctx.canvas.width = ctx.canvas.width;
//            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            for (var p = 0; p < numPlanes; p++) {
                var pixel = planeColors[p];
                ctx.fillStyle = planeColors[p];
                var plane = this.planes[p];
                var wx = this.x >> (p + 1),
                    wy = this.y >> (p + 1);

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

//                    ctx.putImageData(pixel, x, y);
                    ctx.fillRect(x|0, y|0, 1, 1);
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
            game.resize();
        },
        run         : function () {

        }
    });

    var DebugProcess = Process.extend({
        type        : 'debug',
        constructor : function () {
            this.base(this.run);
        },
        run         : function () {
            var ctx = game.ctx;

            ctx.font = 'bold 12pt Courier New';
            ctx.fillStyle = 'white';
            ctx.fillText('Bearing   : ' + player.sprite.bearing + ' degrees', 10, 20);
            ctx.fillText('World X,Y : ' + player.sprite.x.toFixed(2) + ',' + player.sprite.y.toFixed(2), 10, 34);
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
            ctx = game.ctx;
            ctx.font = 'bold 12pt Courier New';
            ctx.fillStyle = 'white';
            ctx.fillText(this.seconds + ' ' + new Date().getSeconds() + ' ' + game.CANVAS_WIDTH + 'x' + game.CANVAS_HEIGHT, 10, 46);
        }

    });

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
            if (keyDown(39)) {
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
            playfield.x = (sprite.x + sprite.vx) - 16 - game.CANVAS_WIDTH/2;
            playfield.y = (sprite.y + sprite.vy) - 16 - game.CANVAS_HEIGHT/2;

        }
    });

});
