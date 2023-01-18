
"use strict";

const { Context } = require('./Context');
const { DijkstraMap } = require('./DijkstraMap');
const { Entity, Render, Monster } = require('./Entity');
const { Point, Rect, Grid, Tile } = require('./Grid');
const { Random } = require('./Random');
const { Viewer } = require('./View');


let rand = Object.create(Random).with(1);

//let grid = Grid.fromBernoulli(30, 20, rand);
//let grid = Grid.fromRandom(140, 29, rand, 100);
let grid = Grid.fromEmpty(20, 20);
let monsters = [];

let startRoom = rand.pick(grid.rooms);
let startPosition = startRoom.center();
let startIndex = grid.Point.from(startPosition[0], startPosition[1]);
grid.blocked[startIndex] = startIndex;

let player = Object.create(Entity).with(
    startIndex,
    Object.create(Viewer).with(8, startIndex, grid.Point, (p) => grid.tiles[p] === Tile.Wall),
    Object.create(Render).with('@', 'yellow', 'black'),
);
player.heatMap = Object.create(DijkstraMap);
player.heatMap.neighborhood = function (u) {
    let ne = grid.Point.neighborhood(u);
    ne = ne.filter(n => grid.Point.isValid(n) && !grid.blocked[n] && grid.tiles[n] === Tile.Floor);
    return ne;
}

addMonsters();

const context = Object.create(Context).with(grid.width, grid.height);
context.clearBuffer = true;
context.start();
Context.Color.set('silver', 'ADADC9');
Context.Color.set('ash', '5654C4D');
Context.Color.set('shadow', '373737');

loop();

function loop() {
    updateEntities();
    context.clear();
    drawGrid(grid, context);
    drawMonster(grid, context);
    let [x, y] = grid.Point.to2D(player.point);
    context.render(x, y, player.render.glyph, player.render.fg, player.render.bg);
    context.build();
}

function updateEntities() {
    if (player.viewer.isDirty) {
        grid.visible = [];
        player.viewer.calculate((pos, light) => {
            if (light > 0) {
                grid.visible[pos] = pos;
                grid.revealed[pos] = pos;
            }
        });
    }
    player.heatMap.sources.set(player.point, 0);
    player.heatMap.calculate(grid.visible);

    monsters.forEach(m => m.update());
}

function addMonsters() {
    grid.rooms.filter(r => r !== startRoom).forEach(room => {
        let [rx, ry] = room.center();
        let pos = grid.Point.from(rx, ry);
        grid.blocked[pos] = pos;
        let monster = Object.create(Monster).with(
            pos,
            Object.create(Viewer).with(6, startIndex, grid.Point, (p) => grid.tiles[p] === Tile.Wall),
            Object.create(Render).with('M', 'red', 'black'),
        );
        monster.update = function () {
            if (this.viewer.isDirty) {
                this.viewer.calculate();
                this.viewer.isDirty = false;
            }
            if (this.viewer.lightMap.get(player.point) > 0) {
                let moveIndex = player.heatMap.chase(this.point);
                let [dx, dy] = grid.Point.to2D(moveIndex);
                let [x, y] = grid.Point.to2D(this.point);
                tryMove(this, x - dx, y - dy);
                //context.renderMessage(JSON.stringify(this.point) + ' ' + JSON.stringify(moveTo) + " " + (this.point.x - moveTo.x) + ' ' + (this.point.y - moveTo.y));
            }
        }
        monsters.push(monster);
    });
}

function drawGrid(grid, context) {
    grid.revealed.forEach((index) => {
        let [x, y] = grid.Point.to2D(index);
        let glyph = grid.tiles[index];
        context.render(x, y, glyph, 'grey', 'black');
    });

    grid.visible.forEach((index) => {
        let [x, y] = grid.Point.to2D(index);
        let glyph = grid.tiles[index];
        context.render(x, y, glyph, 'green', 'black');
    });
}

function drawMonster(grid, context) {
    monsters.forEach(m => {
        if (grid.visible[m.point]) {
            let [x, y] = grid.Point.to2D(index);
            context.render(x, y, m.render.glyph, m.render.fg, m.render.bg);
        }
    });
}

function tryMove(entity, x, y) {
    let dest = grid.Point.from(x, y);
    if (grid.Point.isValid(dest) && !grid.isBlocked(dest) && grid.tiles[dest] === Tile.Floor) {
        grid.blocked[entity.point] = false;
        grid.blocked[dest] = true;
        entity.point = dest;
        entity.viewer.center = dest;
        entity.viewer.isDirty = true;
    } else {
        entity.viewer.isDirty = false;
    }
}

context.listenInput((unicode, name) => {
    let key = name ? name : unicode;
    switch (key) {
        case 'h': tryMove(player, -1, 0); break;
        case 'k': tryMove(player, 0, -1); break;
        case 'j': tryMove(player, 0, +1); break;
        case 'l': tryMove(player, +1, 0); break;
        case 'y': tryMove(player, -1, -1); break;
        case 'u': tryMove(player, 1, -1); break;
        case 'b': tryMove(player, -1, 1); break;
        case 'n': tryMove(player, 1, 1); break;
        default: return;
    }
    loop();
});
