/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 2/24/13
 * Time: 11:12 AM
 */

Point = Base.extend({
    x: 0,
    y: 0,

    constructor: function() {
        this.set(arguments);
    },

    // p.set(x,y)
    // p.set(Point)
    // p.set({ x: xxx, y: yyy })
    set: function() {
        if (!arguments.length) {
            this.x = this.y = 0;
        }
        else if (arguments.length === 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        }
        else {
            var o = arguments[0];
            this.x = o.x;
            this.y = o.y;
        }
    },

    offset: function(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
});

Rect = Base.extend({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,

    constructor : function() {
        this.set(arguments);
    },

    // set()
    // set(Rect)
    // set(Point, Point)
    // set({ x,y }, {x,y})
    // set(x1,y1, x2,y2)
    set: function() {
        switch (arguments.length) {
            case 1:
                // this.set(Rect)
                this.x1 = arguments[0].x1;
                this.y1 = arguments[0].y1;
                this.x2 = arguments[0].x1;
                this.y2 = arguments[0].y1;
                break;
            case 2:
                // this.set(Point, Point) or
                // this.set({ x,y }, {x,y})
                this.x1 = arguments[0].x;
                this.y1 = arguments[0].y;
                this.x2 = arguments[1].x;
                this.y2 = arguments[1].y;
                break;
            case 4:
                // this.set(x1,y1, x2,y2)
                this.x1 = arguments[0];
                this.y1 = arguments[1];
                this.x2 = arguments[2];
                this.y2 = arguments[3];
                break;
            default:
                this.x1 = this.y1 = 0;
                this.x2 = this.y2 = 0;
                break;
        }
    },

    width: function() {
        return (this.x2 - this.x1) + 1;
    },
    height: function() {
        return (this.y2 - this.y1) + 1;
    },

    midX: function() {
        return (this.x1 + this.x2 + 1) / 2;
    },
    midY: function() {
        return (this.y1 + this.y2 + 1) / 2;
    },

    overlaps: function(otherRect) {
        if (this.x1 > otherRect.x2) {
            return false;
        }
        if (this.x2 < otherRect.x1) {
            return false;
        }
        if (this.y1 > otherRect.y2) {
            return false;
        }
        if (this.y2 < otherRect.y1) {
            return false;
        }
        return true;
    },

    dump: function() {
        console.dir(this.x1 + ',' + this.y1 + ' => ' + this.x2 + ',' + this.y2);
    }
});
