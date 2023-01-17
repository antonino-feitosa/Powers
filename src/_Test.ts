
import {Point, calculateFOV} from './View';

let mat:string[][] = [];
for(let i=0;i<20;i++){
    let row:string[] = Array.from({length:20});
    row.fill('#');
    mat.push(row);
}
let opaque = (p:Point) => mat[p.y][p.x] === 'B';

//mat[8][10] = 'B';
mat[8][9] = 'B';
mat[11][9] = 'B';
mat[11][12] = 'B';

calculateFOV(opaque, {x:10,y:10}, 9, (pos:Point, light:number) => {
    if(light > 0){
        mat[pos.y][pos.x] = ' ';
    }
});

mat[10][10] = '@';


mat.forEach(row => console.log(row.join(' ')));