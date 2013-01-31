/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:30 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

(function() {
    var ALABEL = 1,
        ANULL = 2,
        ASTEP00 = 3,
        ASTEP = 4,
        ALOOP = 5,
        AEND = 6;

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
                if (!s) {
                    return new kind();
                }
                s.constructor(); // init();
                return s;
            },
            freeSprite  : function (s) {
                var type = s.__proto__.type;
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
        draw           : function (ctx, worldX, worldY) {
            var image = this.image;
            if (!image) {
                return;
            }
            var x = this.x - worldX,
                y = this.y - worldY,
                vw = game.CANVAS_WIDTH,
                vh = game.CANVAS_HEIGHT;

            if (x > vw || (x+image.width) < 0) {
                return;
            }
            if (y > vh || (y+image.height) < 0) {
                return;
            }
            ctx.drawImage(image, x, y);
        },
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

        /** @constant */ ALABEL: ALABEL,
        /** @constant */ ANULL: ANULL,
        /** @constant */ ASTEP00: ASTEP,
        /** @constant */ ASTEP: ASTEP,
        /** @constant */ ALOOP: ALOOP,
        /** @constant */ AEND: AEND,

        constructor: function() {
            this.base();
            this.animLabel = 0;
            this.animStep = 0;
            this.animTimer = 1;
            this.animation = null;
            this.animationLength = 0;
        },
        animate: function() {
            var animation = this.animation,
                step = this.animStep;

            if (animation) {
                if (--this.animTimer <= 0) {
                    animation = this.animation;
                    while (true) {
                        switch (animation[this.animStep]) {
                            case ALABEL:
                                this.animLabel = this.animStep;
                                break;
                            case ANULL:
                                this.animTimer = animation[++this.animStep];
                                this.image = null;
                                break;
                            case ASTEP00:
                                this.animTimer = animation[++this.animStep];
                                this.image = GameEngine.images[animation[++this.animStep]];
                                break;
                            case ASTEP:
                                this.animTimer = animation[++this.animStep];
                                this.image = GameEngine.images[animation[++this.animStep]];
                                this.x += animation[++this.animStep];
                                this.y += animation[++this.animStep];
                                break;
                            case ALOOP:
                                this.animStep = this.animLabel;
                                continue;
                            case AEND:
                            case undefined:
                                this.animation = null;
                                this.image = null;
                                return;
                        }
                        this.animStep++;
                        break;
                    }
                }
            }
        },
        startAnimation : function (animation) {
            this.animation = animation;
            this.animationLength = animation.length;
            this.animLabel = 0;
            this.animStep = 0;
            this.animTimer = 1;
            this.image = null;
        }
    });

}());
