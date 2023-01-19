
"use strict";

class Render {
    constructor(glyph, fg = 'white', bg = 'black') {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
    }
};

class Entity {
    constructor(point, viewer, render) {
        this.point = point;
        this.viewer = viewer;
        this.render = render;
    }
}

class Combat {
    constructor(maxHP, force, defense) {

    }
}

class Monster extends Entity {

    update() { };
}

module.exports = {
    Render,
    Entity,
    Monster
}
