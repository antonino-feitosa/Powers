
"use strict";

const { Context } = require('./Context');
const { Monster, Player } = require('./Entity');
const { Grid, Tile } = require('./Grid');
const { Random } = require('./Random');

class Game {

    constructor(width, height, seed = 1, hasFog = true) {
        this.width = width;
        this.height = height;
        this.rand = new Random(seed);
        this.hasFog = hasFog;
        this.clearBuffer = true;
        this.monsters = [];
        this.message = '';
        this.start();
    }

    isOpaque(p) { return this.grid.tiles[p] === Tile.Wall }
    moveCost(u, v) {
        let [x1, y1] = this.grid.Point.to2D(u);
        let [x2, y2] = this.grid.Point.to2D(v);
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }
    neighborhood(p) {
        let ne = this.grid.Point.neighborhood(p);
        ne = ne.filter(n => !this.isOpaque(n));
        return ne;
    }

    start() {
        //let grid = Grid.fromBernoulli(30, 20, rand);
        this.grid = Grid.fromRandom(this.width, this.height, this.rand, 100);
        //let grid = Grid.fromEmpty(20, 20);

        !this.hasFog && (this.grid.visible = [... this.tiles.keys()]);

        let startRoom = this.rand.pick(this.grid.rooms);
        let startPosition = startRoom.center();
        let startIndex = this.grid.Point.from(startPosition[0], startPosition[1]);
        this.grid.blocked[startIndex] = startIndex;

        const player = this.player = new Player(this, startIndex, 8);
        //, this.grid.Point, this.isOpaque.bind(this), this.neighborhood.bind(this), this.moveCost.bind(this));

        this.addMonsters(startRoom);

        this.context = new Context(this.width, this.height + 1);
        this.context.clearBuffer = this.clearBuffer;
        this.context.start();
        this.context.listenInput((unicode, name) => {
            let key = name ? name : unicode;
            switch (key) {
                case 'h': this.tryMove(player, -1, 0); break;
                case 'k': this.tryMove(player, 0, -1); break;
                case 'j': this.tryMove(player, 0, +1); break;
                case 'l': this.tryMove(player, +1, 0); break;
                case 'y': this.tryMove(player, -1, -1); break;
                case 'u': this.tryMove(player, 1, -1); break;
                case 'b': this.tryMove(player, -1, 1); break;
                case 'n': this.tryMove(player, 1, 1); break;
                default: return;
            }
            this.loop();
        });
    }

    addMonsters(startRoom) {
        const grid = this.grid;
        grid.rooms.filter(r => r !== startRoom).forEach(room => {
            let [rx, ry] = room.center();
            let pos = this.grid.Point.from(rx, ry);
            grid.blocked[pos] = pos;
            let monster = new Monster(this, pos, 5);
            this.monsters.push(monster);
        });
    }

    loop() {
        this.player.update(this);
        this.monsters.forEach(m => m.update(this));
        this.draw();
    }

    draw() {
        const grid = this.grid;
        const player = this.player;
        const context = this.context;

        context.clear();
        context.render(0, grid.height, this.message, 'white', 'black');
        this.message = '';

        this.drawGrid(grid, context);
        this.monsters.forEach(m => m.draw(this));
        player.draw(this);

        /*this.player.heatMap.fleeMap.dist.forEach((val, p) => {
            val = -val;
            if(val < 10){
                let str = val.toFixed(0);
                let [x, y] = this.grid.Point.to2D(p);
                this.context.render(x, y, str);
            } else {
                let [x, y] = this.grid.Point.to2D(p);
                this.context.render(x, y, '.','red');
            }
        });*/

        context.build();
    }

    drawGrid() {
        if (this.hasFog) {
            this.grid.revealed.forEach((index) => {
                let [x, y] = this.grid.Point.to2D(index);
                let glyph = this.grid.tiles[index];
                this.context.render(x, y, glyph, 'grey', 'black');
            });

            this.grid.visible.forEach((index) => {
                let [x, y] = this.grid.Point.to2D(index);
                let glyph = this.grid.tiles[index];
                this.context.render(x, y, glyph, 'white', 'black');
            });
        }
    }

    tryMove(entity, x, y) {
        const grid = this.grid;
        let [ox, oy] = grid.Point.to2D(entity.point);
        let dest = grid.Point.from(x + ox, y + oy);
        if (grid.Point.is2DValid(x + ox, y + oy) && !this.isOpaque(dest) && !grid.blocked[dest]) {
            grid.blocked[entity.point] = false;
            grid.blocked[dest] = true;
            entity.point = dest;
            entity.viewer.center = dest;
            entity.viewer.isDirty = true;
        } else {
            entity.viewer.isDirty = false;
        }
    }
}

new Game(100, 20).loop();
