
import { Random } from './Random';
import { Context } from './Context';
import { Grid, Tile } from './Grid';
import { Rect, Point } from './Algorithms2D';
import { Viewer } from './View';


let rand = new Random(1);

//let grid = Grid.fromBernoulli(30, 20, rand);
//let grid = Grid.fromRandom(125, 30, rand, 100);
let grid = Grid.fromEmpty(50, 20);

class Player {
    point = rand.pick(grid.rooms).center();
    viewer = new Viewer(this.point, 8, (p: Point) => grid.getTile(p) === Tile.Wall);
    render = { glyph: '@', fg: 'yellow', bg: 'black' };
};
let player = new Player();

const context = new Context(grid.width, grid.height);
context.clearBuffer = true;
context.start();
Context.Color.set('silver', 'ADADC9');
Context.Color.set('ash', '5654C4D');
Context.Color.set('shadow', '373737');

function loop() {
    context.clear();
    drawGrid(grid, context);
    context.render(player.point, player.render.glyph, player.render.fg, player.render.bg);
    context.build();
}

function drawGrid(grid: Grid, context: Context) {
    grid.clearLight();

    player.viewer.calculate((pos: Point, light: number) => {
        if (light > 0) {
            grid.setVisible(pos);
            grid.setRevealed(pos);
        }
    });

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

function tryMove(x: number, y: number) {
    let dest = { x: player.point.x + x, y: player.point.y + y };
    let bounds = new Rect(0, 0, grid.width, grid.height);
    if (bounds.includes(dest) && grid.tiles[grid.pointToIndex(dest)] === Tile.Floor) {
        player.point = dest;
        player.viewer.center = player.point;
        player.viewer.isDirty = true;
    } else {
        player.viewer.isDirty = false;
    }
}

context.listenInput((unicode: string, name?: string) => {
    let key = name ? name : unicode;
    switch (key) {
        case 'h': tryMove(-1, 0); break;
        case 'j': tryMove(0, -1); break;
        case 'k': tryMove(0, +1); break;
        case 'l': tryMove(+1, 0); break;
        case 'y': tryMove(-1, -1); break;
        case 'u': tryMove(1, -1); break;
        case 'b': tryMove(-1, 1); break;
        case 'n': tryMove(1, 1); break;
        default: return;
    }
    player.point.x >= grid.width && (player.point.x = grid.width - 1);
    player.point.x < 0 && (player.point.x = 0);
    loop();
});

loop();
