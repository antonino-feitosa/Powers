
"use strict";

const { Context } = require('./Context');
const { Monster, Player } = require('./Entity');
const { Grid, Tile } = require('./Grid');
const { Random } = require('./Random');
const { TurnControl } = require('./Turn');
const { range } = require('./Utils');
const {UI} = require('./UI');

class Game {

    constructor(width, height, seed = 1, hasFog = true) {
        this.clearBuffer = true;

        this.width = width;
        this.height = height;
        this.rand = new Random(seed);
        this.hasFog = hasFog;
        this.depth = 1;
        this.turnCount = 0;
        
        this.turnControl = new TurnControl();
        this.context = new Context(this.width + 20, this.height + 4);
        this.ui = new UI(this, 4, 15);
        this.start();
    }

    isOpaque(p) { return this.grid.tiles[p] === Tile.Wall; }
    moveCost(u, v) {
        let [x1, y1] = this.grid.Point.to2D(u);
        let [x2, y2] = this.grid.Point.to2D(v);
        //return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
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

        this.context.clearBuffer = this.clearBuffer;
        this.context.start();
        this.context.listenInput((unicode, name) => {
            if (this.turnControl.peek() !== player) return;
            
            let key = name ? name : unicode;
            let res = this.ui.input(player, key);
            if(res === 'draw'){
                this.draw();
            } else if(res === 'action'){
                this.loop();
            }
        });
    }

    addMonsters(startRoom) {
        const grid = this.grid;
        const Point = grid.Point;
        const rand = this.rand;
        let names = ['orc', 'dwarf', 'human', 'elf', 'goblin', 'troll'];
        grid.rooms.filter(r => r !== startRoom).forEach(room => {
            let maxMonsters = Math.ceil((room.x1 - room.x2) * (room.y1 - room.y2) / 16);
            range(0, rand.nextInt(maxMonsters), () => {
                let [rx, ry] = room.randPos(rand);
                let pos = Point.from(rx, ry);
                if (!grid.blocked[pos]) {
                    let monster = new Monster(this, pos, 5, rand.pick(names) + ' #' + this.turnControl.length());
                    this.turnControl.push(monster);
                }
            });
        });
    }

    loop() {
        this.turnCount++;
        this.turnControl.nextTurn();
        this.ui.nextTurn();
        this.ui.printAlertMessage('Turn ' + this.turnCount);

        const turnControl = this.turnControl;
        const player = this.player;

        let current = turnControl.peek();
        while (current !== player && !current.update()) {
            if (current.isDead) {
                turnControl.del(current);
                current = turnControl.peek();
            } else {
                current = turnControl.nextTurn();
            }
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
        const player = this.player;
        const context = this.context;

        context.clear();
        this.drawGrid();
        this.turnControl.values.forEach(m => m.draw());
        player.draw();

        this.ui.draw();
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
                this.context.render(x, y, glyph, 'green', 'black');
            });
        }
    }

    printMessage(message) {
        this.ui.printLog(message);
    }

    alertMessage(message) {
        this.ui.printAlertMessage(message);
    }
}

new Game(100, 20).loop();
