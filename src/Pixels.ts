

interface Point { x: number, y: number };

export function linePixels(start: Point, end: Point): Point[] {
    //DDA Line generation Algorithm
    let round = (value: number) => value - Math.floor(value) < 0.5 ? Math.floor(value) : Math.floor(value + 1);

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let step = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

    let xInc = (dx / step);
    let yInc = (dy / step);

    let x = start.x;
    let y = start.y;
    let points: Point[] = [];
    for (let i = 0; i < step; i++) {
        points.push({ x: round(x), y: round(y) });
        x += xInc;
        y += yInc;
    }
    return points;
}

export function circlePixels(center: Point, radius: number): Point[] {
    // Mid-Point Circle Drawing Algorithm
    let points: Point[] = [];
    let x = radius, y = 0;

    points.push({ x: center.x + radius, y: center.y });

    // When radius is zero only a single point will be printed
    if (radius > 0) {
        points.push({ x: center.x - radius, y: center.y });
        points.push({ x: center.x, y: center.y + radius });
        points.push({ x: center.x, y: center.y - radius });
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
        let coords = [[x, y], [-x, y], [x, -y], [-x, -y]];
        coords.forEach(([dx, dy]) => points.push({ x: center.x + dx, y: center.y + dy }))

        // If the generated point is on the line x = y then the perimeter points have already been printed
        if (x !== y) {
            let coords = [[y, x], [-y, x], [y, -x], [-y, -x]];
            coords.forEach(([dx, dy]) => points.push({ x: center.x + dx, y: center.y + dy }))
        }
    }
    return points;
}

export function circlePixelsBRS(center: Point, radius: number): Point[] {
    //Bresenham’s circle drawing algorithm
    let points: Point[] = [];
    let mirrorPoints = (x: number, y: number) => {
        let inc = [[x, y], [-x, y], [x, -y], [-x, -y], [y, x], [-y, x], [y, -x], [-y, -x]];
        inc.forEach(([dx, dy]) => points.push({ x: center.x + dx, y: center.y + dy }));
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
    return points;
}


export function elipsePixels(center: Point, radius: Point): Point[] {
    //Mid-Point Ellipse Algorithm
    let points: Point[] = [];
    let dx: number, dy: number, d1: number, d2: number, x = 0, y = radius.y;

    // Initial decision parameter of region 1
    let ry2 = radius.y ** 2;
    let rx2 = radius.x ** 2;
    d1 = ry2 - radius.y * rx2 + 0.25 * rx2;
    dx = 2 * ry2 * x;
    dy = 2 * rx2 * y;

    // For region 1
    while (dx < dy) {
        let inc = [[x, y], [-x, y], [x, -y], [-x, -y]];
        inc.forEach(([dx, dy]) => points.push({ x: center.x + dx, y: center.y + dy }));
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
    d2 = ((ry2) * ((x + 0.5) * (x + 0.5))) + ((rx2) * ((y - 1) * (y - 1))) - (rx2 * ry2);

    // Plotting points of region 2
    while (y >= 0) {
        let inc = [[x, y], [-x, y], [x, -y], [-x, -y]];
        inc.forEach(([dx, dy]) => points.push({ x: center.x + dx, y: center.y + dy }));

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

    return points;
}
