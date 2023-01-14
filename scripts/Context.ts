import { Point, Layer, Tile, Cell } from './MapManager';
import { Renderable } from './Component';

export interface KeyEvent { key: string, shift: boolean, crtl: boolean, alt: boolean };

export class Context {

    width: number;
    height: number;
    title: Renderable;
    matrix: string[][];
    fog: boolean;
    clearBuffer: boolean;

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
        this.title = new Renderable('');
        this.matrix = [];
        this.fog = true;
        this.clearBuffer = false;
        this.clear();
    }

    setTitle(title: string, fg: string = 'white', bg: string = 'black'): void {
        this.title = new Renderable(title, fg, bg);
    }

    drawRenderable(point: Point, render: Renderable) {
        let d = this.renderString(render);
        this.matrix[point.y][point.x] = d;
    }

    drawLayer(world: Layer) {
        if (this.fog) {
            world.revealed.forEach(c => this.drawTile(c));
            world.visibles.forEach(c => this.drawTile(c, true));
        } else {
            world.iterate(c => this.drawTile(c));
        }
    }

    drawTile(cell: Cell, isVisible: boolean = false): void {
        let render = cell.render;
        let point = cell._point;
        let fg = Context.color.get(isVisible ? 'yellow' : render.fg);
        let bg = Context.color.get(render.bg);
        let style = `\x1b[38;2;${fg}m\x1b[48;2;${bg}m`;
        this.matrix[point.y][point.x] = style + render.glyph;
    }

    renderString(render: Renderable): string {
        let fg = Context.color.get(render.fg);
        let bg = Context.color.get(render.bg);
        let style = `\x1b[38;2;${fg}m\x1b[48;2;${bg}m`;
        return style + render.glyph;
    }

    start():void{
        // clear and reset
        process.stdout.write('\x1b[2J');
        // hide cursor
        process.stdout.write('\u001b[?25l');
    }

    build(): void {
        if(this.clearBuffer){
            //process.stdout.write(`\x1b[${this.height+2}A`);
            //process.stdout.write(`\x1b[2J`);
            process.stdout.write(`\x1b[${this.height+5}A`);
        }
        let titleRender = this.renderString(this.title);
        console.log(titleRender);
        this.matrix.forEach(row => console.log(row.join('')));
        this.clear();
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

    listenInput(call: (evt: KeyEvent) => void, timer: any) {
        const keypress = require('keypress');
        keypress(process.stdin);
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.ctrl && key.name == 'c') {
                process.stdin.pause();
                clearInterval(timer);
                // restore cursor (ANSI escape sequence)
                console.log('\u001b[?25h');
            } else {
                call({ key: key ? key.name : ch, shift: false, crtl: false, alt: false });
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}
