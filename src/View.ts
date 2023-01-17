
export interface Point { x: number, y: number };

export class Direction {
    static Up: Point = { x: 0, y: -1 };
    static Down: Point = { x: 0, y: +1 };
    static Left: Point = { x: -1, y: 0 };
    static Right: Point = { x: +1, y: 0 };
    static UpRight: Point = { x: 1, y: -1 };
    static UpLeft: Point = { x: -1, y: -1 };
    static DownRight: Point = { x: 1, y: 1 };
    static DownLeft: Point = { x: -1, y: 1 };

    static All: Point[] = [Direction.Up, Direction.Left, Direction.Down, Direction.Right, Direction.UpLeft, Direction.DownRight, Direction.DownLeft];
    static Diagonals: Point[] = [Direction.UpRight, Direction.UpLeft, Direction.DownRight, Direction.DownLeft];
}

export enum RadiusType { Circle, Square, Diamond };

export function radiusFunctionCircle(x: number, y: number) { return Math.sqrt(x ** 2 + y ** 2); }
export function radiusFunctionSquare(x: number, y: number) { return Math.max(Math.abs(x), Math.abs(y)); }
export function radiusFunctionDiamond(x: number, y: number) { return Math.abs(x) + Math.abs(y); }

export class Viewer {
    radius: number;
    center: Point;
    opaque: (p: Point) => boolean;
    isDirty: boolean = true;
    radiusFunction: (x: number, y: number) => number = radiusFunctionCircle;

    constructor(center: Point, radius: number, opaque: (p: Point) => boolean) {
        this.center = center;
        this.radius = radius;
        this.opaque = opaque;
    }

    calculate(call: (p: Point, light: number) => void) {
        calculateFOV(this.opaque, this.center, this.radius, this.radiusFunction, call);
    }
}

function calculateFOV(opaque: (p: Point) => boolean, start: Point, radius: number,
    calcRadius: (x: number, y: number) => number, call: (p: Point, light: number) => void): void
    {
    //http://www.roguebasin.com/index.php/Improved_Shadowcasting_in_Java
    let width = start.x + radius;
    let height = start.y + radius;
    let lightMap: Map<Point, number> = new Map();

    function castLight(row: number, st: number, end: number, xx: number, xy: number, yx: number, yy: number) {
        let newStart = 0;
        if (st < end) {
            return;
        }
        let blocked = false;
        for (let distance = row; distance <= radius && !blocked; distance++) {
            let deltaY = -distance;
            for (let deltaX = -distance; deltaX <= 0; deltaX++) {
                let currentX = start.x + deltaX * xx + deltaY * xy;
                let currentY = start.y + deltaX * yx + deltaY * yy;
                let leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
                let rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

                if (!(currentX >= 0 && currentY >= 0 && currentX < width && currentY < height) || st < rightSlope) {
                    continue;
                } else if (end > leftSlope) {
                    break;
                }

                //check if it's within the lightable area and light if needed
                if (calcRadius(deltaX, deltaY) <= radius) {
                    let bright = (1 - (calcRadius(deltaX, deltaY) / radius));
                    lightMap.set({ x: currentX, y: currentY }, bright);
                }

                if (blocked) { //previous cell was a blocking one
                    if (opaque({ x: currentX, y: currentY })) {//hit a wall
                        newStart = rightSlope;
                        continue;
                    } else {
                        blocked = false;
                        st = newStart;
                    }
                } else {
                    if (opaque({ x: currentX, y: currentY }) && distance < radius) {//hit a wall within sight line
                        blocked = true;
                        castLight(distance + 1, st, leftSlope, xx, xy, yx, yy);
                        newStart = rightSlope;
                    }
                }
            }
        }
    }

    lightMap.set(start, 1);//light the starting cell
    Direction.Diagonals.forEach(d => {
        castLight(1, 1, 0, 0, d.x, d.y, 0);
        castLight(1, 1, 0, d.x, 0, 0, d.y);
    });
    lightMap.forEach((light, pos) => call(pos, light));
}
