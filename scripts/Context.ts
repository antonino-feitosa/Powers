import { Point, Layer, Tile } from './MapManager';
import { Renderable } from './Component';

export interface KeyEvent { key: string, shift: boolean, crtl: boolean, alt: boolean };

export class Context {

    width: number;
    height: number;
    title: Renderable;
    matrix: string[][];

    static color = new Map([
        ['black', '0;0;0'],
        ['white', '255;255;255'],
        ['yellow', '255;255;0'],
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

    drawLayer(world: Layer) {
        let map = new Map([
            [Tile.Floor, new Renderable(' ', 'white', 'black')],
            [Tile.Wall, new Renderable('#', 'white', 'black')],
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

    renderString(render: Renderable): string {
        let fg = Context.color.get(render.fg);
        let bg = Context.color.get(render.bg);
        let style = `\x1b[38;2;${fg}m\x1b[48;2;${bg}m`;
        return style + render.glyph;
    }

    build(clear: boolean = false): void {
        clear && console.clear();
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
            } else {
                call({ key: key ? key.name : ch, shift: false, crtl: false, alt: false });
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}
