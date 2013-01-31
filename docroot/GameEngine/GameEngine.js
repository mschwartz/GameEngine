/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/26/12
 * Time: 11:09 AM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

function hideAddressBar() {
    setTimeout( function() {
        window.scrollTo(0, 1);
    }, 0 );
}

var GameEngine = Base.extend({

    // takes element ID of the DOM canvas element
    constructor : function (canvasId) {
        var me = this,
            canvas = document.getElementById('playfield');

        if (!canvas) {
            throw 'no canvas';
        }

        me.canvasId = canvasId;
        me.ctx = canvas.getContext('2d');
        me.CANVAS_WIDTH = canvas.width;
        me.CANVAS_HEIGHT = canvas.height;

        me.playfield = null;

        canvas.addEventListener('click', function() {
            console.log('click canvas');
//            me.resize();
        });

        window.addEventListener('resize', function(e) {
            hideAddressBar();
            console.log('resize to ' + window.innerWidth + 'x' + window.innerHeight);
            // uncomment the next two lines to have the canvas fill the browser
//            canvas.width = window.innerWidth;
//            canvas.height = window.innerHeight;
            me.CANVAS_WIDTH = canvas.width;
            me.CANVAS_HEIGHT = canvas.height;
            if (me.playfield && me.playfield.resize) {
                me.playfield.resize();
            }
        });

        window.addEventListener('orientationchange', function() {
            console.log('orientationchange');
            hideAddressBar();
            me.resize();
        });

        // Thanks to Paul Irish
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        window.requestAnimFrame = (function () {
            return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        function gameLoop() {
            requestAnimFrame(gameLoop);
            var x = 0,
                y = 0,
                playfield = me.playfield;

            if (playfield) {
                x = playfield.x;
                y = playfield.y;
                playfield.draw(me.ctx);
            }

            ProcessManager.run();
            SpriteManager.run(me.ctx, x, y);
        }
        gameLoop();
    },
    resize: function() {
        setTimeout(function() {
            console.log('resize!');
            var evt = document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false,window,0);
            window.dispatchEvent(evt);
        }, 10);
    }
});

GameEngine.readyFuncs = [];
GameEngine.onReady = function(fn) {
    GameEngine.readyFuncs.push(fn);
};
GameEngine.images = {};
GameEngine.animations = {};

window.addEventListener('load', function() {
    document.body.style.height = screen.height + 'px';
//    if (!window.pageYOffset) {
//        hideAddressBar();
//    }
    var readyFuncs = GameEngine.readyFuncs;
    for (var i= 0, len = readyFuncs.length; i<len; i++) {
        readyFuncs[i]();
    }
});

