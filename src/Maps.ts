
function createRect(x: number, y: number, width: number, height: number) {
    return {
        start: { x: x, y: y },
        end: { x: x + width, y: y + height },
        includes(point: Point): boolean {
            return point.x >= this.start.x && point.x < this.end.x && point.y >= this.start.y && point.y < this.end.y;
        }
    };
}

function createMapBernoulli(width: number, height: number, prob: number = 0.5) {
    let indexToPoint = (index: number) => ({ x: index % width, y: Math.floor(index / width) });
    let pointToIndex = (point: Point) => point.y * width + point.x;
    let tiles: Tile[] = [];
    let rooms: Rect[] = [];
    pushInRange(tiles, 0, width * height, index => {
        switch (true) {
            case index < width:
            case index >= (width - 1) * height:
            case index % width - 1 === 0:
            case index % width === 0:
            case rand.nextDouble() < prob:
                return Tile.Wall;
            default:
                let point = indexToPoint(index);
                rooms.push({ start: point, end: { x: point.x + 1, y: point.y + 1 } });
                return Tile.Floor;
        }
    });
    return { width: width, height: height, tiles: tiles, rooms: rooms, indexToPoint: indexToPoint, pointToIndex: pointToIndex };
}
