
import { Component, Player } from './Component';
import { Context, KeyEvent } from './Context';
import { Layer, MapGenerator, MapManager, Point } from './MapManager';
import { Random } from './Random';


enum CommandState { On, Active, Deactivating, Off };

interface Command { name: string, state: CommandState, processed: boolean };

export class Game {

    context: Context;
    world: MapManager;
    rand: Random;
    components: Component[];
    players: Component[];
    commands: Map<string, Command>;
    count_turns = 0;
    running = false;
    drawing = true;

    constructor(width = 20, height = 15, rand = new Random(0)) {
        this.rand = rand;
        this.context = new Context(width, height);
        this.context.setTitle('Powers - Rogue Like\n');
        this.world = new MapManager(width, height, this.rand);
        this.components = [];
        this.players = [];
        this.commands = new Map([
            ['w', { name: 'up', state: CommandState.Off, processed: false }],
            ['a', { name: 'left', state: CommandState.Off, processed: false }],
            ['d', { name: 'right', state: CommandState.Off, processed: false }],
            ['s', { name: 'down', state: CommandState.Off, processed: false }],
            ['i', { name: 'action_x', state: CommandState.Off, processed: false }],
            ['j', { name: 'action_y', state: CommandState.Off, processed: false }],
            ['l', { name: 'action_a', state: CommandState.Off, processed: false }],
            ['k', { name: 'action_b', state: CommandState.Off, processed: false }],
            ['q', { name: 'action_l', state: CommandState.Off, processed: false }],
            ['e', { name: 'action_r', state: CommandState.Off, processed: false }],
            ['space', { name: 'confirm', state: CommandState.Off, processed: false }],
            ['escape', { name: 'cancel', state: CommandState.Off, processed: false }],
            ['enter', { name: 'select', state: CommandState.Off, processed: false }],
        ]);
    }

    getCurrentLayer(): Layer {
        return this.world.getCurrentLayer();
    }

    setMapGenerator(mapGen: MapGenerator): void {
        this.world.setMapGenerator(mapGen);
    }

    start() {
        this.components.forEach(comp => comp.on_start);
        this.running = true;
    }

    update() {
        for (let comp of this.players) {
            this.commands.forEach(c => {
                if (!c.processed) {
                    if (c.state === CommandState.Off) {
                        c.processed = !comp.on_command_up(c.name);
                    } else if (c.state === CommandState.Active) {
                        c.processed = !comp.on_command_pressed(c.name);
                    } else if (c.state === CommandState.On) {
                        c.processed = !comp.on_command_down(c.name);
                    }
                }
            });
            comp.update(this.count_turns);
        }
        this.components.forEach(comp => comp.update(this.count_turns));
        this.count_turns++;
    }

    show() {
        this.context.drawLayer(this.world.getCurrentLayer());
        for (let comp of this.components) {
            this.context.drawRenderable(comp.position, comp.render);
        }
        for (let comp of this.players) {
            this.context.drawRenderable(comp.position, comp.render);
        }
        this.context.build();
        this.context.clear();
    }

    updateViewRange():void{
        let layer = this.world.getCurrentLayer();
        layer.visibles = [];

        this.players.forEach( c => {
            let player:Player = c as Player;
            let range = player.viewRange;
            let left = Math.max(c.position.x - range, 0);
            let right = Math.min(c.position.x + range, this.world.getCurrentLayer().width);
            let up = Math.max(c.position.y - range, 0);
            let down = Math.min(c.position.y + range, this.world.getCurrentLayer().height);

            layer.iterateMap(new Point(left, up), new Point(right, down), (c, pos) => {
                layer.revealed[layer._xyIndex(pos)] = c;
                layer.visibles.push(c);
            });
        });
    }

    main_loop() {
        this.suspendInput();
        this.updateViewRange();
        this.drawing && this.show();
        this.running && this.update();
        this.commands.forEach(command => {
            if (command.state == CommandState.Deactivating) {
                command.state = CommandState.Off;
            }
            if (command.state === CommandState.On) {
                command.state = CommandState.Active;
            }
            if (command.state === CommandState.Active) {
                command.state = CommandState.Deactivating;
            }
            command.processed = false;
        });
        this.resumeInput();
    }

    freeze() {
        this.drawing = false;
    }

    unfreeze() {
        this.drawing = true;
    }

    suspend() {
        this.running = false;
    }

    resume() {
        this.running = true;
    }

    suspendInput() {
        process.stdin.pause();
    }

    resumeInput() {
        process.stdin.resume();
    }

    bindKeyCommand(key: string, command: string) {
        this.commands.set(key, { name: command, state: CommandState.Off, processed: false });
    }

    keyPressed(evt: KeyEvent) {
        let command = this.commands.get(evt.key);
        if (command) {
            if (command.state === CommandState.Off) {
                command.state = CommandState.On;
            } else if (command.state === CommandState.Deactivating) {
                command.state = CommandState.Active;
            }
        }
    }

    run() {
        this.context.start();
        this.start();
        let timer = setInterval(this.main_loop.bind(this), 100);
        this.context.listenInput(this.keyPressed.bind(this), timer);
    }
}



