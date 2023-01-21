
"use strict";

const { Context } = require('./Context');
const { Monster, Player } = require('./Entity');
const { Grid, Tile } = require('./Grid');
const { Random } = require('./Random');
const { TurnControl } = require('./Turn');
const { range } = require('./Utils');

class Game {

    constructor(width, height, seed = 1, hasFog = true) {
        this.clearBuffer = false;

        this.width = width;
        this.height = height;
        this.rand = new Random(seed);
        this.hasFog = hasFog;
        this._messages = [];
        this._messagesIndex = 0;
        this.turnCount = 0;
        this._alertMessage = null;
        this.turnControl = new TurnControl();
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

        this.context = new Context(this.width, this.height + 4);
        this.context.clearBuffer = this.clearBuffer;
        this.context.start();
        this.context.listenInput((unicode, name) => {
            if (this.turnControl.peek() !== player) return;

            let key = name ? name : unicode;
            switch (key) {
                case 'space': this.lit = !this.lit; this.draw(); return;
                case "'": this.showMessages = !this.showMessages; this.draw(); return;
            }

            switch (key) {
                case 'h': player.tryMove(-1, +0); break;
                case 'k': player.tryMove(+0, -1); break;
                case 'j': player.tryMove(+0, +1); break;
                case 'l': player.tryMove(+1, +0); break;
                case 'y': player.tryMove(-1, -1); break;
                case 'u': player.tryMove(+1, -1); break;
                case 'b': player.tryMove(-1, +1); break;
                case 'n': player.tryMove(+1, +1); break;
                default: return;
            }

            this.turnCount++;
            this.turnControl.nextTurn();
            this.loop();
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
        if (!this.showMessages) {
            this.drawGrid();
            this.turnControl.values.forEach(m => m.draw());
            player.draw();
        }
        this.drawUI();
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
        this._messages.push(' Turn ' + this.turnCount + ': ' + message);
    }

    alertMessage(message) {
        this._alertMessage = message;
    }

    drawUI() {
        const player = this.player;
        const context = this.context;
        const messages = this._messages;

        let fillMessage = function (msg, index, height, color) {
            let width = Math.min(context.width, msg.length);
            for (let c = 0; c < width; c++) {
                context.render(c + index, height, msg[c], color, 'black');
            }
            return index + width;
        }

        let numToDisplay = messages.length - this._messageIndex;
        if (this.showMessages) {
            numToDisplay = Math.min(messages.length, context.height);
        } else {
            numToDisplay = Math.min(3, messages.length - this._messageIndex);

            let hp = player.combatStatus.hp;
            let max = player.combatStatus.maxHP;
            let str = '\u250D\u2501 HP ' + hp + '/' + max + ' ';
            let index = fillMessage(str, 0, context.height - 4, 'white');
            if (this._alertMessage) {
                this._alertMessage = '\u2501\u2501 ' + this._alertMessage + ' ';
                index = fillMessage(this._alertMessage, index, context.height - 4, 'yellow');
            }
            index = fillMessage('\u2501'.repeat(context.width - index - 1), index, context.height - 4, 'white');
            index = fillMessage('\u2511', index, context.height - 4, 'white');
        }
        for (let i = 0, index = messages.length - 1; i < numToDisplay; i++, index--) {
            let dy = numToDisplay < 3 ? numToDisplay - 3 : 0;
            fillMessage(messages[index], 0, context.height - 1 - i + dy, 'white');
        }

        this._alertMessage = null;
        this._messageIndex = this._messages.length;
    }
}

new Game(100, 20).loop();
