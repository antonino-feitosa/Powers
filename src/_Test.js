
const {Point} = require('./Grid');
const {Viewer} = require('./View');

Point.with(20,20);
let map = [];
for(let i=0;i<Point.height;i++){
    let row = new Array(Point.width);
    row.fill(0);
    map.push(row);
}

map.forEach(row => console.log(row.join(' ')));

Viewer.with(5, Point.from(10, 10), Point, (pos) => {
    return false;
});

Viewer.calculate((pos, lit) => {
    if(lit > 0){
        let [x,y] = Point.to2D(pos);
        map[y][x] = 1;
    }
});
map.forEach(row => console.log(row.join(' ')));

//console.log(Point.from(-1,0));
//console.log(Point.to2D(-1));



/*
function calculateFOV(opaque, start, radius, calcRadius) {
    //http://www.roguebasin.com/index.php/Improved_Shadowcasting_in_Java
    let width = start.x + radius;
    let height = start.y + radius;
    let lightMap = new Map();

    function castLight(row, st, end, xx, xy, yx, yy) {
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
    Point.diagonals(Point.from(start)).forEach(d => {
        castLight(1, 1, 0, 0, d.x, d.y, 0);
        castLight(1, 1, 0, d.x, 0, 0, d.y);
    });
    return lightMap;
}
*/