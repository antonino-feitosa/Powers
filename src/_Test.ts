
import { tringlePixels, Point } from './Algorithms2D';

let mat = new Array();
for (let i = 0; i < 20; i++) {
    let row = new Array(20);
    row.fill('_  ');
    mat.push(row);
}

tringlePixels({x:5, y:0}, {x:0, y:10}, {x: 15, y:0} , (p:Point) => {
    console.log(p);
    mat[p.y][p.x] = '#  ';
});

/*tringlePixels({ x: 5, y: 5 }, {x: 2, y:10}, {x:12, y: 10}, (p:Point) => {
    console.log(p);
    mat[p.y][p.x] = '#';
});*/


mat.forEach(row => console.log(row.join('  ')));