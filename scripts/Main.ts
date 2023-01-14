
import { Renderable, Player } from './Component';
import { Game } from './Game';
import { SimpleRandomGenerator } from './Generator';
import { Random } from './Random';

const WIDTH = 100;
const HEIGHT = 27;

let rand = new Random(0);
let mapGen = new SimpleRandomGenerator(WIDTH, HEIGHT, rand);

let game = new Game(WIDTH, HEIGHT, rand);
game.context.fog = false;
game.context.clearBuffer = true;
game.setMapGenerator(mapGen);
let layer = game.getCurrentLayer();
let player = new Player(layer.start, new Renderable('@', 'yellow'), game);
game.players.push(player);
game.run();

