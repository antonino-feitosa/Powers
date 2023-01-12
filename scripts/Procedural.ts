
import { Random } from './Random';

interface dimension { width: number, height: number };
interface point { x: number, y: number };

let bounds: dimension = { width: 120, height: 20 };
let roomBounds: dimension = { width: 20, height: 10 };
let matrix: number[][] = [];

const START = 10;
const END = 11;
const WALL = 0;
const BORDER = 1;
const EMPTY = 2;

let rand = new Random(1);

for (let y = 0; y < bounds.height; y++) {
    let array: number[] = [];
    for (let x = 0; x < bounds.width; x++) {
        array.push(WALL);
    }
    matrix.push(array);
}


function randPos(bounds: dimension, min: point = { x: 0, y: 0 }): point {
    let x = rand.nextRange(min.x, bounds.width);
    let y = rand.nextRange(min.y, bounds.height);
    return { x: x, y: y };
}

function randDim(dim: dimension, min: dimension = { width: 5, height: 5 }): dimension {
    let r = randPos(dim, { x: min.width, y: min.height });
    return { width: r.x, height: r.y };
}

function matrixDimIterate(start: point, end: point, call: (value: number, position: point) => void): void {
    if (start.x === end.x) { // vertical
        for (let y = start.y; y < end.y; y++) {
            call(matrix[y][start.x], { x: start.x, y: y });
        }
    } else { // vertical
        for (let x = start.x; x < end.x; x++) {
            call(matrix[start.y][x], { x: x, y: start.y });
        }
    }
}

function matrixIterate(p: point, dim: dimension, call: (value: number, postion: point) => void): void {
    for (let y = p.y; y < p.y + dim.height; y++) {
        for (let x = p.x; x < p.x + dim.width; x++) {
            call(matrix[y][x], { x: x, y: y });
        }
    }
}

function matrixIterateBorder(pos: point, dim: dimension, call: (value: number, position: point) => void):void {
    matrixDimIterate(pos, { x: pos.x + dim.width, y: pos.y }, call); // up 
    matrixDimIterate({ x: pos.x, y: pos.y + dim.height - 1 }, { x: pos.x + dim.width, y: pos.y + dim.height - 1 }, call); // down
    matrixDimIterate({ x: pos.x, y: pos.y + 1 }, { x: pos.x, y: pos.y + dim.height }, call); // left
    matrixDimIterate({ x: pos.x + dim.width - 1, y: pos.y + 1 }, { x: pos.x + dim.width - 1, y: pos.y + dim.height }, call); // right
}

function matrixNeighbor(pos: point, call: (value: number, position: point) => void):void {
    let x = [-1, 0, 1];
    let y = [-1, 0, 1];
    [-1, 0, 1].forEach(y =>
        [-1, 0, 1].forEach(x => {
            let current: point = { x: x + pos.x, y: y + pos.y };
            call(matrix[current.y][current.x], current);
        })
    );
}

function matrixShow() {
    let str: string = "";
    matrixIterate({ x: 0, y: 0 }, bounds, (value, pos) => {
        switch (value) {
            case WALL: str += '.'; break;
            case BORDER: str += '#'; break;
            case EMPTY: str += ' '; break;
            case START: str += 'S'; break;
            case END: str += 'E'; break;
        }
        if (pos.x == bounds.width - 1) {
            str += '\n';
        }
    });
    console.log(str);
}

function drawCorridor(r1: Room, r2: Room) {
    let mid: point = { x: r1.center.x, y: r2.center.y };
    let d1: point, d2: point, d3: point, d4: point;
    [d1, d2] = r1.center.y < mid.y ? [r1.center, mid] : [mid, r1.center];
    [d3, d4] = mid.x < r2.center.x ? [mid, r2.center] : [r2.center, mid];
    matrixDimIterate(d1, d2, (_, pos) => matrix[pos.y][pos.x] = EMPTY);
    matrixDimIterate(d3, d4, (_, pos) => matrix[pos.y][pos.x] = EMPTY);

    let border = (_:number, pos:point) => matrixNeighbor(pos, (v, p) => v === WALL && (matrix[p.y][p.x] = BORDER));
    matrixDimIterate(d1, d2, border);
    matrixDimIterate(d3, d4, border);
    
}

let numFails = 100;

interface Room { pos: point, dim: dimension, center: point, connected: boolean };
let roomList: Room[] = [];

while (numFails) {
    let room = randDim(roomBounds);
    let pos = randPos({ width: bounds.width - 1 - room.width, height: bounds.height - 1 - room.height }, { x: 1, y: 1 });
    let isFree = true;
    matrixIterate(pos, room, value => isFree = value === WALL && isFree);
    if (isFree) {
        matrixIterate(pos, room, (_, pos) => matrix[pos.y][pos.x] = EMPTY);
        matrixIterateBorder(pos, room, (_, pos) => matrix[pos.y][pos.x] = BORDER);
        let center: point = { x: Math.floor(pos.x + room.width / 2), y: pos.y + Math.floor(room.height / 2) };
        roomList.push({ pos: pos, dim: room, center: center, connected: false });
    } else {
        numFails--;
    }
}

let distance = (p1: point, p2: point) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
let sorted = roomList.sort((r1, r2) => r1.center.x - r2.center.x);
let start = sorted[0];
let end = sorted[sorted.length - 1];
matrix[start.center.y][start.center.x] = START;
matrix[end.center.y][end.center.x] = END;

roomList.forEach(room => {
    room.connected = true;
    let others = roomList.filter(room => !room.connected);
    if (others.length > 0) {
        others.sort((r1, r2) => distance(r1.center, room.center) - distance(r2.center, room.center));
        let closest = others[0];
        drawCorridor(room, closest);
        closest.connected = true;
    }
})

matrixShow();
