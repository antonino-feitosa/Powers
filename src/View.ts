
import { range } from './Utils';
import { Point, angleBetween, sideOfLine, elipsePixels } from './Algorithms2D';


enum Direction { RIGHT, UP, LEFT, DOWN };


function fieldOfViewExlipse(opaque: (pos: Point) => boolean, center: Point, radius: Point, call: (vis: Point) => void) {
    let visible: Point[] = [];
    let obstacle: Point[] = [];
    elipsePixels(center, radius, (pos, end) =>
        range(pos.x, end + 1, 1, index => {
            let point = { x: index, y: pos.y };
            opaque(point) ? obstacle.push(point) : visible.push(point);
        }));

    let centerOfPos = (p: Point) => ({ x: p.x + 0.5, y: p.y + 0.5 });

    obstacle.forEach(obs => {
        visible = visible.filter(other => {
            let angle = angleBetween(centerOfPos(center), centerOfPos(obs));
            switch (true) {
                case obs.x === center.x && angle > 0:
            }
        });
    });
}

function cone(startLine:Point, endLine:Point, angle:number, radius:number){

}

function cone45(center: Point, dir: Direction, radius: number, call: (vis: Point) => void) {
    switch (dir) {
        case Direction.UP:
            range(center.y, center.y - radius, -1, y =>
                range(center.x - y, center.x + y + 1, 1, x => call({ x: x, y: y })));
            break;
        case Direction.DOWN:
            range(center.y, center.y + radius, 1, y =>
                range(center.x - y, center.x + y + 1, 1, x => call({ x: x, y: y })));
            break;
        case Direction.LEFT:
            range(center.x, center.x + radius, 1, x =>
                range(center.y - x, center.y, 1, y => call({ x: x, y: y })));
            break;
        case Direction.RIGHT:
            range(center.x, center.x - radius, -1, x =>
                range(center.y - x, center.y, 1, y => call({ x: x, y: y })));
            break;
    }
}
