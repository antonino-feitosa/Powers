var stdin = process.stdin;

stdin.setRawMode(true); // input whitout enter
stdin.resume(); // waiting input (process.exit() or process.pause())
stdin.setEncoding('utf8');
let codeToName = new Map([
    ['\u0003', 'ctrl+c'],
    ['\u000D', 'enter'],
    ['\u001B', 'escape'],
    ['\u0020', 'space'],
    ['\u001B\u005B\u0041', 'up'],
    ['\u001B\u005B\u0042', 'down'],
    ['\u001B\u005B\u0043', 'right'],
    ['\u001B\u005B\u0044', 'left']
]);
// on any data into stdin
stdin.on('data', function (key) {
    if(typeof key === 'string'){
        let name = codeToName.get(key);
        if(name === 'ctrl+c'){
            process.exit();
        }
        console.log(key, name);
    }
});
