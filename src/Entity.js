
"use strict";

const { Viewer } = require('./View');
const { DijkstraMap } = require('./DijkstraMap');

class Render {
    constructor(glyph, fg = 'white', bg = 'black') {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
    }
};

class Entity {
    constructor(game, pos, render) {
        this.point = pos;
        this.render = render;
        this.damage = [];
        this.messages = [];
        this.collision = [];
    }
    update(game) { };

    draw(game) {
        const grid = game.grid;
        const context = game.context;
        const render = this.render;
        let [x, y] = grid.Point.to2D(this.point);
        context.render(x, y, render.glyph, render.fg, render.bg);
    }
}

class Attack {
    constructor() {

    }
}

class Combat {
    constructor(maxHP, force, defense) {

    }
}

class Monster extends Entity {

    constructor(game, pos, range) {
        super(game, pos, new Render('M', 'red', 'black'));
        this.viewer = new Viewer(range, pos, game.grid.Point, game.isOpaque.bind(game));
        this.revealed = [];
        this.heatMap = new DijkstraMap(new Map(), game.neighborhood.bind(game), game.moveCost.bind(game));
    }

    update(game) {
        const grid = game.grid;
        const player = game.player;
        if (this.viewer.isDirty) {
            this.viewer.calculate(pos => this.revealed[pos] = pos);
            this.viewer.isDirty = false;
        }
        if (this.viewer.lightMap.get(player.point) > 0) {
            this.heatMap.sources = new Map([[player.point, 0]]);
            this.heatMap.calculate(this.revealed);
            this.heatMap.makeRangeMap(-1.2, this.viewer.radius);
            this.heatMap.makeFleeMap(-1.2);

            let moveIndex = this.heatMap.rangeMap.chase(this.point);
            if (game.grid.Point.neighborhood(player.point).includes(this.point)) {
                game.message = 'The Monster Attacks!!!';
            } else {
                let [dx, dy] = grid.Point.to2D(moveIndex);
                let [x, y] = grid.Point.to2D(this.point);
                game.tryMove(this, dx - x, dy - y);
                game.message = 'Monster shouts a insult!';
            }
        }
    }

    draw(game) {
        const grid = game.grid;
        if (grid.visible[this.point] || !game.hasFog) {
            super.draw(game);

            /*if (this.viewer.lightMap.get(game.player.point) > 0) {
                this.heatMap.fleeMap.dist.forEach((val, p) => {
                    val = -val;
                    if (val < 10) {
                        let str = val.toFixed(0);
                        let [x, y] = grid.Point.to2D(p);
                        game.context.render(x, y, str);
                    } else {
                        let [x, y] = grid.Point.to2D(p);
                        game.context.render(x, y, '.', 'red');
                    }
                });
            }*/
        }
    }
}


class Player extends Entity {

    constructor(game, pos, range = 6) {
        super(game, pos, new Render('@', 'yellow', 'black'));
        this.viewer = new Viewer(range, pos, game.grid.Point, game.isOpaque.bind(game), 'circle');
        this.heatMap = new DijkstraMap(new Map(), game.neighborhood.bind(game), game.moveCost.bind(game));
    }

    update(game) {
        const player = this;
        const grid = game.grid;
        if (player.viewer.isDirty) {
            game.hasFog && (grid.visible = []);
            player.viewer.calculate((pos, light) => {
                if (light > 0) {
                    game.hasFog && (grid.visible[pos] = pos);
                    grid.revealed[pos] = pos;
                }
            });
        }

        let awakeArea = [];
        let [x, y] = grid.Point.to2D(player.point);
        grid.area(x, y, (pos) => !game.isOpaque(pos) && awakeArea.push(pos));

        player.heatMap.sources = new Map([[player.point, 0]]);
        player.heatMap.calculate(awakeArea);
        //player.heatMap.calculate(grid.visible);
        player.heatMap.makeFleeMap(-2);
    }

}


module.exports = {
    Render,
    Entity,
    Monster,
    Player
}
