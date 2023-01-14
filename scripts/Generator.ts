

import { Layer, MapGenerator, Rectangle, Tile } from "./MapManager";
import { Random } from "./Random";
import { range } from './Utils';


export class SimpleRandomGenerator extends MapGenerator {

    maxRooms: number = 30;
    minSize: number = 6;
    maxSize: number = 10;

    constructor(width: number, height: number, rand: Random) {
        super(width, height, rand);
    }

    make(): Layer {
        let layer = new Layer(this.width, this.height, Tile.Wall);
        let rand = this.rand;

        let rooms: Rectangle[] = [];
        range(0, this.maxRooms).forEach(i => {
            let width = rand.nextRange(this.minSize, this.maxSize);
            let height = rand.nextRange(this.minSize, this.maxSize);
            if (this.width - width - 1 > this.minSize && this.height - height - 1 > this.minSize) {
                let x = rand.nextRange(1, this.width - width - 1);
                let y = rand.nextRange(1, this.height - height - 1);
                let rect = new Rectangle(x, y, width, height);
                let overlap = false;
                rooms.forEach(r => overlap = overlap || r.overlaps(rect));
                if (!overlap) {
                    this.createRoomToMap(layer, rect);
                    rooms.push(rect);
                }
            }
        });
        for (let i = 1; i < rooms.length; i++) {
            let last = rooms[i - 1];
            this.connectRooms(layer, rooms[i], last);
        }

        this.pickStartEnd(layer, rooms);
        return layer;
    }

    connectRooms(layer: Layer, rect: Rectangle, last: Rectangle): void {
        let source = rect.center();
        let dest = last.center();
        if (this.rand.nextBoolean()) {
            let [sx, ex] = [source.x, dest.x];
            source.x > dest.x && ([sx, ex] = [dest.x, source.x]);
            source.x !== dest.x && this.makeTunnelHor(layer, sx, ex + 1, dest.y);

            let [sy, ey] = [source.y, dest.y];
            source.y > dest.y && ([sy, ey] = [dest.y, source.y])
            source.y !== dest.y && this.makeTunnelVer(layer, sy, ey, source.x);
        } else {
            let [sy, ey] = [source.y, dest.y];
            source.y > dest.y && ([sy, ey] = [dest.y, source.y]);
            source.y !== dest.y && this.makeTunnelVer(layer, sy, ey, dest.x);

            let [sx, ex] = [source.x, dest.x];
            source.x > dest.x && ([sx, ex] = [dest.x, source.x]);
            source.x !== dest.x && this.makeTunnelHor(layer, sx, ex + 1, source.y);
        }
    }

    pickStartEnd(layer: Layer, rooms: Rectangle[]): void {
        let [start, end] = this.rand.sample(rooms, 2);
        layer.start = start.center();
        layer.end = end.center();
    }
}
