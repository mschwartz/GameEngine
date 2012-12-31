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
                e.preventDefault();
                var code = e.keyCode;
                if (!cKeys[code]) { // only on initial key down event
                    dKeys[code] = 1;
                }
                bKeys[code] = 1;
                cKeys[code] = 1;
            };
            document.onkeyup = function(e) {
                e.preventDefault();
                var code = e.keyCode;
                bKeys[code] = 0;
                cKeys[code] = 0;
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
