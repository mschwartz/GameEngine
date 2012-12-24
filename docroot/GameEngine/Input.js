/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:16 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

var bKeys = [], // true current key state
    cKeys = [], // "current" key state - may be set by journal playback
    dKeys = []; // debounced key states

document.onkeydown = function(e) {
    bKeys[e.keyCode] = 1;
};
document.onkeyup = function(e) {
    bKeys[e.keyCode] = 0;
};
