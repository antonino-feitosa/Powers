
import { trianglePixels, Point } from './Algorithms2D';

let mat = new Array();
for (let i = 0; i < 20; i++) {
    let row = new Array(20);
    row.fill('_  ');
    mat.push(row);
}

let i = 0;
trianglePixels({x:5, y:0}, {x:0, y:5}, {x:10, y:12} , (p:Point) => {
    console.log(p);
    mat[p.y][p.x] = i < 10 ? i++ + '  ' :  i++ + ' ';
});

/*tringlePixels({ x: 5, y: 5 }, {x: 2, y:10}, {x:12, y: 10}, (p:Point) => {
    console.log(p);
    mat[p.y][p.x] = '#';
});*/


mat.forEach(row => console.log(row.join('  ')));