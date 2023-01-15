
import {Random} from './Random';
import {Context} from './Context';
import {Rect, Grid, Tile} from './Maps';


let rand = new Random(0);

let grid = Grid.fromBernoulli(30, 20, rand);

let player = {
    point: grid.rooms.length > 0 ? rand.pick(grid.rooms).start : { x: Math.floor(grid.width / 2), y: Math.floor(grid.height / 2) },
    render: { glyph: '@', fg: 'yellow', bg: 'black' }
};

const context = new Context(grid.width, grid.height);

function loop() {
    context.clear();
    drawGrid(grid, context);
    context.render(player.point, player.render.glyph, player.render.fg, player.render.bg);
    context.build();
}

function drawGrid(grid: Grid, context: Context) {
    console.log(grid.width * grid.height, grid.tiles.length);
    grid.tiles.forEach((tile, index) => {
        let glyph = '';
        switch (tile) {
            case Tile.Wall: glyph = '#'; break;
            case Tile.Floor: glyph = '.'; break;
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
