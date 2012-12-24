/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:45 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz. All rights reserved.
 */

function Process() {}
Process.extend({
    init: function() {
        this.fn = fn;
        this.type = type;
    }
});

ProcessManager = (function() {
    var activeList = new List(),
        freeList = new List(),
        current;

    return {
        emptyFn: function() {},
        birth: function(fn, type) {
            var p = freeList.remHead() || new Process();
            p.init(fn, type);
            activeList.append(p, current);
        },
        suicide: function() {
            throw 'SUICIDE';
        },

        // remove all active processes except current and type==='SYSTEM'
        genocide: function() {
            activeList.each(function(p) {
                if (p === current || p.type === 'system') {
                    return;
                }
                activeList.remove(p);
                p.type = 'free';
                freeList.add(p);
            });
        },

        run: function() {
            activeList.each(function(process) {
                if (process.type === 'free') {
                    return;
                }
                current = process;
                try {
                    process.run();
                }
                catch (e) {
                    if (e === 'SUICIDE') {
                        activeList.remove(current);
                        current.type = 'free';
                        freeList.addTail(current);
                    }
                    else {
                        throw e;
                    }
                }
            });
        }
    }
}());