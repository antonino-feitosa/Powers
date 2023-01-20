
"use strict";

const { Context } = require('./Context');
const { Monster, Player } = require('./Entity');
const { Grid, Tile } = require('./Grid');
const { Random } = require('./Random');
const { TurnControl } = require('./Turn');

class Game {

    constructor(width, height, seed = 1, hasFog = true) {
        this.width = width;
        this.height = height;
        this.rand = new Random(seed);
        this.hasFog = hasFog;
        this.clearBuffer = false;
        this.monsters = [];
        this.message = '';
        this.turnControl = new TurnControl();
        this.start();
    }

    isOpaque(p) { return this.grid.tiles[p] === Tile.Wall; }
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

        const player = this.player = new Player(this, startIndex, 8);
        this.turnControl.push(player);
        this.addMonsters(startRoom);

        this.context = new Context(this.width, this.height + 1);
        this.context.clearBuffer = this.clearBuffer;
        this.context.start();
        this.context.listenInput((unicode, name) => {
            if (this.turnControl.peek() !== player) return;

            let key = name ? name : unicode;
            switch (key) {
                case 'h': player.tryMove(-1, +0); break;
                case 'k': player.tryMove(+0, -1); break;
                case 'j': player.tryMove(+0, +1); break;
                case 'l': player.tryMove(+1, +0); break;
                case 'y': player.tryMove(-1, -1); break;
                case 'u': player.tryMove(+1, -1); break;
                case 'b': player.tryMove(-1, +1); break;
                case 'n': player.tryMove(+1, +1); break;
                case 'space': this.lit = !this.lit; this.draw(); break;
                default: return;
            }

            this.turnControl.nextTurn();
            this.loop();
        });
    }

    addMonsters(startRoom) {
        const grid = this.grid;
        grid.rooms.filter(r => r !== startRoom).forEach(room => {
            let [rx, ry] = room.center();
            let pos = this.grid.Point.from(rx, ry);
            let monster = new Monster(this, pos, 6);
            this.turnControl.push(monster);
        });
    }

    loop() {
        const turnControl = this.turnControl;
        const player = this.player;

        let current = turnControl.peek();
        while (current !== player && !current.update()) {
            current = turnControl.nextTurn();
        }
        if (current !== player) {
            nextTurn();
        }
        player.update();
        this.draw();
    }

    nextTurn() {
        setTimeout(this.loop.bind(this), 300);
    }

    draw() {
        const grid = this.grid;
        const player = this.player;
        const context = this.context;

        context.clear();
        context.render(0, grid.height, this.message, 'white', 'black');
        this.message = '';

        this.drawGrid();
        this.turnControl.values.forEach(m => m.draw());
        player.draw();

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
}

new Game(50, 20).loop();
