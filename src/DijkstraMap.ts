
export class DijkstraMap {
    dist: Map<number, number>;
    cost: (v: number, u: number) => number;
    neighbor: (v: number) => number[];
    sources: Map<number, number>;

    constructor(cell: number[], cost: (v: number, u: number) => number, neighbor: (v: number) => number[]) {
        this.cost = cost;
        this.neighbor = neighbor;
        this.sources = new Map();
        this.dist = new Map();
        cell.forEach(c => this.dist.set(c, 100));
    }

    calculate(join?: Map<number, number>) {
        if (!join) {
            for (let key of this.dist.keys()) {
                this.dist.set(key, 100);
            }
        } else {
            this.dist = join;
        }
        this.sources.forEach((v, k) => this.dist.set(k, v));
        dijkstra(this.dist, this.cost, this.neighbor);
    }

    chase(point: number): number {
        let max: number = point;
        this.neighbor(point).forEach(n => {
            let dmax = this.dist.get(max);
            let dcur = this.dist.get(n);
            console.log(point, n, dcur, dmax);
            if (max === point || (dcur !== undefined && dmax != undefined && dcur > dmax)) {
                max = n;
            }
        });
        return max;
    }

    flee(point: number, force = -1.2): number {
        let max = this.neighbor(point).reduce((max, cur) =>
            (this.dist.get(cur) || 0) * force > (this.dist.get(max) || 0) * force ? cur : max, point);
        return max;
    }
};

function dijkstra(dist: Map<number, number> = new Map(), cost: (v: number, u: number) => number, neighbor: (v: number) => number[]) {
    let queue: number[] = [];
    let prev: number[] = [];
    dist.forEach((_, v) => {
        prev[v] = v;
        queue.push(v);
    });

    while (queue.length > 0) {
        let min = queue.reduce((min, val, index) => (dist.get(val) || 0) < (dist.get(queue[min]) || 0) ? index : min, 0);
        let u = queue[min];
        queue[min] = queue[queue.length - 1];
        queue.length--;

        neighbor(u).forEach(v => {
            let du = dist.get(u);
            let dv = dist.get(v);
            if (dv !== undefined && du !== undefined) {
                let alt = du + cost(u, v);
                if (alt < dv) {
                    dist.set(v, alt);
                    prev[v] = u;
                }
            }
        });
    }
}
