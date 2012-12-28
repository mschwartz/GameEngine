/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/26/12
 * Time: 11:09 AM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

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

    }
});

GameEngine.readyFuncs = [];
GameEngine.onReady = function(fn) {
    GameEngine.readyFuncs.push(fn);
};

window.addEventListener('load', function() {
    var readyFuncs = GameEngine.readyFuncs;
    for (var i= 0, len = readyFuncs.length; i<len; i++) {
        readyFuncs[i]();
    }
});
