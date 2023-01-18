
"use strict";

const { range } = require('./Utils');

const Point = {

    with(width, height) {
        this.width = width;
        this.height = height;
        return this;
    },

    from(x, y) { return y * this.width + x },
    to2D(p) { return [p % this.width, Math.floor(p / this.width)] },

    isValid(p) {
        let [x, y] = Point.to2D(p);
        return x < this.width && y < this.height && x >= 0 && y >= 0;
    },

    up(p) { return p - this.width },
    down(p) { return p + this.width },
    left(p) { return p - 1 },
    right(p) { return p + 1 },
    upLeft(p) { return p - this.width - 1 },
    upRight(p) { return p - this.width + 1 },
    downLeft(p) { return p + this.width - 1 },
    downRight(p) { return p + this.width + 1 },

    axis(p) { return [this.up(p), this.down(p), this.left(p), this.right(p)] },
    diagonals(p) { return [this.upLeft(p), this.upRight(p), this.downLeft(p), this.downRight(p)] },
    neighborhood(p) { return [...this.axis(p), ...this.diagonals(0)] },

    toString(p) { return this.to2D(p).toString() }
}

const Rect = {

    with(x, y, width, height) {
        this.x1 = x;
        this.x2 = x + width;
        this.y1 = y;
        this.y2 = y + height;
        return this;
    },
    get width() { return this.x2 - this.x1 },
    get height() { return this.y2 - this.y1 },
    overlaps(other) { return !(this.x1 > other.x2 || this.x2 < other.x1 || this.y1 > other.y2 || this.y2 < other.y1); },
    center() { return [Math.floor((this.x1 + this.x2) / 2), Math.floor((this.y1 + this.y2) / 2)]; },
    includes(x, y) { return x >= this.x1 && x < this.x2 && y >= this.y1 && y < this.y2; }
}

const Tile = { Floor: '.', Wall: '#', Tunnel: 'C' };

const Grid = {

    with(width, height) {
        this.width = width;
        this.height = height;
        this.rooms = [];
        this.tiles = [];
        this.revealed = [];
        this.visible = [];
        this.blocked = [];
        this.Point = Object.create(Point).with(width, height);
        return this;
    },

    get bounds() {
        return Object.create(Rect).with(0, 0, this.width, this.height);
    },

    iterateDim(start, length, isX, call) {
        let [x, y] = this.Point.to2D(start);
        range(isX ? x : y, length, i => {
            let point = isX ? this.Point.from(i, y) : this.Point.from(x, i);
            call(point, this.tiles[point]);
        });
    },

    iterateVer(pos, length, call) { this.iterateDim(pos, length, false, call) },
    iterateHor(pos, length, call) { this.iterateDim(pos, length, true, call) },
    iterate(rect, call) {
        range(rect.y1, rect.height, row =>
            this.iterateHor(this.Point.from(rect.x1, row), rect.width, call));
    }
}

Grid.fromEmpty = function (width, height, fillBorder = true) {
    let grid = Object.create(Grid).with(width, height);
    grid.rooms.push(grid.bounds);
    range(0, width * height, index => {
        switch (true) {
            case index < width:
            case index >= width * (height - 1):
            case (index + 1) % width === 0:
            case index % width === 0:
                grid.tiles.push(fillBorder ? Tile.Wall : Tile.Floor);
            default:
                grid.tiles.push(Tile.Floor);
        }
    });
    return grid;
}

Grid.fromBernoulli = function (width, height, rand, prob = 0.2) {
    let grid = Object.create(Grid).with(width, height);
    range(grid.tiles, 0, width * height, index => {
        switch (true) {
            case index < width:
            case index >= width * (height - 1):
            case (index + 1) % width === 0:
            case index % width === 0:
            case rand.nextDouble() < prob:
                grid.tiles.push(Tile.Wall);
            default:
                let [x, y] = grid.Point.to2D(index);
                grid.rooms.push(new Rect(x, y, 1, 1));
                grid.tiles.push(Tile.Floor);
        }
    });
    return grid;
}

Grid.fromRandom = function (width, height, rand, maxRooms = 30, minSize = 6, maxSize = 12) {
    let grid = Object.create(Grid).with(width, height);
    range(0, width * height, _ => grid.tiles.push(Tile.Wall));

    let applyToRoom = (rect) => grid.iterate(rect, (pos) => grid.tiles[pos] = Tile.Floor);
    let apply_horizontal_tunnel = (x, ex, y) =>
        grid.iterateHor(Grid.Point.from(x, y), ex - x, (pos) => grid.tiles[pos] = Tile.Floor);
    let apply_vertical_tunnel = (y, ey, x) =>
        grid.iterateVer(Grid.Point.from(x, y), ey - y, (pos) => grid.tiles[pos] = Tile.Floor);

    let connectRoom = (rect) => {
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
            let rect = Object.create(Rect).with(x, y, w, h);
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

module.exports = {
    Tile,
    Grid,
    Rect,
    Point
}
