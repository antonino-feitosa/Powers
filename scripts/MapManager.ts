

import { Random } from './Random';

export enum Tile {
    Wall,
    Floor
}

export type mapCallback = (value: number, position: Point) => void;

function range(min: number, max: number, step = 1): number[] {
    let arr = Array(max - min).fill(1);
    return arr.map((_, index) => min + step * index);
}

export class Point {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    copy(point: Point) {
        this.x = point.x;
        this.y = point.y;
    }
}

export class Rectangle {
    start: Point;
    end: Point;

    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.start = new Point(x, y);
        this.end = new Point(x + width, y + height);
    }

    overlaps(other: Rectangle): boolean {
        if (this.start.x > other.end.x || this.end.x < other.start.x) {
            return false;
        }
        if (this.start.y > other.end.y || this.end.y < other.start.y) {
            return false;
        }
        return true;
    }

    center(): Point {
        return new Point(Math.floor((this.start.x + this.end.x) / 2), Math.floor((this.start.y + this.end.y) / 2));
    }
}


interface RoomGenerator {

    make: () => Layer;
}

class MapGenerator {

    width: number;
    height: number;
    rand: Random;

    constructor(width:number, height:number, rand:Random) {
        this.width = width;
        this.height = height;
        this.rand = rand;
    }

    make(): Layer {
        let layer = new Layer(this.width, this.height);
        this.makeBoundariesWalls(layer);
        this.makeRandomWalls(layer);
        [layer.start, layer.end] = this.samplePosition(layer, Tile.Floor, 2);
        return layer;
    }


    applyRoomToMap(map: Layer, rect: Rectangle, room: Layer): void {
        //this.iterateMap(rect.start, rect.end, );
    }

    samplePosition(map: Layer, tile: Tile, size = 1) {
        let floor: Point[] = [];
        map.iterate((val, pos) => val === tile && (floor.push(pos)));
        this.rand.shuffle(floor);
        return this.rand.sample(floor, size);
    }

    makeBoundariesWalls(map: Layer): void {
        let makeWall = (_: Tile, pos: Point) => map.setTile(pos, Tile.Wall);
        map.iterateHor(0, map.width, 0, makeWall);
        map.iterateHor(0, map.width, map.height - 1, makeWall);
        map.iterateVer(0, map.height, 0, makeWall);
        map.iterateVer(0, map.height, map.width - 1, makeWall);
    }

    makeRandomWalls(map: Layer, prob: number = 0.5): void {
        map.iterateMap(new Point(1, 1), new Point(map.width - 1, map.height - 1), (_, point) => {
            if (this.rand.nextDouble() <= prob) {
                map.setTile(point, Tile.Wall);
            }
        });
    }
}

export class MapManager {

    rand: Random;
    mapGen: MapGenerator;
    currentLayer: Layer;

    constructor(width = 80, height = 50, rand: Random) {
        this.rand = rand;
        this.mapGen = new MapGenerator(width, height, rand);
        this.currentLayer = this.mapGen.make();
    }

    setMapGenerator(mapGen: MapGenerator) {
        this.mapGen = mapGen;
    }

    getCurrentLayer(): Layer {
        return this.currentLayer;
    }
}

export class Layer {

    width: number;
    height: number;
    map: Tile[];
    start: Point;
    end: Point;

    constructor(width = 80, height = 50, start = new Point(0, 0), end = new Point(0, 0)) {
        this.width = width;
        this.height = height;
        this.start = start;
        this.end = end;
        this.map = Array.from({ length: this.height * this.width }, () => Tile.Floor);
    }

    on_start(): void {
    }

    _iterateDim(start: number, end: number, common: number, horizontal = true, call: mapCallback): void {
        range(start, end).forEach(i => {
            let point: Point = new Point();
            [point.x, point.y] = horizontal ? [i, common] : [common, i];
            let element = this.map[this._xyIndex(point)];
            call(element, point);
        });
    }

    iterateHor(start: number, end: number, y: number, call: mapCallback): void {
        this._iterateDim(start, end, y, true, call);
    }

    iterateVer(start: number, end: number, x: number, call: mapCallback): void {
        this._iterateDim(start, end, x, false, call);
    }

    iterateMap(upLeft: Point, downRight: Point, call: mapCallback): void {
        range(upLeft.y, downRight.y).forEach(row => {
            this.iterateHor(upLeft.x, downRight.x, row, call);
        });
    }

    iterate(call: mapCallback): void {
        this.iterateMap(new Point(), new Point(this.width, this.height), call);
    }

    isAtBounds(point: Point): boolean {
        return point.x < this.width && point.y < this.height && point.x >= 0 && point.y >= 0;
    }

    setTile(point: Point, tile: Tile): void {
        this.map[this._xyIndex(point)] = tile;
    }

    getTile(point: Point): Tile {
        return this.map[this._xyIndex(point)];
    }

    _xyIndex(point: Point): number {
        return Math.floor(point.y) * this.width + Math.floor(point.x);
    }
}
