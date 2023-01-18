
"use strict";

const { minimumIndex } = require('./Utils');

const DijkstraMap = {

    with(sources = new Map(), dist = new Map()){
        this.sources = sources || new Map();
        this.dist = dist || new Map();
        this.max = 0;
        return this;
    },

    cost(u, v) { return 1; },
    neighborhood(p) { return []; },

    calculate(cells) {
        this.dist = new Map();
        cells.forEach(c => this.dist.set(c, DijkstraMap.INF));
        this.sources.forEach((v, k) => this.dist.set(k, v));
        this.apply();
    },

    apply(){
        this.max = 0;
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
                    if(alt < DijkstraMap.INF && alt > this.max){
                        this.max = alt;
                    }
                }
            });
        }
    },

    chase(point) {
        let cmp = (u, v) => this.dist.get(u) - this.dist.get(v);
        let neighbor = this.neighborhood(point);
        let index = minimumIndex(neighbor, cmp);
        return neighbor[index];
    },

    flee(point){
        return this.fleeMap.chase(point);
    },

    makeFleeMap(force = -1.2, range = 4) {
        let map = Object.create(this).with(new Map(this.sources), new Map());
        this.dist.forEach((val,key) => {
            let value = val > range ? force * val : DijkstraMap.INF;
            map.dist.set(key, value)
        });
        map.apply();
        this.fleeMap = map;
        return map;
    }
};

DijkstraMap.INF = 100;

module.exports = {
    DijkstraMap
}
