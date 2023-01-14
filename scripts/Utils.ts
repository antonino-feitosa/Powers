
export function range(min: number, max: number, step = 1): number[] {
    let arr = Array(max - min).fill(1);
    return arr.map((_, index) => min + step * index);
}
