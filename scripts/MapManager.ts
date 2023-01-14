
import { Renderable } from './Component';
import { Random } from './Random';
import { range } from './Utils';

export enum Tile {
    Wall,
    Floor,
    Corridor
}

export type mapCallback = (value: Cell, position: Point) => void;

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

    static sum(a: Point, b: Point): Point {
        return new Point(a.x + b.x, a.y + b.y);
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

export class MapGenerator {

    width: number;
    height: number;
    rand: Random;

    constructor(width: number, height: number, rand: Random) {
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

    createRoomToMap(map: Layer, rect: Rectangle): void {
        map.iterateMap(rect.start, rect.end, (_, p) => map.setTile(p, Tile.Floor));
    }

    copyRoomToMap(map: Layer, point: Point, room: Layer): void {
        room.iterate((_, inc) => map.setTile(Point.sum(inc, point), room.getTile(inc)));
    }

    makeTunnelHor(map: Layer, start: number, end: number, y: number) {
        map.iterateHor(start, end, y, (_, p) => map.setTile(p, Tile.Floor));
    }

    makeTunnelVer(map: Layer, start: number, end: number, x: number) {
        map.iterateVer(start, end, x, (_, p) => map.setTile(p, Tile.Floor));
    }

    samplePosition(map: Layer, tile: Tile, size = 1) {
        let floor: Point[] = [];
        map.iterate((val, pos) => val.getTile() === tile && (floor.push(pos)));
        this.rand.shuffle(floor);
        return this.rand.sample(floor, size);
    }

    makeBoundariesWalls(map: Layer): void {
        let makeWall = (_: Cell, pos: Point) => map.setTile(pos, Tile.Wall);
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
        this.currentLayer = mapGen.make();
    }

    getCurrentLayer(): Layer {
        return this.currentLayer;
    }
}

export class Cell {

    _point: Point;
    _tile: Tile;
    render: Renderable;

    constructor(point: Point, tile: Tile = Tile.Floor) {
        this._point = point;
        this._tile = tile;
        this.render = Cell.createRender(tile);
    }

    static createRender(tile: Tile): Renderable {
        let map: Map<Tile, Renderable> = new Map([
            [Tile.Floor, new Renderable('.', 'white', 'black')],
            [Tile.Wall, new Renderable('#', 'white', 'black')],
            [Tile.Corridor, new Renderable('c', 'white', 'black')],
        ]);
        let render = map.get(tile);
        if (render) {
            return render.clone();
        } else {
            throw new Error('Can not render the tile ' + tile);
        }
    }

    setTile(tile: Tile): void {
        this.render = Cell.createRender(tile);
        this._tile = tile;
    }

    getTile(): Tile {
        return this._tile;
    }
}

export class Layer {

    width: number;
    height: number;
    map: Cell[];
    start: Point;
    end: Point;
    visibles: Cell[];
    revealed: Cell[];

    constructor(width = 80, height = 50, tile: Tile = Tile.Floor) {
        this.width = width;
        this.height = height;
        this.start = new Point();
        this.end = new Point();
        this.visibles = [];
        this.revealed = [];
        this.map = Array.from({ length: this.height * this.width }, (_, index) => {
            let y = Math.floor(index / width);
            let x = Math.floor(index % width);
            return new Cell(new Point(x, y), tile);
        });
    }

    on_start(): void {
    }

    _iterateDim(start: number, end: number, common: number, horizontal = true, call: mapCallback): void {
        if (start > end) {
            console.warn(`Wrong limits! Swaping start ${start} and end ${end}`);
            [start, end] = [end, start];
        }
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
        this.map[this._xyIndex(point)].setTile(tile);
    }

    getTile(point: Point): Tile {
        return this.map[this._xyIndex(point)].getTile();
    }

    _xyIndex(point: Point): number {
        return Math.floor(point.y) * this.width + Math.floor(point.x);
    }
}
