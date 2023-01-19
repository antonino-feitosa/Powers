
"use strict";

const { Context } = require('./Context');
const { DijkstraMap } = require('./DijkstraMap');
const { Entity, Render, Monster } = require('./Entity');
const { Grid, Tile } = require('./Grid');
const { Random } = require('./Random');
const { Viewer } = require('./View');

class Game {

    constructor(width, height, seed = 1, hasFog = true) {
        this.width = width;
        this.height = height;
        this.rand = new Random(seed);
        this.hasFog = hasFog;
        this.clearBuffer = false;
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

        this.player = new Entity(
            startIndex,
            new Viewer(10, startIndex, this.grid.Point, this.isOpaque.bind(this), 'circle'),
            new Render('@', 'yellow', 'black')
        );
        const player = this.player;
        player.heatMap = new DijkstraMap(new Map(), this.neighborhood.bind(this), this.moveCost.bind(this));

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
        const game = this;
        const grid = this.grid;
        const player = this.player;

        grid.rooms.filter(r => r !== startRoom).forEach(room => {
            let [rx, ry] = room.center();
            let pos = this.grid.Point.from(rx, ry);
            grid.blocked[pos] = pos;
            let monster = new Monster(
                pos,
                new Viewer(5, pos, grid.Point, this.isOpaque.bind(this)),
                new Render('M', 'red', 'black'),
            );

            monster.update = function () {
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
            this.monsters.push(monster);
        });
    }

    loop() {
        const player = this.player;

        if (player.viewer.isDirty) {
            this.hasFog && (this.grid.visible = []);
            player.viewer.calculate((pos, light) => {
                if (light > 0) {
                    this.hasFog && (this.grid.visible[pos] = pos);
                    this.grid.revealed[pos] = pos;
                }
            });
        }

        let awakeArea = [];
        let [x, y] = this.grid.Point.to2D(player.point);
        this.grid.area(x, y, (pos) => !this.isOpaque(pos) && awakeArea.push(pos));

        player.heatMap.sources = new Map([[player.point, 0]]);
        player.heatMap.calculate(awakeArea);
        player.heatMap.makeFleeMap(-1.2);

        this.monsters.forEach(m => m.update());
        this.draw();
    }

    draw(){
        const grid = this.grid;
        const player = this.player;
        const context = this.context;
        
        context.clear();
        context.render(0, grid.height, this.message, 'white', 'black');
        this.message = '';

        this.drawGrid(grid, context);
        this.drawMonster(grid, context);
        let [x, y] = grid.Point.to2D(player.point);
        context.render(x, y, player.render.glyph, player.render.fg, player.render.bg);
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

    drawMonster() {
        this.monsters.forEach(m => {
            if (this.grid.visible[m.point] || !this.hasFog) {
                let [x, y] = this.grid.Point.to2D(m.point);
                this.context.render(x, y, m.render.glyph, m.render.fg, m.render.bg);

                /*player.heatMap.neighborhood(m.point).forEach(n => {
                    let val = player.heatMap.dist.get(n);
                    if(val && val < 10){
                        let str = val.toFixed(0);
                        let [x, y] = grid.Point.to2D(n);
                        context.render(x, y, str, m.render.fg, m.render.bg);
                    }
                });*/
            }
        });

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
