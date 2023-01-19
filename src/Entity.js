
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
    constructor(point, viewer, render) {
        this.point = point;
        this.viewer = viewer;
        this.render = render;
    }
    update(game) { };
}

class Attack {
    constructor(){
        
    }
}

class Combat {
    constructor(maxHP, force, defense) {

    }
}

class Monster extends Entity {

    constructor(pos, range, Point, isOpaque){
        super(pos, new Viewer(range, pos, Point, isOpaque), new Render('M', 'red', 'black'));
    }

    update(game){
        const grid = game.grid;
        const player = game.player;
        if (this.viewer.isDirty) {
            this.viewer.calculate();
            this.viewer.isDirty = false;
        }
        if (this.viewer.lightMap.get(player.point) > 0) {
            let moveIndex = player.heatMap.flee(this.point);
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
}


class Player extends Entity {

    constructor(pos, range, Point, isOpaque, neighborhood, cost){
        super(
            pos,
            new Viewer(range, pos, Point, isOpaque, 'circle'),
            new Render('@', 'yellow', 'black')
        );
        this.heatMap = new DijkstraMap(new Map(), neighborhood, cost);
    }
    
    update(game){
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
        player.heatMap.makeFleeMap(-1.2);
    }

}


module.exports = {
    Render,
    Entity,
    Monster,
    Player
}
