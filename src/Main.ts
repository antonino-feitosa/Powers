
import {Random} from './Random';
import {Context} from './Context';
import {Rect, Grid, Tile} from './Maps';


let rand = new Random(1);

//let grid = Grid.fromBernoulli(30, 20, rand);
let grid = Grid.fromRandom(125, 30, rand, 100);

let player = {
    viewRange: 8,
    point: rand.pick(grid.rooms).center(),
    render: { glyph: '@', fg: 'yellow', bg: 'black' }
};

const context = new Context(grid.width, grid.height);
context.clearBuffer = true;
context.start();

function loop() {
    context.clear();
    drawGrid(grid, context);
    context.render(player.point, player.render.glyph, player.render.fg, player.render.bg);
    context.build();
}

function drawGrid(grid: Grid, context: Context) {
    grid.tiles.forEach((tile, index) => {
        let glyph = '';
        switch (tile) {
            case Tile.Wall: glyph = '#'; break;
            case Tile.Floor: glyph = '.'; break;
            case Tile.Tunnel: glyph = 'C'; break;
        }
        let point = grid.indexToPoint(index);
        context.render(point, glyph, 'white', 'black');
    });
}

function tryMove(x: number, y: number) {
    let dest = { x: player.point.x + x, y: player.point.y + y };
    let bounds = new Rect(0, 0, grid.width, grid.height);
    bounds.includes(dest) && grid.tiles[grid.pointToIndex(dest)] === Tile.Floor && (player.point = dest);
}

context.listenInput((unicode:string,name?:string) => {
    let key = name ? name : unicode;
    switch (key) {
        case 'd':
        case 'right': tryMove(+1, 0); break;
        case 'a':
        case 'left': tryMove(-1, 0); break;
        case 'w':
        case 'up': tryMove(0, -1); break;
        case 's':
        case 'down': tryMove(0, +1); break;
        default: return;
    }
    player.point.x >= grid.width && (player.point.x = grid.width - 1);
    player.point.x < 0 && (player.point.x = 0);
    loop();
});

loop();
