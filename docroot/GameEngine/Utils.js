/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:59 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

function emptyFn() {}

function random(n) {
    return +n ? Math.floor(Math.random() * (n+1)) : Math.random();
}

Array.prototype.each = Object.prototype.each = Function.prototype.each = function(fun) {
	for (var key in this) {
		if (this.hasOwnProperty && this.hasOwnProperty(key)) {
			if (fun.call(this, this[key], key, this) === false) {
				return;
			}
		}
	}
};

// Object.prototype.extend = Function.prototype.extend = function() {
//     var me = this;
//     arguments.each(function(o) {
//         for (var key in o) {
//             var g = o.__lookupGetter__(key), s = o.__lookupSetter__(key);
//             if (g || s) {
//                 if (g) {
//                     me.__defineGetter__(key, g);
//                 }
//                 if (s) {
//                     me.__defineSetter__(key, s);
//                 }
//             }
//             else {
//                 me[key] = o[key];
//             }
//         }
//     });
//     return this;
// };
