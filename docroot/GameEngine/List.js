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

List = function () {
    this.next = this;
    this.prev = this;
};
List.prototype.extend({
    addHead : function (o) {
        this.append(o, this);
    },
    addTail : function (o) {
        this.append(o, this.prev);
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
    },
    remove  : function (node) {
        node.next.prev = node.prev;
        node.prev.next = node.next;
        return node;
    },
    each    : function (fn) {
        for (var node = this.next; node !== this; node = node.next) {
            fn(node);
        }
    },
    empty   : function () {
        return this.next === this;
    }
});
