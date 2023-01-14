


console.log('Test Line 1');
console.log('\x1b[2JTest Line 2');
console.log('Test Line 3');

/*

Position the Cursor: \033[<L>;<C>H or \033[<L>;<C>f (puts the cursor at line L and column C)

    Move the cursor up N lines: \033[<N>A
    Move the cursor down N lines: \033[<N>B
    Move the cursor forward N columns: \033[<N>C
    Move the cursor backward N columns: \033[<N>D
    Clear the screen, move to (0,0): \033[2J
    Erase to end of line: \033[K
    Save cursor position: \033[s
    Restore cursor position: \033[u
*/















function testSeq(){

function seq(min: number, max: number, step = 1): number[] {
    return Array(max - min).fill(1).map((_,index) => min + step * index);
}

let x = seq(0, 10, 1);
console.log(x);
}







function textColor() {

    let rgb: number[] = [255, 255, 255];

    let fg: string = '\x1b[38;2;255;255;0m';

    let bg: string = '\x1b[48;2;0;0;0m';

    let text: string = 'title text';

    console.log(`${fg}${bg}%s`, text);

    console.log('\x1b[38;2;255;255;255mString');

    console.log('\x1b[0m');
}

