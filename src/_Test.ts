
///*
//process.stdin.setRawMode(true);

process.stdout.write('\u001b[?25l');

const keypress = require('keypress');
keypress(process.stdin);

process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  } else {
    console.log(key ? key.name : ch);
  }
});
process.stdin.setRawMode(true);
process.stdin.resume();
/*
let x = new Array(3);

let rand = new Random(4);


console.log(x.pick(rand));

//https://www.npmjs.com/package/keypress?activeTab=explore
*/