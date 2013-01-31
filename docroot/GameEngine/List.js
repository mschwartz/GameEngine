/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 12/24/12
 * Time: 2:08 PM
 *
 * GameEngine (C)2012-2013 Michael Schwartz.  All rights reserved.
 *
 * Simple doubly linked list implementation.
 */

List = Base.extend({
    constructor: function() {
        this.type = 'keystone';
        this.next = this;
        this.prev = this;
    },
    addHead : function (node) {
        return this.append(node, this);
    },
    addTail : function (node) {
        return this.append(node, this.prev);
    },
    remHead : function () {
        return this.next === this ? false : this.remove(this.next);
    },
    remTail : function () {
        return this.prev === this ? false : this.remove(this.prev);
    },
    append  : function (node, after) {
        node.next = after.next;
        node.prev = after;
        after.next.prev = node;
        after.next = node;
        return node;
    },
    remove  : function (node) {
        node.next.prev = node.prev;
        node.prev.next = node.next;
        return node;
    },
    iterate    : function (fn) {
        for (var node = this.next; node !== this; ) {
            var next = node.next;
            fn(node);
            node = next;
        }
    },
    empty   : function () {
        return this.next === this;
    },
    dump: function() {
        for (var node = this.next; node !== this; node = node.next) {
            console.log(node.type);
            console.dir(node);
        }
    }
});
