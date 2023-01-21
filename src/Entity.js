
"use strict";

const { Viewer } = require('./View');
const { DijkstraMap } = require('./DijkstraMap');
const {CombatEvent, CombatStatus} = require('./Combat');

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
        this.isDead = false;
        this.game = game;

        const grid = game.grid;
        !grid.blocked[pos] && (grid.blocked[pos] = []);
        grid.blocked[pos].push(this);
    }
    update(game) { };

    draw() {
        const game = this.game;
        const grid = game.grid;
        const context = game.context;
        const render = this.render;

        let [x, y] = grid.Point.to2D(this.point);
        context.render(x, y, render.glyph, render.fg, render.bg);
    }
}

class Moveable extends Entity {

    canOverlap(blocked) { return !blocked || blocked.length === 0; }

    tryMove(x, y) {
        const entity = this;
        const game = this.game;
        const grid = game.grid;

        let [ox, oy] = grid.Point.to2D(entity.point);
        let dest = grid.Point.from(x + ox, y + oy);
        if (grid.Point.is2DValid(x + ox, y + oy) && !game.isOpaque(dest)) {
            if (this.canOverlap(grid.blocked[dest])) {
                !grid.blocked[dest] && (grid.blocked[dest] = []);

                grid.blocked[entity.point] = grid.blocked[entity.point].filter(e => e !== this);
                grid.blocked[dest].push(this);
                entity.point = dest;
                entity.viewer.center = dest;
                entity.viewer.isDirty = true;
            }
        } else {
            entity.viewer.isDirty = false;
        }
    }
}

class Player extends Moveable {
    constructor(game, pos, range = 6) {
        super(game, pos, new Render('@', 'yellow', 'black'));
        this.viewer = new Viewer(range, pos, game.grid.Point, game.isOpaque.bind(game), 'circle');
        this.heatMap = new DijkstraMap(new Map(), game.rand, game.neighborhood.bind(game), game.moveCost.bind(game));
        this.initiative = 20;
        this.combatStatus = new CombatStatus();
    }

    canOverlap(blocked) {
        if(blocked){
            blocked.filter(e => e instanceof Monster)
                .forEach(e => e.damage.push(new CombatEvent(this, 8)));
        }
        return !blocked || blocked.length === 0;
    }

    update() {
        const game = this.game;
        const player = this;
        const grid = game.grid;

        this.damage.forEach(de => {
            this.combatStatus.hp -= de.force;
            game.printMessage(`You Suffer ${de.force} Points of Damage!`);
        });
        this.damage = [];
        if(this.combatStatus.hp <= 0){
            game.printMessage('You Died!');
            game.context.dispose();
            return;
        }

        if (player.viewer.isDirty) {
            game.hasFog && (grid.visible = []);
            player.viewer.calculate((pos, light) => {
                if (light > 0) {
                    game.hasFog && (grid.visible[pos] = pos);
                    grid.revealed[pos] = pos;
                }
            });
        }

        player.heatMap.sources = new Map([[player.point, 0]]);
        player.heatMap.calculate(grid.visible);
        //player.heatMap.makeFleeMap(-2);
    }

    draw() {
        super.draw();
        const player = this;
        const game = this.game;
        const grid = game.grid;
        const heatMap = this.heatMap;
        if (game.lit && false) {

            player.viewer.calculate((pos, light) => {
                if (light > 0) {
                    game.hasFog && (grid.visible[pos] = pos);
                    grid.revealed[pos] = pos;
                }
            });

            heatMap.sources = new Map([[player.point, 0]]);
            heatMap.calculate(grid.visible);
            heatMap.makeFleeMap(-1.2);
            heatMap.makeRangeMap(-1.2, 4);

            const context = game.context;
            heatMap.rangeMap.dist.forEach((val, p) => {
                //val = Math.abs(val);
                if (val < 9) {
                    let str = val.toFixed(0);
                    let [x, y] = grid.Point.to2D(p);
                    context.render(x, y, str);
                } else {
                    let [x, y] = grid.Point.to2D(p);
                    context.render(x, y, '.', 'red');
                }
            });
        }

    }
}

class Monster extends Moveable {
    constructor(game, pos, range, name) {
        super(game, pos, new Render(name[0], 'red', 'black'));
        let neighborhood = (p) => game.neighborhood(p).filter(p => !game.grid.blocked[p] || game.grid.blocked[p].length === 0);

        this.name = name;
        this.viewer = new Viewer(range, pos, game.grid.Point, game.isOpaque.bind(game));
        this.revealed = [];
        this.heatMap = new DijkstraMap(new Map(), game.rand, neighborhood, game.moveCost.bind(game));
        this.initiative = 20;
        this.combatStatus = new CombatStatus();
    }

    update() {
        const game = this.game;
        const grid = game.grid;
        const player = game.player;
        const viewer = this.viewer;
        const heatMap = this.heatMap;

        this.damage.forEach(de => {
            this.combatStatus.hp -= de.force
            game.printMessage(`The ${this.name} Suffers ${de.force} Points of Damage! `);
        });
        this.damage = [];
        if(this.combatStatus.hp <= 0){
            game.printMessage(`The ${this.name} Dies!`);
            this.isDead = true;
            return;
        }

        if (viewer.isDirty) {
            viewer.calculate(pos => this.revealed[pos] = pos);
            viewer.isDirty = false;
        }
        if (viewer.lightMap.get(player.point) > 0) {
            heatMap.sources = new Map([[player.point, 0]]);
            heatMap.calculate(this.revealed);
            heatMap.makeRangeMap(-1.2, viewer.radius);
            heatMap.makeFleeMap(-1.2);

            let moveIndex = heatMap.fleeMap.chase(this.point);
            if (this.inContact().includes(player)) {
                player.damage.push(new CombatEvent(this, 5));
                game.printMessage(`The ${this.name} Attacks!`);
            } else {
                let [dx, dy] = grid.Point.to2D(moveIndex);
                let [x, y] = grid.Point.to2D(this.point);
                this.tryMove(dx - x, dy - y);
                game.rand.nextDouble() < 0.3 && game.printMessage(`${this.name} shouts a insult!`);
            }
        }
    }

    inContact() {
        const game = this.game;
        const grid = game.grid;
        let entities = [];
        game.neighborhood(this.point).forEach(n => grid.blocked[n] && entities.push(...grid.blocked[n]));
        return entities;
    }

    draw() {
        const game = this.game;
        const grid = game.grid;

        if (grid.visible[this.point] || !game.hasFog) {
            super.draw(game);
        }

        if (game.lit && this.heatMap.rangeMap) {
            const viewer = this.viewer;
            const heatMap = this.heatMap;
            const player = game.player;

            viewer.calculate(pos => this.revealed[pos] = pos);
            heatMap.sources = new Map([[player.point, 0]]);
            heatMap.calculate(this.revealed);
            heatMap.makeRangeMap(-1.2, viewer.radius);
            heatMap.makeFleeMap(-1.2);

            this.heatMap.fleeMap.dist.forEach((val, p) => {
                val = Math.abs(val);
                if (val < 9) {
                    let str = val.toFixed(0);
                    let [x, y] = grid.Point.to2D(p);
                    game.context.render(x, y, str);
                } else {
                    let [x, y] = grid.Point.to2D(p);
                    game.context.render(x, y, '.', 'red');
                }
            });
        }
    }
}

module.exports = {
    Render,
    Entity,
    Monster,
    Player
}
