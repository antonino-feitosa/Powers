
const { range } = require('./Utils');
const { Point } = require('./Grid');
const { DijkstraMap } = require('./DijkstraMap');

Point.with(20, 20);
let map = [];
let obstacle = [];
for (let i = 0; i < Point.height; i++) {
    obstacle[i] = new Array(Point.width).fill(0);
    map[i] = new Array(Point.width).fill('    .');
}

for (let i = 10; i < Point.height; i++) {
    for (let j = 0; j < 10; j++) {
        obstacle[i][j] = 1;
    }
}

//map.forEach(row => console.log(row.join(' ')));

function canMove(p){
    let [x, y] = Point.to2D(p);
    return obstacle[y][x] === 0;
}

let indexes = [];
range(0, Point.width * Point.height, index => indexes.push(index));
indexes = indexes.filter(p => canMove(p));

DijkstraMap.with(new Map([[Point.from(3, 3), 0]]));
DijkstraMap.neighborhood = function (p) { return Point.neighborhood(p).filter(p => canMove(p));};
DijkstraMap.cost = function (u, v) {
    let [x1, y1] = Point.to2D(u);
    let [x2, y2] = Point.to2D(v);
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}
DijkstraMap.calculate(indexes);

DijkstraMap.makeFleeMap(-1.2);
DijkstraMap.fleeMap.dist.forEach((val, key) => {
    let [x, y] = Point.to2D(key);
    //let v = '      ' + (neigh.includes(key) ?  (val).toFixed(1) :' ' );
    let v = '      ' + (val).toFixed(1);
    map[y][x] = v.substring(v.length - 5);
});

let start = Point.from(0, 3);
for (let i = 0; i < 20; i++) {
    start = DijkstraMap.flee(start);
    let [x, y] = Point.to2D(start);
    map[y][x] = '    P';
}
map[3][3] = '   @ ';

map.forEach(row => console.log(row.join(' ')));
