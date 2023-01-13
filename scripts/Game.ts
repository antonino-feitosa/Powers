
import { Random } from './Random';

function range(min: number, max: number, step = 1): number[] {
    let arr = Array(max - min).fill(1);
    return arr.map((_, index) => min + step * index);
}

class Point {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    copy(point: Point) {
        this.x = point.x;
        this.y = point.y;
    }
}

class Renderable {
    glyph: string;
    fg: string;
    bg: string;

    constructor(glyph: string, fg = 'black', bg = 'white') {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
    }
}

enum Tile {
    Wall,
    Floor
}

type mapCallback = (value: number, position: Point) => void;

class World {

    width: number;
    height: number;
    map: Tile[];

    constructor(width = 80, height = 50) {
        this.width = width;
        this.height = height;
        this.map = Array.from({ length: this.height * this.width }, () => Tile.Floor);
    }

    on_start(): void {

    }

    getRandomPosition(rand: Random, tile: Tile) {
        let floor: Point[] = [];
        this.iterate((val, pos) => val === tile && (floor.push(pos)));
        rand.shuffle(floor);
        return rand.pick(floor);
    }

    makeBoundariesWalls(): void {
        let makeWall = (_: Tile, pos: Point) => this.setTile(pos, Tile.Wall);
        this.iterateHor(0, this.width, 0, makeWall);
        this.iterateHor(0, this.width, this.height - 1, makeWall);
        this.iterateVer(0, this.height, 0, makeWall);
        this.iterateVer(0, this.height, this.width - 1, makeWall);
    }

    makeRandomWalls(rand: Random, prob: number = 0.5): void {
        this.iterateMap(new Point(1, 1), new Point(this.width - 1, this.height - 1), (_, point) => {
            if (rand.nextDouble() <= prob) {
                this.setTile(point, Tile.Wall);
            }
        });
    }

    private iterateDim(start: number, end: number, common: number, horizontal = true, call: mapCallback): void {
        range(start, end).forEach(i => {
            let point: Point = new Point();
            [point.x, point.y] = horizontal ? [i, common] : [common, i];
            let element = this.map[this.xyIndex(point)];
            call(element, point);
        });
    }

    iterateHor(start: number, end: number, y: number, call: mapCallback): void {
        this.iterateDim(start, end, y, true, call);
    }

    iterateVer(start: number, end: number, x: number, call: mapCallback): void {
        this.iterateDim(start, end, x, false, call);
    }

    iterateMap(upLeft: Point, downRight: Point, call: mapCallback): void {
        range(upLeft.y, downRight.y).forEach(row => {
            this.iterateHor(upLeft.x, downRight.x, row, call);
        });
    }

    iterate(call: mapCallback): void {
        this.iterateMap(new Point(), new Point(this.width, this.height), call);
    }

    isAtBounds(point: Point): boolean {
        return point.x < this.width && point.y < this.height && point.x >= 0 && point.y >= 0;
    }

    setTile(point: Point, tile: Tile): void {
        this.map[this.xyIndex(point)] = tile;
    }

    getTile(point: Point): Tile {
        return this.map[this.xyIndex(point)];
    }

    xyIndex(point: Point): number {
        return Math.floor(point.y) * this.width + Math.floor(point.x);
    }
}

class Component {
    position: Point;
    render: Renderable;

    game: Game;
    world: World;

    constructor(position: Point, render: Renderable, game: Game) {
        this.position = position;
        this.render = render;
        this.game = game;
        this.world = game.world;
    }

    update(turn: number): boolean { return false; }
    on_start(): void { console.log('START');};
    on_command_pressed(command: string): boolean { return false; }
    on_command_down(command: string): boolean { return false; }
    on_command_up(command: string): boolean { return false; }
}

enum State {Idle, Moving};
class Player extends Component {

    state:State = State.Idle;

    update(turn: number): boolean {
        if(this.state == State.Idle){
            this.game.freeze();
        } else if(this.state == State.Moving){
            this.game.unfreeze();
            this.state = State.Idle;
            return true;
        }
        return false;
    }

    on_command_down(command: string): boolean {
        this.state = State.Moving;
        switch (command) {
            case 'left': this.tryMoveTo(-1, 0); return true;
            case 'right': this.tryMoveTo(+1, 0); return true;
            case 'up': this.tryMoveTo(0, -1); return true;
            case 'down': this.tryMoveTo(0, +1); return true;
        }
        this.state = State.Idle;
        return false;
    }

    tryMoveTo(x: number, y: number) {
        let destination = new Point(this.position.x + x, this.position.y + y);
        console.log(this.position);
        console.log(this.world.isAtBounds(destination));
        if (this.world.isAtBounds(destination) && this.world.getTile(destination) === Tile.Floor) {
            console.log('HERE');
            this.position.copy(destination);
        }
        console.log(this.position);
    }
}

class Context {

    width: number;
    height: number;
    title: Renderable;
    matrix: string[][];

    static color = new Map([
        ['black', '\x1b[38;2;255;255;255m'],
        ['white', '\x1b[48;2;0;0;0m'],
        ['yellow', '\x1b[48;2;255;255;0m'],
    ]);

    constructor(width = 80, height = 50) {
        this.width = width;
        this.height = height;
        this.title = new Renderable('');
        this.matrix = [];
        this.clear();
    }

    setTitle(title: string, fg: string = 'white', bg: string = 'black'): void {
        this.title = new Renderable(title, fg, bg);
    }

    drawRenderable(point: Point, render: Renderable) {
        let d = this.renderString(render);
        this.matrix[point.y][point.x] = d;
    }

