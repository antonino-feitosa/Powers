
"use strict";

const { range } = require('./Utils');

const Context = {

    with(width = 80, height = 50) {
        this.width = width;
        this.height = height;

        this.background = 'black';
        this.foreground = 'white';
        this.fog = false;
        this.clearBuffer = true;

        let bg = Context._applyColor(' ', this.foreground, this.background);
        this.matrix = [];
        range(0, height, _ => {
            let row = [];
            range(0, width, () => row.push(bg));
            this.matrix.push(row);
        });
        return this;
    },

    start() {
        this.clearBuffer && process.stdout.write('\u001b[?1049h'); // enable alternative buffer
        this.clearBuffer && process.stdout.write('\u001b[?25l'); // hide cursor
    },

    render(x, y, glyph, fg, bg) {
        this.matrix[y][x] = Context._applyColor(glyph, fg, bg);
    },

    build() {
        this.clearBuffer && process.stdout.write(`\x1b[${this.height + 2}A`); // move to start
        this.matrix.forEach(row => console.log(row.join('')));
        this.clear();
    },

    clear() {
        let back = Context._applyColor(' ', this.foreground, this.background);
        this.matrix.forEach(row => row.fill(back));
    },

    dispose(timer) {
        process.stdin.pause();
        timer && clearInterval(timer);
        process.stdout.write('\x1b[0m'); // reset colors and modes
        process.stdout.write('\u001b[?25h'); // restore cursor (ANSI escape sequence)
    },

    listenInput(call, timer = null) {
        if (process.stdin.isTTY) {
            const dispose = this.dispose.bind(this);
            process.stdin.on('data', function (key) {
                if (typeof key === 'string') {
                    let name = Context.CodeToName.get(key);
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

Context.CodeToName = new Map([
    ['\u0003', 'ctrl+c'],
    ['\u000D', 'enter'],
    ['\u001B', 'escape'],
    ['\u0020', 'space'],
    ['\u0008', 'tab'],
    ['\u000F', 'shift-in'],
    ['\u000E', 'shift-out'],
    ['\u0020', 'space'],
    ['\u001B\u005B\u0041', 'up'],
    ['\u001B\u005B\u0042', 'down'],
    ['\u001B\u005B\u0043', 'right'],
    ['\u001B\u005B\u0044', 'left']
]);

Context.Color = new Map([
    ['black', '000000'],
    ['white', 'FFFFFF'],
    ['yellow', 'FFFF00'],
    ['green', '00FF00'],
    ['blue', '0000FF'],
    ['red', 'FF0000'],
    ['grey', '808080']
]);

Context._applyColor = function (text, fg = 'white', bg = 'black') {
    let fgColor = Context.Color.get(fg);
    let bgColor = Context.Color.get(bg);
    let convert = (c) => {
        let r = parseInt(c.substring(0, 2), 16);
        let g = parseInt(c.substring(2, 4), 16);
        let b = parseInt(c.substring(4, 6), 16);
        return r + ';' + g + ';' + b;
    };
    fgColor = convert(fgColor ? fgColor : '000000');
    bgColor = convert(bgColor ? bgColor : '000000');
    return `\x1b[38;2;${fgColor}m\x1b[48;2;${bgColor}m` + text;
}

module.exports = {
    Context
}
