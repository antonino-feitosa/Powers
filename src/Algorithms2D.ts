
export interface Point { x: number, y: number };

export class Rect {
    start: Point;
    end: Point;
    constructor(x: number, y: number, width: number, height: number) {
        this.start = { x: x, y: y };
        this.end = { x: x + width, y: y + height };
    }
    get width() { return this.end.x - this.start.x };
    get height() { return this.end.y - this.start.y };
    includes = (point: Point) => point.x >= this.start.x && point.x < this.end.x && point.y >= this.start.y && point.y < this.end.y;
    overlaps = (other: Rect) => !(this.start.x > other.end.x || this.end.x < other.start.x || this.start.y > other.end.y || this.end.y < other.start.y);
    center = () => ({ x: Math.floor((this.start.x + this.end.x) / 2), y: Math.floor((this.start.y + this.end.y) / 2) });
}

export function angleBetween(start: Point, end: Point) {
    return Math.atan2(end.y - start.y, end.x - start.x);
}

// crosss product: for line y=0 => 0 colinear; positive: above; negative below
export function sideOfLine(point: Point, start: Point, end: Point): number {
    let line = { x: end.x - start.x, y: end.y - start.y };
    let vet = { x: point.x - start.x, y: point.y - start.y };
    return line.x * vet.y - line.y * vet.x;
}

export function linePixels(start: Point, end: Point, call: (p: Point) => void): void {
    // Bresenham's Line Drawing Algorithm
    function plotLineLow(start: Point, end: Point) {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let yi = 1;
        if (dy < 0) {
            yi = -1
            dy = -dy
        }
        let D = (2 * dy) - dx;
        let y = start.y;

        for (let x = start.x; x < end.x; x++) {
            call({ x: x, y: y });
            if (D > 0) {
                y = y + yi;
                D = D + (2 * (dy - dx));
            } else {
                D = D + 2 * dy;
            }
        }
    }

    function plotLineHigh(start: Point, end: Point) {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let xi = 1;
        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }
        let D = (2 * dx) - dy;
        let x = start.x;

        for (let y = start.y; y < end.y; y++) {
            call({ x: x, y: y });
            if (D > 0) {
                x = x + xi;
                D = D + (2 * (dx - dy));
            } else {
                D = D + 2 * dx;
            }
        }
    }

    if (Math.abs(end.y - start.y) < Math.abs(end.x - start.x)) {
        start.x > end.x ? plotLineLow(end, start) : plotLineLow(start, end);
    } else {
        start.y > end.y ? plotLineHigh(end, start) : plotLineHigh(start, end);
    }
}



export function tringlePixels(p1: Point, p2: Point, p3: Point, call: (p: Point) => void) {
    //Bresenham Algorithm

    function fillTriangle(p1: Point, p2: Point, p3: Point) {
        linePixels(p1, p2, v1 => {
            call(v1);
            linePixels(p1, p3, v2 => {
                call(v2);
                if (v1.y !== v2.y) {
                    console.log({ x: v1.x, y: v1.y }, { x: v2.x, y: v1.y });
                    linePixels({ x: v1.x, y: v1.y }, { x: v2.x, y: v1.y }, call);
                }
            });
        });
    };


    let [v1, v2, v3] = [p1, p2, p3].sort((a, b) => a.y - b.y);
    if (v2.y === v3.y) {
        fillTriangle(v1, v2, v3);
    } else if (v1.y === v2.y) {
        fillTriangle(v3, v2, v1);
    } else {
        let v4 = { x: Math.floor((p1.x + ((p2.y - p1.y) / (p3.y - p1.y)) * (p3.x - p1.x))), y: Math.floor(p2.y) };
        fillTriangle(v1, v2, v4);
        fillTriangle(v3, v2, v4);
    }
}


