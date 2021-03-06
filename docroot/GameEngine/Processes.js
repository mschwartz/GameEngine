/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:45 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

Process = Base.extend({
    type: 'free',
    constructor: function(fn, type) {
        this.fn = fn;
        this.sleepTimer = 1;
    },
    sleep: function(time, fn) {
        this.sleepTimer = time || 1;
        if (fn) {
            this.fn = fn;
        }
        throw 'SLEEP';
    },
    suicide: function() {
        throw 'SUICIDE';
    }
});

ProcessManager = (function() {
    var activeList = new List(),
        freeLists = [],
        current = activeList;

    return {
        birth: function(kind) {
            var type = kind.prototype.type;
            if (!freeLists[type]) {
                return activeList.append(new kind(), current);
            }
            var p = freeLists[type].remHead();
            if (!p) {
                return activeList.append(new kind(), current);
            }
            p.constructor(); // init();
            return activeList.append(p, current);
        },

        // remove all active processes except current and type==='SYSTEM'
        genocide: function() {
            activeList.each(function(p) {
                if (p === current || p.system) {
                    return;
                }
                if (p.destroy) {
                    p.destroy();
                }
                activeList.remove(p);
                p.type = 'free';
                freeList.add(p);
            });
        },

        run: function() {
            activeList.iterate(function(process) {
                current = process;
                try {
                    process.sleepTimer--;
                    if (process.sleepTimer <= 0) {
                        process.fn();
                        process.sleepTimer = 1;
                    }
                }
                catch (e) {
                    if (e === 'SUICIDE') {
                        var node = current,
                            type = node.type;
                        current = current.prev;
                        if (node.destroy) {
                            node.destroy();
                        }
                        activeList.remove(node);
                        freeLists[type] = freeLists[type] || new List();
                        freeLists[type].addTail(node);
                    }
                    else if (e !== 'SLEEP') {
                        throw e;
                    }
                }
            });
            current = activeList;
        },
        dump: function() {
            activeList.iterate(function(process) {
                console.dir(process);
            });
        }
    };
}());
