/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:16 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

Input = (function() {
    var bKeys = [], // true current key state
        cKeys = [], // "current" key state - may be set by journal playback
        dKeys = []; // debounced key states

    return {
        init: function() {
            document.onkeydown = function(e) {
                bKeys[e.keyCode] = 1;
                cKeys[e.keyCode] = 1;
                dKeys[e.keyCode] = 1;
            };
            document.onkeyup = function(e) {
                bKeys[e.keyCode] = 0;
                cKeys[e.keyCode] = 0;
            };
        },
        keyDown: function(key) {
            return cKeys[key];
        },
        keyPressed: function(key, retain) {
            var pressed = dKeys[key];
            if (!retain) {
                dKeys[key] = 0;
            }
            return pressed;
        }
    };

}());

GameEngine.onReady(function() {
    Input.init();
});
