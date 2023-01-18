
"use strict";

const { minimumIndex } = require('./Utils');

const DijkstraMap = {

    sources: new Map(),
    dist: new Map(),

    cost(u, v) { return 1; },
    neighborhood(p) { return []; },

    calculate(cells, join) {
        this.dist = new Map();
        join ? (this.dist = join) : cells.forEach(c => this.dist.set(c, 100));
        this.sources.forEach((v, k) => this.dist.set(k, v));

        let cmp = (u, v) => this.dist.get(u) - this.dist.get(v);

        let queue = [];
        this.dist.forEach((_, v) => queue.push(v));
        while (queue.length > 0) {
            let min = minimumIndex(queue, cmp);
            let u = queue[min];
            queue[min] = queue[queue.length - 1];
            queue.length--;

            this.neighborhood(u).forEach(v => {
                let alt = this.dist.get(u) + this.cost(u, v);
                if (alt < this.dist.get(v)) {
                    this.dist.set(v, alt);
                }
            });
        }
    },

    chase(point) {
        let cmp = (u, v) => this.dist(u) - this.dist(v);
        return minimumIndex(this.neighborhood(point), cmp);
    },

    flee(point, force = -1.2) {
        let cmp = (u, v) => this.dist(v) * force - this.dist(u) * force;
        return minimumIndex(this.neighborhood(point), cmp);
    }
};

module.exports = {
    DijkstraMap
}
