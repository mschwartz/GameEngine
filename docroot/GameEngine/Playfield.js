/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:16 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

Playfield = Base.extend({
    x: 0,
    y: 0,
    constructor: function() {
        console.log('Playfield constructor');
    },
    draw: function() {
        throw 'No Playfield.draw defined';
    }
});
