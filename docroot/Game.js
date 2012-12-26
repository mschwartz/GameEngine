var canvas = document.getElementById('playfield');
if (!canvas) {
    throw 'no canvas';
}
var ctx = canvas.getContext('2d'),
    CANVAS_WIDTH = canvas.width,
    CANVAS_HEIGHT = canvas.height;


//function random(n) {
//    return Math.floor(Math.random() * (n+1));
//}

function Playfield() {
    this.worldX = 0;
    this.worldY = 0;
    this.vx = 0;
    this.vy = 0;
    var planes = [],
        starsPerPlane = parseInt(CANVAS_WIDTH * CANVAS_HEIGHT / 1000, 10),
        planeColors = [ '#ffffff', '#bfbfbf', '#7f7f7f' ];

    for (var p=0; p<3; p++) {
        var plane = [];
        for (var s=0; s<starsPerPlane; s++) {
            plane.push({ x: random(CANVAS_WIDTH), y: random(CANVAS_HEIGHT) });
        }
        planes.push(plane);
    }
    this.draw = function(ctx) {
        this.worldX += this.vx;
        this.worldY += this.vy;
        for (var p=0; p<3; p++) {
            ctx.fillStyle = planeColors[p];
            var plane = planes[p];
            var wx = this.worldX >> (p+1),
                mx = (wx >= 0) ? CANVAS_WIDTH : -CANVAS_WIDTH,
                wy = this.worldY >> p,
                my = (wy >= 0) ? CANVAS_HEIGHT : -CANVAS_HEIGHT;

            // console.dir(wx + ' ' + wy);
            for (var s=0; s<starsPerPlane; s++) {
                var star = plane[s];
                var x = (star.x - wx) % CANVAS_WIDTH;
                if (x < 0) { x += CANVAS_WIDTH; }
                var y = (star.y - wy) % CANVAS_HEIGHT;
                if (y < 0) { y += CANVAS_HEIGHT; }

                ctx.fillRect(x, y, 1,1);
                // ctx.fillRect(Math.abs((star.x - wx) % CANVAS_WIDTH), Math.abs((star.y - wy) % CANVAS_HEIGHT), 1,1);
            }
        }
    };
}

//SpriteManager = {
//    sprites: [],
//    add: function(s) {
//        this.sprites.push(s);
//    },
//    run: function(ctx) {
//        for (var i=0, len=this.sprites.length; i<len; i++) {
//            var s = this.sprites[i];
//            s.animate();
//            s.move();
//            s.beforeDraw();
//            s.draw(ctx);
//            s.afterDraw();
//        }
//    }
//
//};
//
//function Sprite() {
//    this.x = 0;
//    this.y = 0;
//    this.vx = 0;
//    this.vy = 0;
//    this.image = null;
//    this.animStep = 0;
//    this.animRate = 1;
//    this.animTimer = 1;
//    this.animation = null;
//    this.beforeDraw = function() {};
//    this.afterDraw = function() {};
//    SpriteManager.add(this);
//}
//Sprite.prototype.move = function() {
//    this.x += this.vx;
//    this.y += this.vy;
//};
//Sprite.prototype.animate = function() {
//    if (this.animation) {
//        this.animTimer--;
//        if (this.animTimer <= 0) {
//            this.animStep++;
//            this.animStep %= this.animStepMax;
//            this.animTimer = this.animRate;
//        }
//        this.image = this.animation[this.animStep];
//    }
//};
//Sprite.prototype.draw = function(ctx) {
//    ctx.drawImage(this.image, this.x, this.y);
//};
//Sprite.prototype.setVelocity = function(vx, vy) {
//    if (vx !== undefined) {
//        this.vx = vx;
//    }
//    if (vy !== undefined) {
//        this.vy = vy;
//    }
//};
//Sprite.prototype.startAnimation = function(animation, rate) {
//    this.animTimer = rate !== undefined ? rate : 1;
//    console.log(' animTimer = ' + this.animTimer);
//    this.animation = animation;
//    this.animStep = 0;
//    this.animStepMax = animation.length - 1;
//};

(function() {

    var imagesToLoad = 0;
    function imageLoaded() {
        imagesToLoad--;
    }
    var earthAnimation = [];
    for (var i=1; i<=30; i++) {
        var img = new Image();
        earthAnimation.push(img);
        imagesToLoad++;
        img.onload = imageLoaded;
        img.src = 'img/earth/frame-'+i+'.gif';
    }

    // var yellowBall = null;

    // var yellowBall = {
    //     x: 0,
    //     y: 0,
    //     vx: 4,
    //     vy: 4.5,
    //     step: 0,
    //     maxStep: 30
    // };

    // Thanks to Paul Irish
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function( callback ) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();


    function createSprite() {
        function beforeDraw() {
            if (this.x > CANVAS_WIDTH-64) {
                this.x = CANVAS_WIDTH-64;
                this.vx = -this.vx;
            }
            else if (this.x < 0) {
                this.x = 0;
                this.vx = -this.vx;
            }
            if (this.y > CANVAS_HEIGHT-64) {
                this.y = CANVAS_HEIGHT-64;
                this.vy = -this.vy;
            }
            else if (this.y < 0) {
                this.y = 0;
                this.vy = -this.vy;
            }
        }
        var sprite = SpriteManager.allocSprite();
        sprite.x = 0;
        sprite.y = 0;
        sprite.setVelocity(4, 4.5);
        sprite.startAnimation(earthAnimation);
        sprite.beforeDraw = beforeDraw;
        SpriteManager.addSprite(sprite);
    }

    var playfield = new Playfield();

    var handle = setInterval(function() {
        if (imagesToLoad <= 0) {
            clearInterval(handle);
            createSprite();
            animLoop();
        }
    }, 1);

    // var img = new Image();
    var debug = document.getElementById('debug');
    console.dir(debug);
    function animLoop() {
        requestAnimFrame(animLoop);
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, CANVAS_WIDTH,CANVAS_HEIGHT);
        playfield.draw(ctx);
        SpriteManager.run(ctx);
        debug.innerHTML = playfield.worldX + ',' + playfield.worldY + ' ' + playfield.vx + ',' + playfield.vy;
    }

    document.onkeydown = function(e) {
        console.log(e.keyCode);
        switch (e.keyCode) {
            case 32:
                createSprite();
                break;
            case 38:
                playfield.vy -= 1;
                break;
            case 40:
                playfield.vy += 1;
                break;
            case 37:
                playfield.vx -= 1;
                break;
            case 39:
                playfield.vx += 1;
                break;
        }
    };
}());
