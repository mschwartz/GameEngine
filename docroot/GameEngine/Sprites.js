/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:30 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

SpriteManager = (function () {
    var activeList = new List(),
        freeLists = [];

    return {
        allocSprite : function (kind) {
            var type = kind.prototype.type;
            if (!freeLists[type]) {
                return new kind();
            }
            var s = freeLists[type].remHead();
            s.constructor(); // init();
            return s;
        },
        freeSprite  : function (s) {
            var type = kind.prototype.type;
            activeList.remove(s);
            freeLists[type] = freeLists[type] || new List();
            freeLists[type].addTail(s);
        },
        addSprite: function(s) {
            activeList.addTail(s);
        },
        run         : function (ctx, worldX, worldY) {
            activeList.iterate(function (s) {
                s.animate();
                s.move();
                s.draw(ctx, worldX, worldY);
            });
        }
    };
}());

Sprite = Base.extend({
    type: 'basic',
    constructor: function() {
        console.log('Sprite constructor');
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.image = null;
    },
    move           : function () {
        this.x += this.vx;
        this.y += this.vy;
    },
    animate        : function () {},
    beforeDraw: function() {},
    draw           : function (ctx, worldX, worldY) {
        if (!this.image) {
            return;
        }
        var x = this.x - worldX,
            y = this.y - worldY,
            vw = game.CANVAS_WIDTH,
            vh = game.CANVAS_HEIGHT;

        if (x > vw || (x+this.image.width) < 0) {
            return;
        }
        if (y > vh || (y+this.image.height) < 0) {
            return;
        }
        this.beforeDraw();
        ctx.drawImage(this.image, this.x-worldX, this.y-worldY);
        this.afterDraw();
    },
    afterDraw: function() {},
    setVelocity    : function (vx, vy) {
        if (vx !== undefined) {
            this.vx = vx;
        }
        if (vy !== undefined) {
            this.vy = vy;
        }
    }
});

AnimatedSprite = Sprite.extend({
    type: 'animated',
    constructor: function() {
        console.log('AnimatedSprite constructor');
        this.base();
        this.animStep = 0;
        this.animRate = 1;
        this.animTimer = 1;
        this.animation = null;
        this.beforeDraw = emptyFn;
        this.afterDraw = emptyFn;
    },
    animate: function() {
        if (this.animation) {
            this.animTimer--;
            if (this.animTimer <= 0) {
                this.animStep++;
                this.animStep %= this.animStepMax;
                this.animTimer = this.animRate;
            }
            this.image = this.animation[this.animStep];
        }
    },
    startAnimation : function (animation, rate) {
        this.animTimer = rate !== undefined ? rate : 1;
        console.log(' animTimer = ' + this.animTimer);
        this.animation = animation;
        this.animStep = 0;
        this.animStepMax = animation.length - 1;
    }
});
