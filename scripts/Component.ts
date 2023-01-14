import { Point } from './MapManager';
import { Tile } from './MapManager';
import { Game } from './Game';

export class Renderable {
    glyph: string;
    fg: string;
    bg: string;

    constructor(glyph: string, fg = 'white', bg = 'black') {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
    }
}

export class Component {
    position: Point;
    render: Renderable;

    game: Game;

    constructor(position: Point, render: Renderable, game: Game) {
        this.position = position;
        this.render = render;
        this.game = game;
    }

    update(turn: number): boolean { return false; }
    on_start(): void { };
    on_command_pressed(command: string): boolean { return false; }
    on_command_down(command: string): boolean { return false; }
    on_command_up(command: string): boolean { return false; }
}


enum State {Idle, Moving};
export class Player extends Component {

    state:State = State.Idle;

    update(turn: number): boolean {
        if(this.state == State.Idle){
            this.game.freeze();
        } else if(this.state == State.Moving){
            this.game.unfreeze();
            this.state = State.Idle;
            return true;
        }
        return false;
    }

    on_command_down(command: string): boolean {
        this.state = State.Moving;
        switch (command) {
            case 'left': this.tryMoveTo(-1, 0); return true;
            case 'right': this.tryMoveTo(+1, 0); return true;
            case 'up': this.tryMoveTo(0, -1); return true;
            case 'down': this.tryMoveTo(0, +1); return true;
        }
        this.state = State.Idle;
        return false;
    }

    tryMoveTo(x: number, y: number) {
        let layer = this.game.getCurrentLayer();
        let destination = new Point(this.position.x + x, this.position.y + y);
        if (layer.isAtBounds(destination) && layer.getTile(destination) === Tile.Floor) {
            this.position.copy(destination);
        }
    }
}
