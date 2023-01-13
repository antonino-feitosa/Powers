
import { Random } from './Random';

interface dimension { width: number, height: number };
interface point { x: number, y: number };
interface Room { id: number, pos: point, dim: dimension, center: point };

type mapCallback = (value: number, position: point) => void;

enum Tile {
    START = 10,
    END = 11,
    CORRIDOR = 12,
    DOOR = 13,
    WALL = 0,
    BORDER = 1,
    EMPTY = 2
}

class Map {

    bounds: dimension;

    endPoint: point = { x: 0, y: 0 };
    startPoint: point = { x: 0, y: 0 };
    matrix: number[][] = [];

    constructor(bounds: dimension = { width: 120, height: 20 }) {
        this.bounds = bounds;

        for (let y = 0; y < bounds.height; y++) {
            let array: number[] = [];
            for (let x = 0; x < bounds.width; x++) {
                array.push(Tile.WALL);
            }
            this.matrix.push(array);
        }
    }

    iterateDim(start: point, end: point, call: mapCallback): void {
        if (start.x === end.x) { // vertical
            if (start.y > end.y) {
                console.warn('The start y must be minor than the end (%d, %d) (%d, %d)', start.x, start.y, end.x, end.y);
            }
            for (let y = start.y; y < end.y; y++) {
                call(this.matrix[y][start.x], { x: start.x, y: y });
            }
        } else if (start.y === end.y) { // horizontal
            if (start.x > end.x) {
                console.warn('The start x must be minor than the end (%d, %d) (%d, %d)', start.x, start.y, end.x, end.y);
            }
            for (let x = start.x; x < end.x; x++) {
                call(this.matrix[start.y][x], { x: x, y: start.y });
            }
        } else {
            console.warn('The points must have a common coordinate (%d, %d) (%d, %d)', start.x, start.y, end.x, end.y);
        }
    }

    iterate(p: point, dim: dimension, call: mapCallback): void {
        for (let y = p.y; y < p.y + dim.height; y++) {
            for (let x = p.x; x < p.x + dim.width; x++) {
                call(this.matrix[y][x], { x: x, y: y });
            }
        }
    }

    iterateBorder(pos: point, dim: dimension, call: mapCallback): void {
        this.iterateDim(pos, { x: pos.x + dim.width, y: pos.y }, call); // up 
        this.iterateDim({ x: pos.x, y: pos.y + dim.height - 1 }, { x: pos.x + dim.width, y: pos.y + dim.height - 1 }, call); // down
        this.iterateDim({ x: pos.x, y: pos.y + 1 }, { x: pos.x, y: pos.y + dim.height - 1 }, call); // left
        this.iterateDim({ x: pos.x + dim.width - 1, y: pos.y + 1 }, { x: pos.x + dim.width - 1, y: pos.y + dim.height - 1 }, call); // right
    }

    neighbor(pos: point, call: mapCallback): void {
        [-1, 0, 1].forEach(y =>
            [-1, 0, 1].forEach(x => {
                let current: point = { x: x + pos.x, y: y + pos.y };
                if(current.x >= 0 && current.x < this.bounds.width && current.y >= 0 && current.y < this.bounds.height){
                    call(this.matrix[current.y][current.x], current);
                }
            })
        );
    }

    show() {
        let str: string = "";
        this.iterate({ x: 0, y: 0 }, this.bounds, (value, pos) => {
            switch (value) {
                case Tile.WALL: str += '.'; break;
                case Tile.BORDER: str += '#'; break;
                case Tile.EMPTY: str += ' '; break;
                case Tile.START: str += 'S'; break;
                case Tile.END: str += 'E'; break;
                case Tile.CORRIDOR: str += 'C'; break;
                case Tile.DOOR: str += 'D'; break;
            }
            if (pos.x === this.bounds.width - 1) {
                str += '\n';
            }
        });
        console.log(str);
    }

    setTile(pos: point, display: Tile) {
        this.matrix[pos.y][pos.x] = display;
    }
}


class MapGenerator {

    static randPos(bounds: dimension, min: point = { x: 0, y: 0 }, rand: Random): point {
        let x = rand.nextRange(min.x, bounds.width);
        let y = rand.nextRange(min.y, bounds.height);
        return { x: x, y: y };
    }

