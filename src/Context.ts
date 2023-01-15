

import { pushInRange } from './Utils';

interface Point { x: number, y: number };

export class Context {

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
        pushInRange<string[]>(this.matrix, 0, height, _ => {
            let row: string[] = [];
            pushInRange<string>(row, 0, width, _ => back);
            return row;
        });
    }

    static _applyColor(text: string, fg: string = 'white', bg: string = 'black') {
        let fgColor = Context.color.get(fg);
        let bgColor = Context.color.get(bg);
        return `\x1b[38;2;${fgColor}m\x1b[48;2;${bgColor}m` + text;
    }

    render(pos: Point, glyph: string, fg: string, bg: string) {
        this.matrix[pos.y][pos.x] = Context._applyColor(glyph, fg, bg);
    }

    build(): void {
        this.clearBuffer && process.stdout.write(`\x1b[${this.height+1}A`); // move to start
        this.matrix.forEach(row => console.log(row.join('')));
        this.clear();
    }

    clear(): void {
        let back = Context._applyColor(' ', this.foreground, this.background);
        this.matrix.forEach(row => row.fill(back));
    }

    dispose(timer?: any) {
        process.stdin.pause();
        timer && clearInterval(timer);
        process.stdout.write('\x1b[0m'); // reset colors and modes
        process.stdout.write('\u001b[?25h'); // restore cursor (ANSI escape sequence)
    }

    listenInput(call: (unicode: string, name?: string) => void, timer?: any) {
        let codeToName = new Map<string, string>([
            ['\u0003', 'ctrl+c'],
            ['\u000D', 'enter'],
            ['\u001B', 'escape'],
            ['\u0020', 'space'],
            ['\u001B\u005B\u0041', 'up'],
            ['\u001B\u005B\u0042', 'down'],
            ['\u001B\u005B\u0043', 'right'],
            ['\u001B\u005B\u0044', 'left']
        ]);

        if (process.stdin.isTTY) {
            const dispose = this.dispose.bind(this);
            process.stdin.on('data', function (key) {
                if (typeof key === 'string') {
                    let name = codeToName.get(key);
                    if (name === 'ctrl+c') {
                        dispose(timer);
                    }
                    call(key, name);
                }
            });
            process.stdin.setEncoding('utf8');
            process.stdin.setRawMode(true); // input whitout enter
            process.stdin.resume(); // waiting input (process.exit() or process.pause())
        } else {
            console.error('Can not start listen input! It requires TTY console.')
        }
    }
}
