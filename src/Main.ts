
class Random {

    /** Class representing a uniform pseudorandom number generator.
    Implementation of xoshiro128** general-purpose 64-bit number generator with cyrb128 hash initialization.
    The javascript switch to 32-bit integer mode during bitwise operation (justifies the 128 version over 256).
    Implementation based on the stackoverflow discussion:
    @see {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript| stackoverflow.com}
 */

    rand: () => number;

    constructor(seed = 0) {
        let state = Random._cyrb128(String(seed));
        this.rand = Random._xoshiro128ss(state[0], state[1], state[2], state[3]);
    }

    _next() {
        return this.rand();
    }

    // Gets the next pseudorandom integer on the interval [0,`n`).
    nextInt(n: number) {
        if (n <= 0)
            throw new Error('The limit must be positive.');
        return this._next() % n;
    }

    // Gets the next pseudorandom integer on the interval [`min`,`max`).
    nextRange(min: number, max: number) {
        if (max <= min)
            throw new Error(`The maximum limit ${max} must be greater than the minimum ${min}.`);
        return min + this.nextInt(max - min);
    }

    // Gets the next pseudorandom real number on the interval [0,1).
    nextDouble() {
        return this._next() / 4294967296; // 2^32-1
    }

    // Gets the next pseudorandom boolean value.
    nextBoolean() {
        return this.nextDouble() >= 0.5;
    }

    pick<T>(arr: T[]): T {
        if (arr.length <= 0)
            throw new Error('The must have at least one element!');
        let index = this.nextInt(arr.length);
        return arr[index];
    }

    shuffle<T>(vet: T[]): void {
        for (let i = vet.length - 1; i > 0; i--) {
            let index = this.nextInt(i);
            [vet[i], vet[index]] = [vet[index], vet[i]];
        }
    }

    sample<T>(vet: T[], size: number): T[] {
        if (!vet || !vet.length || vet.length < size)
            throw new Error(`The array must have at least ${size} elements!`);
        let arr = [...vet];
        this.shuffle(arr);
        return arr.slice(0, size);
    }

    /** Hash function to extract no zero 128 seed from a string.*/
    static _cyrb128(str: string) {
        let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k: number; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
    }

    /** Creates xoshiro128** with states a, b, c, d (32-bit integer each) generating 32-bit random integers*/
    static _xoshiro128ss(a: number, b: number, c: number, d: number) {
        return function () {
            let t = b << 9, r = a * 5;
            r = (r << 7 | r >>> 25) * 9;
            c ^= a;
            d ^= b;
            b ^= c;
            a ^= d;
            c ^= t;
            d = d << 11 | d >>> 21;
            return (r >>> 0);
        };
    }
}

interface Array<T> {
    pick<T>(rand: Random): T;
    shuffle<T>(rand: Random): T[];
    sample<T>(rand: Random, size: number): T[];
    populate<T>(length: number, call: (index: number) => T): void;
}

Array.prototype.pick = function <T>(rand: Random): T {
    if (this.length <= 0)
        throw new Error('The must have at least one element!');
    let index = rand.nextInt(this.length);
    return this[index];
}

Array.prototype.shuffle = function <T>(rand: Random): T[] {
    for (let i = this.length - 1; i > 0; i--) {
        let index = this.nextInt(i);
        [this[i], this[index]] = [this[index], this[i]];
    }
    return this;
}

Array.prototype.sample = function <T>(rand: Random, size: number): T[] {
    if (size < 1 || this.length < size)
        throw new Error(`The array must have at least ${size} elements!`);
    let arr = [...this];
    this.shuffle(arr);
    return arr.slice(0, size);
}

Array.prototype.populate = function <T>(length: number, call: (index: number) => T): void {
    for (let i = 0; i < length; i++) {
        this.push(call(i));
    }
}

class Context {

    width: number;
    height: number;
    matrix: string[][];

    background: string = 'black';
    foreground: string = 'white';
    fog: boolean = false;
    clearBuffer: boolean = true;

