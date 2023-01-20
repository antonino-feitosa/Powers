
const {TurnControl} = require('./Turn');

let queue = new TurnControl();

queue.push({name: '\tplayer', initiative: 15});
queue.push({name: 'orc', initiative: 20});
queue.push({name: 'dwarf', initiative: 20});
let elf = {name: 'elf', initiative: 20};
queue.push(elf);

for(let i=0;i<48;i++){
    console.log(i, '    ', queue.peek());
    queue.nextTurn();
    /*if(i === 24){
        console.log(queue.del(elf));
    }
    if(i === 36){
        queue.push(elf);
    }*/
}