export function circlePixels(center: Point, radius: number, call: (pos: Point, endX: number) => void): void {
    const sum = (x: number, y: number) => ({ x: x + center.x, y: y + center.y });
    // Mid-Point Circle Drawing Algorithm
    let x = radius, y = 0;

    if (radius === 0) { // When radius is zero only a single point will be printed
        call(center, center.x);
    } else {
        call(sum(-radius, 0), center.x + radius);
        call(sum(0, +radius), center.x);
        call(sum(0, -radius), center.x);
    }

    // Initialising the value of P
    let P = 1 - radius;
    while (x > y) {
        y++;
        if (P <= 0) {// Mid-point is inside or on the perimeter
            P = P + 2 * y + 1;
        } else { // Mid-point is outside the perimeter
            x--;
            P = P + 2 * y - 2 * x + 1;
        }

        // All the perimeter points have already been printed
        if (x < y) break;

        // Printing the generated point and its reflection in the other octants after translation
        call(sum(-x, +y), center.x + x);
        call(sum(-x, -y), center.x + x);

        // If the generated point is on the line x = y then the perimeter points have already been printed
        if (x !== y) {
            call(sum(-y, x), center.x + y);
            call(sum(-y, -x), center.x + y);
        }
    }
}

export function circlePixelsBRS(center: Point, radius: number, call: (p: Point, endX: number) => void): void {
    const sum = (x: number, y: number) => ({ x: x + center.x, y: y + center.y });
    //Bresenham’s circle drawing algorithm
    let mirrorPoints = (x: number, y: number) => {
        call(sum(-x, +y), center.x + x);
        call(sum(-x, -y), center.x + x);
        call(sum(-y, +x), center.x + y);
        call(sum(-y, -x), center.x + y);
    };

    let x = 0, y = radius;
    let d = 3 - 2 * radius;
    mirrorPoints(x, y);
    while (y >= x) {
        x++;
        if (d > 0) {// check for decision parameter
            y--;
            d = d + 4 * (x - y) + 10;
        }
        else {
            d = d + 4 * x + 6;
        }
        mirrorPoints(x, y);
    }
}


export function elipsePixels(center: Point, radius: Point, call: (p: Point, endX: number) => void): void {
    const sum = (x: number, y: number) => ({ x: x + center.x, y: y + center.y });
    //Mid-Point Ellipse Algorithm

    // Initial decision parameter of region 1
    let x = 0;
    let y = radius.y;
    let ry2 = radius.y ** 2;
    let rx2 = radius.x ** 2;
    let d1 = ry2 - radius.y * rx2 + 0.25 * rx2;
    let dx = 2 * ry2 * x;
    let dy = 2 * rx2 * y;

    // For region 1
    while (dx < dy) {
        //let inc = [[x, y], [-x, y], [x, -y], [-x, -y]];
        call(sum(-x, +y), center.x + x);
        call(sum(-x, -y), center.x + x);
        //inc.forEach(([dx, dy]) => call({ x: center.x + dx, y: center.y + dy }));
        if (d1 < 0) {
            x++;
            dx = dx + (2 * ry2);
            d1 = d1 + dx + ry2;
        } else {
            x++;
            y--;
            dx = dx + (2 * ry2);
            dy = dy - (2 * rx2);
            d1 = d1 + dx - dy + (ry2);
        }
    }


    // Decision parameter of region 2
    let d2 = ((ry2) * ((x + 0.5) * (x + 0.5))) + ((rx2) * ((y - 1) * (y - 1))) - (rx2 * ry2);

    // Plotting points of region 2
    while (y >= 0) {
        //let inc = [[x, y], [-x, y], [x, -y], [-x, -y]];
        call(sum(-x, +y), center.x + x);
        call(sum(-x, -y), center.x + x);
        //inc.forEach(([dx, dy]) => call({ x: center.x + dx, y: center.y + dy }));

        // Checking and updating parameter
        // value based on algorithm
        if (d2 > 0) {
            y--;
            dy = dy - (2 * rx2);
            d2 = d2 + rx2 - dy;
        }
        else {
            y--;
            x++;
            dx = dx + (2 * ry2);
            dy = dy - (2 * rx2);
            d2 = d2 + dx - dy + rx2;
        }
    }
}
