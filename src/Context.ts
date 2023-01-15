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
        pushInRange(this.matrix, 0, height, _ => {
            let row: string[] = [];
            pushInRange(row, 0, width, _ => back);
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
        this.matrix.forEach(row => row.fill(back));
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
