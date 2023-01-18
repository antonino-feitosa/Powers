
"use strict";

const Render = {
    with(glyph, fg = 'white', bg = 'black') {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
        return this;
    }
};

const Entity = {
    with(point, viewer, render) {
        this.point = point;
        this.viewer = viewer;
        this.render = render;
        return this;
    }
}

const Monster = Object.create(Entity);
Monster.update = function () { };

module.exports = {
    Render,
    Entity,
    Monster
}
