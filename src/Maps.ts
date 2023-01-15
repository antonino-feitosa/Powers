
import {pushInRange} from './Utils';
import {Random} from './Random';

export enum Tile { Floor = 0, Wall = 1, };
export interface Point { x: number, y: number };

export class Rect {
    start:Point;
    end:Point;
    constructor(x: number, y: number, width: number, height: number) {
        this.start = { x: x, y: y };
        this.end = { x: x + width, y: y + height };
    }
    includes = (point: Point) => point.x >= this.start.x && point.x < this.end.x && point.y >= this.start.y && point.y < this.end.y;
    center = () => ({ x: Math.floor((this.start.x + this.end.x) / 2), y: Math.floor((this.start.y + this.end.y) / 2) });
}

export class Grid {
    width: number = 0;
    height:number = 0;
    rooms: Rect[] = [];
    tiles: Tile[] = [];
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
    indexToPoint = (index: number) => ({ x: index % this.width, y: Math.floor(index / this.width) });
    pointToIndex = (point: Point) => point.y * this.width + point.x;

    static fromBernoulli(width: number, height: number, rand:Random, prob: number = 0.5): Grid {
        let grid = new Grid(width, height);
        pushInRange(grid.tiles, 0, width * height, index => {
            switch (true) {
                case index < width:
                case index >= (width - 1) * height:
                case index % width - 1 === 0:
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

   /* static fromRandom(width: number, height: number, maxRooms: number): Grid {
        let grid = new Grid(width, height, Tile.Floor);

        return grid;
    }*/
}
