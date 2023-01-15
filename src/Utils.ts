function pushInRange<Type>(array: Type[], min: number, max: number, call: (index: number) => Type): Type[] {
    for (let i = min; i < max; i++) {
        array.push(call(i));
    }
    return array;
}
