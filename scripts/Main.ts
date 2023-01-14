
import { Renderable, Player } from './Component';
import { Game } from './Game';

let game = new Game();
let layer = game.getCurrentLayer();
let player = new Player(layer.start, new Renderable('@', 'yellow'), game);
game.components.push(player);
game.run();
