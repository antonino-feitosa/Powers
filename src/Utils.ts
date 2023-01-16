
export function range(start: number, end: number, inc: number, call: (index: number) => void) {
    for (let i = start; i < end; i += inc)
        call(i);
}

export function pushInRange<Type>(array: Type[], min: number, max: number, call: (index: number) => Type): Type[] {
    for (let i = min; i < max; i++) {
        array.push(call(i));
    }
    return array;
}
