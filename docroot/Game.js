GameEngine.onReady(function () {
    window.game = new GameEngine('playfield');

    var TYPE_DEFAULT = Sprite.prototype.TYPE_DEFAULT,
        TYPE_PLAYER = Sprite.prototype.TYPE_PLAYER,
        TYPE_PBULLET = Sprite.prototype.TYPE_PBULLET,
        TYPE_ENEMY = Sprite.prototype.TYPE_ENEMY,
        TYPE_EBULLET = Sprite.prototype.TYPE_EBULLET,
        TYPE_PLANET = (1<<Sprite.prototype.TYPE_USER_BIT);

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
            GameEngine.images.each(function(image, key) {
                GameEngine.images[key] = loadImage(image);
            });
        },
        run         : function () {
            if (this.imagesToLoad <= 0) {   // all loaded, start the game!
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
//            createSprite();
            ProcessManager.birth(DebugProcess);
            ProcessManager.birth(ClockProcess);
            ProcessManager.birth(PlanetProcess);
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

    var PlanetSprite = AnimatedSprite.extend({
        type: 'planet',

        constructor: function() {
            this.base(TYPE_PLANET);
            this.anchor = this.ANCHOR_CENTER;
            this.w = this.h = 64;
            this.flags |= this.FLAG_CHECK;
            this.cmask |= TYPE_PLAYER | TYPE_PBULLET;
        }
    });

    var PlanetProcess = Process.extend({
        type: 'planet',
        constructor: function() {
            this.base(this.run);
            var sprite = this.sprite = SpriteManager.allocSprite(PlanetSprite);
            sprite.x = 100;
            sprite.y = 100;
            sprite.startAnimation(GameEngine.animations.earthAnimation);
            SpriteManager.addSprite(sprite);
        },
        run: function() {
            this.sprite.ctype = 0;
        }
    });

//    function createSprite() {
//        var sprite = SpriteManager.allocSprite(PlanetSprite);
//        sprite.x = 100;
//        sprite.y = 100;
//        sprite.startAnimation(GameEngine.animations.earthAnimation);
//        SpriteManager.addSprite(sprite);
//    }

    var BulletSprite = Sprite.extend({
        type: 'bullet',
        constructor: function() {
            this.base(TYPE_PBULLET);
            var bearing = this.bearing = player.sprite.bearing;
            var velocity = this.velocity = player.sprite.velocity + 4;
            this.x = player.sprite.x + 16 * Math.cos(bearing * Math.PI/180);
            this.y = player.sprite.y - 16 * Math.sin(bearing * Math.PI/180);
            this.vx = Math.cos(bearing * Math.PI/180) * velocity;
            this.vy = -Math.sin(bearing * Math.PI/180) * velocity;
            this.flags |= this.FLAG_MOVE | this.FLAG_CHECK;
            this.cmask = TYPE_PLANET;
        },
        draw: function(ctx, worldX, worldY) {
            var x = this.x - worldX - 1;
            var y = this.y - worldY - 1;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(x,y, 3, 3);
        }
    });

    var BulletProcess = Process.extend({
        type: 'bullet',
        constructor: function() {
            this.base(this.run);
            this.sprite = SpriteManager.allocSprite(BulletSprite);
            SpriteManager.addSprite(this.sprite);
            this.timeout = 30;
        },
        run: function() {
            // die if bullet is clipped
            var s = this.sprite,
                sx = s.x,
                sy = s.y,
                sw = 3,
                sh = 3,
                p = game.playfield,
                px = p.x,
                py = p.y,
                pw = game.CANVAS_WIDTH,
                ph = game.CANVAS_HEIGHT;

            if (s.ctype) {
                SpriteManager.freeSprite(this.sprite);
                this.suicide();
            }
            if (sx > (px + pw) || (sx + 3) < px || sy > (py + ph) || (sy + 3) < py) {
                SpriteManager.freeSprite(this.sprite);
                this.suicide();
            }
        }
    });

    var PlayerSprite = Sprite.extend({
        type: 'player',
        constructor: function() {
            this.base(TYPE_PLAYER);
            this.bearing = 0;
            this.velocity = 0;
            this.image = GameEngine.images.SHIP_PLAYER;
            this.x = game.CANVAS_WIDTH/2;
            this.y = game.CANVAS_HEIGHT/2;
            this.w = this.h = 32;
            this.anchor = this.ANCHOR_CENTER;
            this.flags |= this.FLAG_MOVE | this.FLAG_CHECK;
            this.cmask |= TYPE_PLANET;
        },
        draw: function(ctx, worldX, worldY) {
            var x = this.rect.x1 - worldX,
                y = this.rect.y1 - worldY;

            var ang = 90 - this.bearing,
                angle = parseInt((ang < 0 ? ang + 360 : ang) / 5, 10),
                row = parseInt(angle / 6, 10),
                col = parseInt(angle % 6, 10);

            ctx.drawImage(this.image, col*32,row*32, 32,32, x, y, 32, 32);
//            ctx.strokeStyle = '#f00';
//            ctx.strokeRect(x,y, this.w, this.h);
        },
        collide: function(other) {
            console.log('player collide with ' + other.__proto__.type);
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
            if (keyPressed(32)) { // spacebar == fire!
                ProcessManager.birth(BulletProcess);
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