    drawWorld(world: World) {
        let map = new Map([
            [Tile.Floor, new Renderable(' ')],
            [Tile.Wall, new Renderable('#')],
        ]);
        world.iterateMap(new Point(), new Point(this.width, this.height), (val, point) => {
            let render = map.get(val);
            if (render) {
                this.drawRenderable(point, render);
            } else {
                console.warn('Can not draw tile ' + val);
            }
        });
    }

    private renderString(render: Renderable): string {
        let fg = Context.color.get(render.fg);
        let bg = Context.color.get(render.bg);
        let style = `${fg}${bg}`;
        return style + render.glyph;
    }

    build(clear:boolean = false): void {
        clear && console.clear();
        this.buildTitle();
        this.matrix.forEach(row => console.log(row.join('')));
        this.clear();
    }

    buildTitle(): void {
        let fg = Context.color.get(this.title.fg);
        let bg = Context.color.get(this.title.bg);
        let style = `${fg}${bg}`;
        console.log(style);
        console.log(this.title.glyph);
    }

    clear(): void {
        this.matrix = [];
        for (let i = 0; i < this.height; i++) {
            let row: string[] = [];
            for (let j = 0; j < this.width; j++) {
                row.push(' ');
            }
            this.matrix.push(row);
        }
        console.log('\x1b[0m');
    }

    listenInput(call: (evt:KeyEvent) => void, timer:any) {
        const keypress = require('keypress');
        keypress(process.stdin);
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.ctrl && key.name == 'c') {
                process.stdin.pause();
                clearInterval(timer);
            } else {
                call({ key: key ? key.name : ch, shift: false, crtl: false, alt: false });
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}


enum CommandState { On, Active, Deactivating, Off };
interface KeyEvent { key: string, shift: boolean, crtl: boolean, alt: boolean };

interface Command { name: string, state: CommandState, processed: boolean };

class Game {

    context: Context;
    world: World;
    rand: Random;
    components: Component[];
    commands: Map<string, Command>;
    count_turns = 0;
    running = false;
    drawing = true;

    constructor(width = 20, height = 15, seed = 0) {
        this.rand = new Random(seed);
        this.context = new Context(width, height);
        this.context.setTitle('Powers - Rogue Like\n');
        this.world = new World(width, height);
        this.components = [];
        this.commands = new Map([
            ['w', { name: 'up', state: CommandState.Off, processed: false }],
            ['a', { name: 'left', state: CommandState.Off, processed: false }],
            ['d', { name: 'right', state: CommandState.Off, processed: false }],
            ['s', { name: 'down', state: CommandState.Off, processed: false }],
            ['i', { name: 'action_x', state: CommandState.Off, processed: false }],
            ['j', { name: 'action_y', state: CommandState.Off, processed: false }],
            ['l', { name: 'action_a', state: CommandState.Off, processed: false }],
            ['k', { name: 'action_b', state: CommandState.Off, processed: false }],
            ['q', { name: 'action_l', state: CommandState.Off, processed: false }],
            ['e', { name: 'action_r', state: CommandState.Off, processed: false }],
            ['space', { name: 'confirm', state: CommandState.Off, processed: false }],
            ['escape', { name: 'cancel', state: CommandState.Off, processed: false }],
            ['enter', { name: 'select', state: CommandState.Off, processed: false }],
        ]);
    }

    start() {
        this.components.forEach(comp => comp.on_start);
        this.running = true;
    }

    update() {
        for (let comp of this.components) {
            this.commands.forEach(c => {
                if (!c.processed) {
                    if (c.state === CommandState.Off) {
                        c.processed = !comp.on_command_up(c.name);
                    } else if (c.state === CommandState.Active) {
                        c.processed = !comp.on_command_pressed(c.name);
                    } else if (c.state === CommandState.On) {
                        c.processed = !comp.on_command_down(c.name);
                    }
                }
            });
            comp.update(this.count_turns);
        }
        this.count_turns++;
    }

    show() {
        this.context.drawWorld(this.world);
        for (let comp of this.components) {
            this.context.drawRenderable(comp.position, comp.render);
        }
        this.context.build(true);
        this.context.clear();
    }

    main_loop() {
        this.suspendInput();
        this.drawing && this.show();
        this.running && this.update();
        this.commands.forEach(command => {
            if (command.state == CommandState.Deactivating) {
                command.state = CommandState.Off;
            }
            if (command.state === CommandState.On) {
                command.state = CommandState.Active;
            }
            if (command.state === CommandState.Active) {
                command.state = CommandState.Deactivating;
            }
            command.processed = false;
        });
        this.resumeInput();
    }

    freeze(){
        this.drawing = false;
    }

    unfreeze(){
        this.drawing = true;
    }

    suspend() {
        this.running = false;
    }

    resume() {
        this.running = true;
    }

    suspendInput() {
        process.stdin.pause();
    }

    resumeInput() {
        process.stdin.resume();
    }

    bindKeyCommand(key: string, command: string) {
        this.commands.set(key, { name: command, state: CommandState.Off, processed: false });
    }

    keyPressed(evt: KeyEvent) {
        let command = this.commands.get(evt.key);
        if (command) {
            if (command.state === CommandState.Off) {
                command.state = CommandState.On;
            } else if (command.state === CommandState.Deactivating) {
                command.state = CommandState.Active;
            }
        }
    }

    run() {
        this.start();
        let timer = setInterval(this.main_loop.bind(this), 100);
        this.context.listenInput(this.keyPressed.bind(this), timer);
    }
}


let game = new Game();
game.world.makeBoundariesWalls();
game.world.makeRandomWalls(game.rand);
let point = game.world.getRandomPosition(game.rand, Tile.Floor);
let player = new Player(point, new Renderable('@', 'yellow'), game);
game.components.push(player);
game.run();
