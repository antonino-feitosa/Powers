
import {circlePixels} from './Pixels';

let mat = new Array();
for(let i=0;i<20;i++){
    let row = new Array(20);
    row.fill(0);
    mat.push(row);
}

let points = circlePixels({x:10, y:10}, 8);

points.forEach(({x, y}) => mat[y][x] = 1);


mat.forEach(row => console.log(row.join('  ')));