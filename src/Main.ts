
interface Point { x: number, y: number };
interface Rect { start: Point, end: Point };
interface Grid {
    width: number, height: number, tiles: Tile[], rooms: Rect[],
    indexToPoint: (index: number) => Point,
    pointToIndex: (point: Point) => number;
};
interface Render { glyph: string, fg: string, bg: string };
interface KeyEvent { key: string, shift: boolean, ctrl: boolean, alt: boolean };

enum Tile { Floor = 0, Wall = 1, };
let rand = new Random(0);

let grid: Grid = createMapBernoulli(30, 20);

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
    grid.tiles.forEach((tile, index) => {
        let glyph = '';
        switch (tile) {
            case Tile.Wall: glyph = '#'; break;
            case Tile.Floor: glyph = '.'; break;
        }
        context.render(grid.indexToPoint(index), glyph, 'white', 'black');
    });
}

function tryMove(x: number, y: number) {
    let dest = { x: player.point.x + x, y: player.point.y + y };
    let bounds = createRect(0, 0, grid.width, grid.height);
    bounds.includes(dest) && grid.tiles[grid.pointToIndex(dest)] === Tile.Floor && (player.point = dest);
}

context.listenInput(evt => {
    switch (evt.key) {
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
