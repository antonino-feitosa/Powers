
import { Point, Rect } from './Algorithms2D';
import { Context } from './Context';
import { DijkstraMap } from './DijkstraMap';
import { Entity, Monster } from './Entity';
import { Grid, Tile } from './Grid';
import { Random } from './Random';
import { Viewer } from './View';


let rand = new Random(1);

//let grid = Grid.fromBernoulli(30, 20, rand);
let grid = Grid.fromRandom(140, 29, rand, 100);
//let grid = Grid.fromEmpty(50, 20);
let monsters: Monster[] = [];

let startRoom = rand.pick(grid.rooms);
let startPosition = startRoom.center();
grid.setBlocked(startPosition);

interface Player extends Entity {
    heatMap: DijkstraMap;
}
let player: Player = {
    point: startPosition,
    viewer: new Viewer(startPosition, 8, (p: Point) => grid.getTile(p) === Tile.Wall, grid.pointToIndex),
    render: { glyph: '@', fg: 'yellow', bg: 'black' },
    heatMap: new DijkstraMap([], () => 0, () => [])
};

addMonsters();

const context = new Context(grid.width, grid.height);
context.clearBuffer = false;
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
    context.render(player.point, player.render.glyph, player.render.fg, player.render.bg);
    context.build();
}

function updateEntities() {
    if (player.viewer.isDirty) {
        grid.clearLight();
        player.viewer.calculate((pos: Point, light: number) => {
            if (light > 0) {
                grid.setVisible(pos);
                grid.setRevealed(pos);
            }
        });
    }
    player.heatMap = new DijkstraMap(
        grid.visible,
        (u: number, v: number) => {
            let { x: x1, y: y1 } = grid.indexToPoint(v);
            let { x: x2, y: y2 } = grid.indexToPoint(u);
            return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        },
        (index: number) => {
            let xs = [0, 0];// [-1, +1, +0, +0];//, -1, -1, +1, +1];
            let ys = [-1, 1];// [+0, +0, -1, +1];//, -1, +1, -1, -1];
            let { x: x, y: y } = grid.indexToPoint(index);
            let indexes: number[] = [];
            for (let i = 0; i < xs.length; i++) {
                let point = { x: x + xs[i], y: y + ys[i] };
                let id = grid.pointToIndex(point);
                if (grid.isAtBounds(point) && grid.getTile(point) === Tile.Floor) {
                    indexes.push(id);
                }
            }
            return indexes;
        }
    );
    player.heatMap.sources.set(grid.pointToIndex(player.point), 0);
    player.heatMap.calculate();

    monsters.forEach(m => m.update());
}

function addMonsters() {
    grid.rooms.filter(r => r !== startRoom).forEach(room => {
        let pos = room.center();
        grid.setBlocked(pos);
        let monster: Monster = {
            point: pos,
            viewer: new Viewer(pos, 6, (p: Point) => grid.getTile(p) === Tile.Wall, grid.pointToIndex),
            render: { glyph: 'M', fg: 'red', bg: 'black' },
            update: function () {
                if (this.viewer.isDirty) {
                    this.viewer.calculate();
                    this.viewer.isDirty = false;
                }
                if (this.viewer.contains(player.point)) {
                    let moveIndex = player.heatMap.chase(grid.pointToIndex(this.point));
                    let moveTo = grid.indexToPoint(moveIndex);
                    console.log('Index', grid.pointToIndex(this.point));
                    console.log('Index', moveIndex);
                    tryMove(this, this.point.x - moveTo.x, this.point.y - moveTo.y);
                    context.renderMessage(JSON.stringify(this.point) + ' ' + JSON.stringify(moveTo) + " " + (this.point.x - moveTo.x) + ' ' + (this.point.y - moveTo.y));
                }
            }
        }
        monsters.push(monster);
    });
}

function drawGrid(grid: Grid, context: Context) {
    grid.revealed.forEach((index) => {
        let point = grid.indexToPoint(index);
        let glyph = grid.getTile(point);
        context.render(point, glyph, 'grey', 'black');
    });

    grid.visible.forEach((index) => {
        let point = grid.indexToPoint(index);
        let glyph = grid.getTile(point);
        context.render(point, glyph, 'white', 'black');
    });
}

function drawMonster(grid: Grid, context: Context) {
    monsters.forEach(m => {
        if (grid.isVisible(m.point)) {
            context.render(m.point, m.render.glyph, m.render.fg, m.render.bg);
        }
    });
}

function tryMove(entity: Entity, x: number, y: number) {
    let dest = { x: entity.point.x + x, y: entity.point.y + y };
    let bounds = new Rect(0, 0, grid.width, grid.height);
    if (bounds.includes(dest) && !grid.isBlocked(dest) && grid.tiles[grid.pointToIndex(dest)] === Tile.Floor) {
        grid.setBlocked(entity.point, false);
        grid.setBlocked(dest, true);
        entity.point = dest;
        entity.viewer.center = entity.point;
        entity.viewer.isDirty = true;
    } else {
        entity.viewer.isDirty = false;
    }
}

context.listenInput((unicode: string, name?: string) => {
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
    player.point.x >= grid.width && (player.point.x = grid.width - 1);
    player.point.x < 0 && (player.point.x = 0);
    loop();
});
