
//import assert from 'assert';

import { pushInRange } from './Utils';
import { Random } from './Random';
import {Point, Rect} from './Algorithms2D';

export enum Tile { Floor = 0, Wall = 1, Tunnel = 2 };

const range = (start: number, length: number, call: (i: number) => void) => {
    console.assert(length >= 0, `lenght ${length} must be no negative.`);
    for (let i = start; i < start + length; i++) call(i)
};

export class Grid {
    width: number = 0;
    height: number = 0;
    rooms: Rect[] = [];
    tiles: Tile[] = [];
    revealed: number[] = [];
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
    get bounds() { return new Rect(0, 0, this.width, this.height) };
    indexToPoint = (index: number) => ({ x: index % this.width, y: Math.floor(index / this.width) });
    pointToIndex = (point: Point) => point.y * this.width + point.x;
    setTile = (pos: Point, tile: Tile) => {
        let index = this.pointToIndex(pos);
        this.tiles[index] = tile;
    };
    getTile = (pos: Point) => this.tiles[this.pointToIndex(pos)];

    static _inc = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    iterateNeighbor(pos: Point, call: (position: Point, value: Tile) => 0) {
        let bounds = this.bounds;
        Grid._inc.forEach(([dx, dy]) => {
            let current: Point = { x: pos.x + dx, y: pos.y + dy };
            bounds.includes(current) && call(current, this.getTile(current))
        });
    }

    iterateDim(start: Point, length: number, x: boolean, call: (pos: Point, val: Tile) => void) {
        range(x ? start.x : start.y, length, i => {
            let point = x ? { x: i, y: start.y } : { x: start.x, y: i };
            call(point, this.getTile(point));
        });
    }

    iterateVer = (pos: Point, length: number, call: (pos: Point, val: Tile) => void) =>
        this.iterateDim(pos, length, false, call);

    iterateHor = (pos: Point, length: number, call: (pos: Point, val: Tile) => void) =>
        this.iterateDim(pos, length, true, call);

    iterate(rect: Rect, call: (pos: Point, val: Tile) => void): void {
        range(rect.start.y, rect.height, row =>
            this.iterateHor({ x: rect.start.x, y: row }, rect.width, call));
    }

    static fromBernoulli(width: number, height: number, rand: Random, prob: number = 0.2): Grid {
        let grid = new Grid(width, height);
        pushInRange(grid.tiles, 0, width * height, index => {
            switch (true) {
                case index < width:
                case index >= width * (height - 1):
                case (index + 1) % width === 0:
                case index % width === 0:
                case rand.nextDouble() < prob:
                    return Tile.Wall;
                default:
                    let point = grid.indexToPoint(index);
                    grid.rooms.push(new Rect(point.x, point.y, 1, 1));
                    return Tile.Floor;
            }
        });
        return grid;
    }

    static fromRandom(width: number, height: number, rand: Random, maxRooms = 30, minSize = 6, maxSize = 12): Grid {
        let grid = new Grid(width, height);
        range(0, width * height, _ => grid.tiles.push(Tile.Wall));

        let applyToRoom = (rect: Rect) =>
            grid.iterate(rect, (pos: Point, _) => grid.setTile(pos, Tile.Floor));
        let apply_horizontal_tunnel = (x: number, ex: number, y: number) =>
            grid.iterateHor({ x: x, y: y, }, ex - x, (pos: Point, _) => grid.setTile(pos, Tile.Floor));
        let apply_vertical_tunnel = (y: number, ey: number, x: number) =>
            grid.iterateVer({ x: x, y: y, }, ey - y, (pos: Point, _) => grid.setTile(pos, Tile.Floor));

        let connectRoom = (rect: Rect) => {
            let source = rect.center();
            let dest = grid.rooms[grid.rooms.length - 1].center();
            if (rand.nextBoolean()) {
                let [sx, ex] = source.x > dest.x ? [dest.x, source.x] : [source.x, dest.x];
                source.x !== dest.x && apply_horizontal_tunnel(sx, ex + 1, dest.y);
                let [sy, ey] = source.y > dest.y ? [dest.y, source.y] : [source.y, dest.y];
                source.y !== dest.y && apply_vertical_tunnel(sy, ey, source.x);
            } else {
                let [sy, ey] = source.y > dest.y ? [dest.y, source.y] : [source.y, dest.y];
                source.y !== dest.y && apply_vertical_tunnel(sy, ey, dest.x);
                let [sx, ex] = source.x > dest.x ? [dest.x, source.x] : [source.x, dest.x];
                source.x !== dest.x && apply_horizontal_tunnel(sx, ex + 1, source.y);
            }
        }

        range(0, maxRooms, _ => {
            let w = rand.nextRange(minSize, maxSize);
            let h = rand.nextRange(minSize, maxSize);
            if (width - w - 1 > minSize && height - h - 1 > minSize) {
                let x = rand.nextRange(1, width - w - 1);
                let y = rand.nextRange(1, height - h - 1);
                let rect = new Rect(x, y, w, h);
                let overlap = false;
                grid.rooms.forEach(r => overlap = overlap || r.overlaps(rect));
                if (!overlap) {
                    applyToRoom(rect);
                    grid.rooms.length > 0 && connectRoom(rect);
                    grid.rooms.push(rect);
                }
            }
        });

        return grid;
    }
}
