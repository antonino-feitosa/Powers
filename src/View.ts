
import { range } from './Utils';
import { Point, angleBetween, trianglePixels, elipsePixels } from './Algorithms2D';
import { posix } from 'path';


enum Direction { RIGHT, UP, LEFT, DOWN };


function fieldOfViewExlipse(opaque: (pos: Point) => boolean, center: Point, radius: Point, call: (vis: Point) => void) {

    function pointToIndex(point: Point) {
        return point.y * radius.x * 2 + point.x;
    }
    function indexToPoint(index: number) {
        return index / (radius.x * 2) + index % (radius.x * 2);
    }
    function centerPos(pos: Point) {
        return { x: pos.x + 0.5, y: pos.y + 0.5 };
    }


    let visible: Point[] = [];
    let obstacle: Point[] = [];
    elipsePixels(center, radius, (pos, end) =>
        range(pos.x, end + 1, 1, index => {
            let point = { x: index, y: pos.y };
            opaque(point) ? obstacle[pointToIndex(point)] = point : 0;
        }));

    let cdxy = (p: Point, dx1: number, dy1: number, dx2: number, dy2: number) =>
        [{ x: p.x + 0.5 + dx1, y: p.x + 0.5 + dy1 }, { x: p.x + 0.5 + dx2, y: p.x + 0.5 + dy2 }];

    let vcenter = centerPos(center);
    obstacle.forEach(obs => {
        let cmp1: Point, cmp2: Point;
        switch (true) {
            case obs.x == vcenter.x: [cmp1, cmp2] = cdxy(obs, 0, 0.5, 0, 0.5); break;
            case obs.y == vcenter.y: [cmp1, cmp2] = cdxy(obs, 0.5, 0, 0.5, 0); break;
            case obs.x > center.x && obs.y > center.y: [cmp1, cmp2] = cdxy(obs, 0.5, -0.5, -0.5, 0.5); break;
            case obs.x > center.x && obs.y < center.y: [cmp1, cmp2] = cdxy(obs, -0.5, -0.5, 0.5, 0.5); break;
            case obs.x < center.x && obs.y > center.y: [cmp1, cmp2] = cdxy(obs, 0.5, -0.5, -0.5, 0.5); break;
            case obs.x < center.x && obs.y < center.y: [cmp1, cmp2] = cdxy(obs, -0.5, -0.5, 0.5, 0.5); break;
        }
        //trianglePixels(vcenter, cmp1, cmp2, p => );
    });
}

function cone(center: Point, angleDir: number, angle: number, radius: number, call: (vis: Point) => void) {
    let left: Point = { x: 0, y: 0 };
    left.x = center.x + Math.cos(angleDir + angle) * radius;
    left.y = center.y + Math.sin(angleDir + angle) * radius;

    let right: Point = { x: 0, y: 0 };
    left.x = center.x + Math.cos(angleDir - angle) * radius;
    left.y = center.y + Math.sin(angleDir - angle) * radius;

    trianglePixels(center, left, right, call);
}
