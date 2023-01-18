
import { Random } from './Random';
import { DijkstraMap } from './DijkstraMap';

let width = 10;
let height = 10;

let map: string[][] = [];
for (let i = 0; i < height; i++) { let row: string[] = new Array(width); row.fill(' '); map.push(row); }
let rand = new Random(0);


let grid: number[] = [];
let dist:Map<number,number> = new Map();
map.forEach((row, y) => row.forEach((_, x) => {
    rand.nextDouble() < 0.2 && (map[y][x] = '#');
    let index = y * width + x;
    grid.push(index);
    dist.set(index, 1 * 99);
}));


map[2][2] = '@';
map[3][0] = 'O';
map[7][7] = 'O';
//map[17][7] = 'O';

let dmap = new DijkstraMap(grid, distance, neighbor);
dmap.sources.set(posToIndex(3, 0), 0);
dmap.sources.set(posToIndex(7, 7), 0);
dmap.calculate();


map.forEach(row => console.log('|' + row.join(' ') + '|'));

map.forEach((row, y) => {
    let str = '|';
    row.forEach((_, x) => {
        let v = dmap.dist.get(posToIndex(x, y));
        let inc = ((v || 0) * -1.6).toFixed(1) + ' ';
        while (inc.length < 6) {
            inc = ' ' + inc;
        }
        //inc = v === 99 ? '    # ' : inc;
        if (map[y][x] === '@') {
            inc = '    @ '
        } else if (map[y][x] === 'O') {
            inc = '    O '
        }
        str += inc;
    })
    console.log(str + '|');
});



function posToIndex(x: number, y: number) {
    return y * width + x;
}

function indexToPos(index: number) {
    return [index % width, Math.floor(index / width)];
}

export function distance(v: number, u: number) {
    let [x1, y1] = indexToPos(v);
    let [x2, y2] = indexToPos(u);
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function neighbor(v: number) {
    let xs = [-1, +1, +0, +0];//, -1, -1, +1, +1];//[-1, -1, -1, 0, 0, 1, 1, 1];
    let ys = [+0, +0, -1, +1];//, -1, +1, -1, -1];//[-1, 0, 1, -1, 1, -1, 0, 1];
    let [x, y] = indexToPos(v);
    let indexes: number[] = [];
    for (let i = 0; i < xs.length; i++) {
        let fx = x + xs[i];
        let fy = y + ys[i];
        let id = posToIndex(fx, fy);
        if (map[fy] && map[fy][fx]) {
            indexes.push(id);
        }
    }
    return indexes;
}

/*
export function dijkstra(dist: Map<number, number> = new Map(), distance: (v: number, u: number) => number, neighbor: (v: number) => number[]) {
    let queue: number[] = [];
    let prev: number[] = [];
    dist.forEach((_, v) => {
        prev[v] = v;
        queue.push(v);
    });

    while (queue.length > 0) {
        let min = queue.reduce((min, val, index) => (dist.get(val) || 0) < (dist.get(min) || 0) ? index : min, 0);
        let u = queue[min];
        queue[min] = queue[queue.length - 1];
        queue.length--;

        neighbor(u).forEach(v => {
            let alt = (dist.get(u) || 0) + distance(u, v);
            if (alt < (dist.get(v) || 0)) {
                dist.set(v, alt);
                prev[v] = u;
            }
        });
    }
}
*/