/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:30 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

function Sprite() {
}
Sprite.prototype.extend({
    init           : function () {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.image = null;
        this.animStep = 0;
        this.animRate = 1;
        this.animTimer = 1;
        this.animation = null;
        this.beforeDraw = emptyFn;
        this.afterDraw = emptyFn;
    },
    move           : function () {
        this.x += this.vx;
        this.y += this.vy;
    },
    animate        : function () {
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
    draw           : function (ctx) {
        ctx.drawImage(this.image, this.x, this.y);
    },
    setVelocity    : function (vx, vy) {
        if (vx !== undefined) {
            this.vx = vx;
        }
        if (vy !== undefined) {
            this.vy = vy;
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

SpriteManager = (function () {
    var activeList = new List(),
        freeList = new List();

    return {
        allocSprite : function () {
            var s = freeList.remHead() || new Sprite();
            s.init();
            return s;
        },
        freeSprite  : function (s) {
            activeList.remove(s);
            freeList.addTail(s);
        },
        addSprite: function(s) {
            activeList.addTail(s);
        },
        run         : function () {
            activeList.each(function (s) {
                s.animate();
                s.move();
                s.beforeDraw();
                s.draw(ctx);
                s.afterDraw();
            });
        }
    }
}());