    static color = new Map([
        ['black', '0;0;0'],
        ['white', '255;255;255'],
        ['yellow', '255;255;0'],
        ['green', '0;255;0'],
        ['blue', '0;0;255'],
    ]);

    constructor(width = 80, height = 50) {
        this.width = width;
        this.height = height;

        process.stdout.write('\u001b[?1049h'); // enable alternative buffer
        process.stdout.write('\u001b[?25l'); // hide cursor

        let back = Context._applyColor(' ', this.foreground, this.background);

        this.matrix = [];
        this.matrix.populate(height, _ => {
            let row: string[] = [];
            row.populate(width, _ => back);
            return row;
        });
    }

    static _applyColor(text: string, fg: string = 'white', bg: string = 'black') {
        let fgColor = Context.color.get(fg);
        let bgColor = Context.color.get(bg);
        return `\x1b[38;2;${fgColor}m\x1b[48;2;${bgColor}m` + text;
    }

    render(point: Point, glyph: string, fg: string, bg: string) {
        this.matrix[point.y][point.x] = Context._applyColor(glyph, fg, bg);
    }

    build(): void {
        this.clearBuffer && process.stdout.write(`\x1b[${this.height}A`); // move to start
        this.matrix.forEach(row => console.log(row.join('')));
        this.clear();
    }

    clear(): void {
        let back = Context._applyColor(' ', this.foreground, this.background);
        this.matrix.forEach(row => row.fill(back))
    }

    dispose(timer: any) {
        process.stdin.pause();
        timer && clearInterval(timer);
        process.stdout.write('\x1b[0m'); // reset colors and modes
        process.stdout.write('\u001b[?25h'); // restore cursor (ANSI escape sequence)
    }

    listenInput(call: (evt: KeyEvent) => void, timer: any = null) {
        const keypress = require('keypress');
        keypress(process.stdin);

        const dispose = this.dispose.bind(this);
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.ctrl && key.name == 'c') {
                dispose();
            } else {
                call({ key: key ? key.name : ch, shift: false, ctrl: false, alt: false });
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}


interface Point { x: number, y: number };
interface Rect { start: Point, end: Point };
interface Grid {
    width: number, height: number, tiles: Tile[], rooms: Rect[],
    indexToPoint: (index: number) => Point,
    pointToIndex: (point: Point) => number;
};
interface Render { glyph: string, fg: string, bg: string };
interface KeyEvent { key: string, shift: boolean, ctrl: boolean, alt: boolean };

function createRect(x: number, y: number, width: number, height: number) {
    return {
        start: { x: x, y: y },
        end: { x: x + width, y: y + height },
        includes(point: Point): boolean {
            return point.x >= this.start.x && point.x < this.end.x && point.y >= this.start.y && point.y < this.end.y;
        }
    }
};

function createMapBernoulli(width: number, height: number, prob: number = 0.5) {
    let indexToPoint = (index: number) => ({ x: index % width, y: Math.floor(index / width) });
    let pointToIndex = (point: Point) => point.y * width + point.x;
    let tiles: Tile[] = [];
    let rooms: Rect[] = [];
    tiles.populate(width * height, index => {
        switch (true) {
            case index < width:
            case index >= (width - 1) * height:
            case index % width - 1 === 0:
            case index % width === 0:
            case rand.nextDouble() < prob:
                return Tile.Wall;
            default:
                let point = indexToPoint(index);
                rooms.push({ start: point, end: { x: point.x + 1, y: point.y + 1 } });
                return Tile.Floor;
        }
    });
    return { width: width, height: height, tiles: tiles, rooms: rooms, indexToPoint: indexToPoint, pointToIndex: pointToIndex };
}

enum Tile { Floor = 0, Wall = 1, };
let rand = new Random(0);

let grid: Grid = createMapBernoulli(30, 20);

let player = {
    point: grid.rooms.length > 0 ? grid.rooms.pick<Rect>(rand).start : { x: Math.floor(grid.width / 2), y: Math.floor(grid.height / 2) },
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