    static randDim(dim: dimension, min: dimension = { width: 5, height: 5 }, rand: Random): dimension {
        let r = this.randPos(dim, { x: min.width, y: min.height }, rand);
        return { width: r.x, height: r.y };
    }

    static simpleAlgorithm(map: Map, roomBounds: dimension = { width: 20, height: 10 }, minDim = { width: 8, height: 8 }, rand = new Random(1)) {

        let bounds = map.bounds;

        let numFails = 100;

        let roomList: Room[] = [];

        while (numFails) {
            let room = this.randDim(roomBounds, minDim, rand);
            let pos = this.randPos({ width: bounds.width - 1 - room.width, height: bounds.height - 1 - room.height }, { x: 1, y: 1 }, rand);
            let isFree = true;
            map.iterate(pos, room, value => isFree = value === Tile.WALL && isFree);
            if (isFree) {
                map.iterate(pos, room, (_, pos) => map.setTile(pos, Tile.EMPTY));
                //map.iterateBorder(pos, room, (_, pos) => map.setTile(pos, Tile.BORDER));
                let center: point = { x: Math.floor(pos.x + room.width / 2), y: pos.y + Math.floor(room.height / 2) };
                roomList.push({ id: roomList.length, pos: pos, dim: room, center: center });
            } else {
                numFails--;
            }
        }

        this.makeGraph(map, roomList);
        this.setStartEnd(map, roomList, rand);
        this.makeBorder(map);
    }

    static makeBorder(map: Map) {
        map.iterate({ x: 0, y: 0 }, map.bounds, (value, pos) => {
            if (value == Tile.WALL) {
                let isWall: boolean = false;
                map.neighbor(pos, value => value === Tile.EMPTY && (isWall = true));
                isWall && map.setTile(pos, Tile.BORDER);
            }
        });
    }

    static setStartEnd(map: Map, roomList: Room[], rand: Random) {
        let distance = (p1: point, p2: point) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
        let reference = this.randPos(map.bounds, { x: 0, y: 0 }, rand);
        let sortFunction = (r1: Room, r2: Room) => distance(reference, r1.center) - distance(reference, r2.center);

        let sorted = roomList.sort(sortFunction);
        let start = sorted[0];
        let end = sorted[sorted.length - 1];
        map.setTile(start.center, Tile.START);
        map.setTile(end.center, Tile.END);
    }

    static makeGraph(map: Map, roomList: Room[]) {
        let distance = (p1: point, p2: point) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
        let graph: number[] = [];
        roomList.forEach(room => graph[room.id] = room.id);

        roomList.forEach(room => {
            let others = roomList.filter(r => graph[room.id] != graph[r.id]);
            if (others.length > 0) {
                others.sort((r1, r2) => distance(r1.center, room.center) - distance(r2.center, room.center));
                let closest = others[0];
                this.connect(map, room, closest);
                let id = graph[closest.id];
                graph.forEach((v, i) => v === id && (graph[i] = graph[room.id]));
            }
        })
    }

    static connect(map: Map, r1: Room, r2: Room) {
        let setCoor = (v: Tile, pos: point) => map.setTile(pos, Tile.EMPTY);

        let mid: point = { x: r2.center.x, y: r1.center.y };

        let l: point, r: point, u: point, d: point;
        [l, r] = r1.center.x < mid.x ? [r1.center, mid] : [mid, r1.center];
        [u, d] = r2.center.y < mid.y ? [r2.center, mid] : [mid, r2.center];

        map.iterateDim(l, { x: r.x + 1, y: r.y }, (v, pos) => setCoor(v, pos));
        map.iterateDim(u, d, (v, pos) => setCoor(v, pos));

        let border = (_: number, pos: point) =>
            map.neighbor(pos, (v, p) => v === Tile.WALL
                && (map.setTile(p, Tile.BORDER)));
        //map.iterateDim(l, r, border);
        //map.iterateDim(u, d, border);
    }
}




let map: Map = new Map({ width: 130, height: 50 });
MapGenerator.simpleAlgorithm(map, { width: 10, height: 6 }, { width: 9, height: 5 }, new Random(3));
map.show();

