/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 1/28/13
 * Time: 9:27 AM
 * To change this template use File | Settings | File Templates.
 */

GameEngine.onReady(function() {
    var ALABEL = AnimatedSprite.prototype.ALABEL,
        ANULL = AnimatedSprite.prototype.ANULL,
        ASTEP00 = AnimatedSprite.prototype.ASTEP00,
        ASTEP = AnimatedSprite.prototype.ASTEP,
        ALOOP = AnimatedSprite.prototype.ALOOP,
        AEND = AnimatedSprite.prototype.AEND;

    console.log('here');
    ({
        SHIP_PLAYER: 'img/ship360_32.png'
    }).each(function(image, key) {
        GameEngine.images[key] = image;
    });
    for (var i=1; i<= 30; i++) {
        GameEngine.images['PLANET_EARTH_'+i] = 'img/earth/frame-' + i + '.gif';
    }

    var EARTH_SPEED = 4;

    GameEngine.animations.earthAnimation = [
        ALABEL,
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_1',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_2',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_3',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_4',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_5',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_6',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_7',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_8',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_9',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_10',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_11',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_12',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_13',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_14',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_15',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_16',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_17',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_18',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_19',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_20',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_21',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_22',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_23',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_24',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_25',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_26',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_27',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_28',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_29',
        ASTEP00, EARTH_SPEED, 'PLANET_EARTH_30',
        ALOOP
    ];

});