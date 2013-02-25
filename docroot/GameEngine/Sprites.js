/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:30 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

(function () {
    // sprite types
    var TYPE_DEFAULT = 0,
        TYPE_PLAYER = (1<<0),
        TYPE_PBULLET = (1<<1),
        TYPE_ENEMY = (1<<2),
        TYPE_EBULLET = (1<<3),
        TYPE_USER_BIT = 4;  // additional user types can be defined as (1<<TYPE_USER_BIT), etc.

    // flags bits
    var FLAG_CLIPPED = (1 << 0),
        FLAG_MOVE = (1 << 1),
        FLAG_ANIMATE = (1 << 2),
        FLAG_DRAW = (1 << 3),
        FLAG_CHECK = (1 << 4);

    // anchor types
    var ANCHOR_NONE = 0, // x,y is upper left corner of sprite
        ANCHOR_CENTER = 1, // x,y is center of sprite
        ANCHOR_BOTTOM = 2; // y is bottom and x is center of sprite

    // Animation Interpreter op codes
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
            addSprite   : function (s) {
                activeList.addTail(s);
            },
            run         : function (ctx, worldX, worldY) {
                var s = activeList.first(),
                    s2;
                while (s && s != activeList) {
                    var n = s.next;
                    s.move();
                    s.animate();
                    s.getRect(s.rect);
                    for (s2 = activeList.first(); s2 != s && s2 != activeList; s2 = s2.next) {
                        if (s.cmask & s2.type && s2.cmask & s.type) {
                            if (s.rect.overlaps(s2.rect)) {
                                s.collide(s2);
                                s2.collide(s);
                            }
                        }
                    }
                    s.draw(ctx, worldX, worldY);
                    s = n;
                }
            }
        };
    }());

    Sprite = Base.extend({
        type        : 'basic',

        /** @constant */ TYPE_DEFAULT: TYPE_DEFAULT,
        /** @constant */ TYPE_PLAYER: TYPE_PLAYER,
        /** @constant */ TYPE_PBULLET: TYPE_PBULLET,
        /** @constant */ TYPE_ENEMY: TYPE_ENEMY,
        /** @constant */ TYPE_EBULLET: TYPE_EBULLET,

        /** @constant */ FLAG_CLIPPED: FLAG_CLIPPED,
        /** @constant */ FLAG_MOVE: FLAG_MOVE,
        /** @constant */ FLAG_ANIMATE: FLAG_ANIMATE,
        /** @constant */ FLAG_DRAW: FLAG_DRAW,
        /** @constant */ FLAG_CHECK: FLAG_CHECK,

        /** @constant */ ANCHOR_NONE: ANCHOR_NONE,
        /** @constant */ ANCHOR_CENTER: ANCHOR_CENTER,
        /** @constant */ ANCHOR_BOTTOM: ANCHOR_BOTTOM,

        constructor : function (type) {
            this.rect = this.rect || new Rect();
            this.type = type;
            this.ctype = 0;
            this.cmask = 0;
            this.anchor = ANCHOR_NONE;
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.image = null;
            this.w = 0;
            this.h = 0;
            this.flags |= FLAG_DRAW;
            this.rect.set();
        },
        isClipped: function() {
            return this.flags & FLAG_CLIPPED;
        },

        // get collision rectangle
        getRect: function(rect) {
            rect.x1 = this.x;
            rect.y1 = this.y;
            switch(this.anchor) {
                case ANCHOR_NONE:
                    break;
                case ANCHOR_CENTER:
                    rect.x1 -= this.w/2;
                    rect.y1 -= this.h/2;
                    break;
                case ANCHOR_BOTTOM:
                    rect.x1 -= this.w/2;
                    rect.y1 -= this.h;
                    break;
            }
            rect.x2 = rect.x1 + this.w - 1;
            rect.y2 = rect.y1 + this.h - 1;
        },

        move        : function () {
            if (this.flags & FLAG_MOVE) {
                this.x += this.vx;
                this.y += this.vy;
            }
        },
        animate     : function () {
        },
        collide: function(otherSprite) {
            this.ctype |= otherSprite.type;
        },
        draw        : function (ctx, worldX, worldY) {
            if (this.flags & FLAG_DRAW) {
                var image = this.image;
                if (!image) {
                    return;
                }
                var x = this.rect.x1 - worldX,
                    y = this.rect.y1 - worldY,
                    vw = game.CANVAS_WIDTH,
                    vh = game.CANVAS_HEIGHT;

                if (x > vw || (x + image.width) < 0) {
                    this.flags |= FLAG_CLIPPED;
                    return;
                }
                if (y > vh || (y + image.height) < 0) {
                    this.flags |= FLAG_CLIPPED;
                    return;
                }
                this.flags &= ~FLAG_CLIPPED;
                ctx.drawImage(image, x, y);
//                ctx.strokeStyle = '#f00';
//                ctx.strokeRect(x,y, this.w, this.h);
            }
        },
        setVelocity : function (vx, vy) {
            if (vx !== undefined) {
                this.vx = vx;
            }
            if (vy !== undefined) {
                this.vy = vy;
            }
        },
        dump: function() {
            this.getRect(this.rect);
            console.dir(this);
            console.log(this.x + ',' + this.y + ' ' + this.w + 'x' + this.h);
            this.rect.dump();
        }
    });

    AnimatedSprite = Sprite.extend({
        type : 'animated',

        /** @constant */ ALABEL  : ALABEL,
        /** @constant */ ANULL   : ANULL,
        /** @constant */ ASTEP00 : ASTEP00,
        /** @constant */ ASTEP   : ASTEP,
        /** @constant */ ALOOP   : ALOOP,
        /** @constant */ AEND    : AEND,

        constructor    : function (type) {
            this.base(type);
            this.animLabel = 0;
            this.animStep = 0;
            this.animTimer = 1;
            this.animation = null;
            this.animationLength = 0;
        },
        animate        : function () {
            var animation = this.animation,
                step = this.animStep;

            if ((this.flags & FLAG_ANIMATE) && animation) {
                if (--this.animTimer <= 0) {
                    animation = this.animation;
                    while (true) {
                        switch (animation[this.animStep]) {
                            case ALABEL:
                                this.animLabel = this.animStep;
                                this.animStep++;
                                continue;
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
            this.flags |= FLAG_ANIMATE;
            this.animation = animation;
            this.animationLength = animation.length;
            this.animLabel = 0;
            this.animStep = 0;
            this.animTimer = 1;
            this.image = null;
        }
    });

}());
