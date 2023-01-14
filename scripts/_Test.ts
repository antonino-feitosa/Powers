



function testSeq(){

function seq(min: number, max: number, step = 1): number[] {
    return Array(max - min).fill(1).map((_,index) => min + step * index);
}

let x = seq(0, 10, 1);
console.log(x);
}







//function textColor() {

    let rgb: number[] = [255, 255, 255];

    let fg: string = '\x1b[38;2;255;255;0m';

    let bg: string = '\x1b[48;2;0;0;0m';

    let text: string = 'title text';

    console.log(`${fg}${bg}%s`, text);

    console.log('\x1b[38;2;255;255;255mString');

    console.log('\x1b[0m');
//}

