
"use strict";

const { Context } = require('./Context');
const { DijkstraMap } = require('./DijkstraMap');
const { Entity, Render, Monster } = require('./Entity');
const { Grid, Tile } = require('./Grid');
const { Random } = require('./Random');
const { Viewer } = require('./View');


let rand = Object.create(Random).with(1);

//let grid = Grid.fromBernoulli(30, 20, rand);
let grid = Grid.fromRandom(120, 27, rand, 100);
//let grid = Grid.fromEmpty(20, 20);
let monsters = [];

let startRoom = rand.pick(grid.rooms);
let startPosition = startRoom.center();
let startIndex = grid.Point.from(startPosition[0], startPosition[1]);
grid.blocked[startIndex] = startIndex;

let player = Object.create(Entity).with(
    startIndex,
    Object.create(Viewer).with(10, startIndex, grid.Point, (p) => grid.tiles[p] === Tile.Wall, 'circle'),
    Object.create(Render).with('@', 'yellow', 'black'),
);
player.heatMap = Object.create(DijkstraMap);
player.heatMap.neighborhood = function (u) {
    let ne = grid.Point.neighborhood(u);
    ne = ne.filter(n => !grid.blocked[n] && grid.tiles[n] === Tile.Floor);
    return ne;
}
player.heatMap.cost = function(u, v){
    let [x1, y1] = grid.Point.to2D(u);
    let [x2, y2] = grid.Point.to2D(v);
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

addMonsters();

let hasFog = true;

const context = Object.create(Context).with(grid.width, grid.height + 1);
context.clearBuffer = true;
context.start();
Context.Color.set('silver', 'ADADC9');
Context.Color.set('ash', '5654C4D');
Context.Color.set('shadow', '373737');

let message = '';
loop();

function loop() {
    updateEntities();
    context.clear();
    context.render(0, grid.height, message, 'white', 'black');
    message = '';

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

    let awakeArea = [];
    let [x, y] = grid.Point.to2D(player.point);
    grid.area(x, y, (pos, tile) => {
        if(tile === Tile.Floor && !grid.blocked[pos]){
            awakeArea.push(pos);
        }
    });

    player.heatMap.with(new Map([[player.point, 0]]));
    player.heatMap.calculate(awakeArea);
    player.heatMap.makeFleeMap(-1.2);

    monsters.forEach(m => m.update());
}

function addMonsters() {
    grid.rooms.filter(r => r !== startRoom).forEach(room => {
        let [rx, ry] = room.center();
        //let rx = 3, ry = 3;
        let pos = grid.Point.from(rx, ry);
        grid.blocked[pos] = pos;
        let monster = Object.create(Monster).with(
            pos,
            Object.create(Viewer).with(5, pos, grid.Point, (p) => grid.tiles[p] === Tile.Wall),
            Object.create(Render).with('M', 'red', 'black'),
        );
        monster.update = function () {
            if (this.viewer.isDirty) {
                this.viewer.calculate();
                this.viewer.isDirty = false;
            }
            if (this.viewer.lightMap.get(player.point) > 0) {
                let moveIndex = player.heatMap.chase(this.point);
                if(grid.Point.neighborhood(player.point).includes(this.point)){
                    message = 'The Monster Attacks!!!';    
                } else {
                    let [dx, dy] = grid.Point.to2D(moveIndex);
                    let [x, y] = grid.Point.to2D(this.point);
                    tryMove(this, dx - x, dy - y);
                    message = 'Monster shouts a insult!';
                }
            }
        }
        monsters.push(monster);
    });
}

function drawGrid(grid, context) {
    if(hasFog){
        grid.revealed.forEach((index) => {
            let [x, y] = grid.Point.to2D(index);
            let glyph = grid.tiles[index];
            context.render(x, y, glyph, 'grey', 'black');
        });
    
        grid.visible.forEach((index) => {
            let [x, y] = grid.Point.to2D(index);
            let glyph = grid.tiles[index];
            context.render(x, y, glyph, 'white', 'black');
        });
    } else {
        for(let index of grid.tiles.keys()){
            let [x, y] = grid.Point.to2D(index);
            let glyph = grid.tiles[index];
            context.render(x, y, glyph, 'white', 'black');
        }
    }
}

function drawMonster(grid, context) {
    monsters.forEach(m => {
        if (grid.visible[m.point] || !hasFog) {
            let [x, y] = grid.Point.to2D(m.point);
            context.render(x, y, m.render.glyph, m.render.fg, m.render.bg);

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

    /*player.heatMap.fleeMap.dist.forEach((val, p) => {
        val = -val;
        if(val < 10){
            let str = val.toFixed(0);
            let [x, y] = grid.Point.to2D(p);
            context.render(x, y, str);
        } else {
            let [x, y] = grid.Point.to2D(p);
            context.render(x, y, '.','red');
        }
    });*/
}

function tryMove(entity, x, y) {
    let [ox, oy] = grid.Point.to2D(entity.point);
    let dest = grid.Point.from(x + ox, y + oy);
    if (grid.Point.is2DValid(x + ox, y + oy) && !grid.blocked[dest] && grid.tiles[dest] === Tile.Floor) {
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
