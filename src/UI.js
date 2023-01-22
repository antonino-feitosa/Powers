
const UIState = { Idle: 0, Log: 1, Tooltip: 2, Message: 3, Invetory: 4, Equipment:5, Skill:6 };

class UI {
    constructor(game, numLinesBottom = 4, numColsRight = 15) {
        this.game = game;
        this.context = game.context;
        this.turn = 0;
        this.state = UIState.Idle;
        this.numColsRight = numColsRight;
        this.numLinesBottom = numLinesBottom;

        this.messages = [];
        this.alertMessage = '';
        this.log = { messages: [], index: 0 };
        this.tooltip = { x: 0, y: 0, message: 0 };
    }

    nextTurn() {
        this.turn += 1;
        this.alertMessage = '';
        this.log.index = this.log.messages.length;
    }

    input(player, key) {
        if (key === "'") {
            this.state = this.state === UIState.Log ? UIState.Idle : UIState.Log;
            return 'draw';
        }
        if(!player.isDead)
            return this.inputActions(player, key);
    }

    inputText() {

    }

    inputActions(player, key) {
        switch (key) {
            case 'h': player.tryMove(-1, +0); break;
            case 'k': player.tryMove(+0, -1); break;
            case 'j': player.tryMove(+0, +1); break;
            case 'l': player.tryMove(+1, +0); break;
            case 'y': player.tryMove(-1, -1); break;
            case 'u': player.tryMove(+1, -1); break;
            case 'b': player.tryMove(-1, +1); break;
            case 'n': player.tryMove(+1, +1); break;
            default: return null;
        }
        return 'action';
    }

    printMessage(messages) {

    }

    printAlertMessage(message) {
        this.alertMessage = message;
    }

    formatNumber(number, numPlaces) {
        let str = ' '.repeat(numPlaces-1) + number;
        return str.substring(str.length - numPlaces);
    }

    printLog(message) {
        let index = this.formatNumber(this.turn, 4);
        this.log.messages.push(` Turn ${index}: ` + message);
    }

    draw() {
        if (this.state === UIState.Log) {
            this.context.clear();
            this.drawLog();
        } else {
            this.drawRightBar();
            this.drawBottomBar();
        }
    }

    drawLog() {
        const context = this.context;
        const messages = this.log.messages;
        let numToDisplay = Math.min(messages.length, context.height);
        for (let i = 0, index = messages.length - 1; i < numToDisplay; i++, index--) {
            let dy = numToDisplay < this.numLinesBottom - 1 ? numToDisplay - this.numLinesBottom - 1 : 0;
            this.fillMessage(messages[index], 0, context.height - 1 - i + dy, 'irish green');
        }
    }

    drawBottomBar() {
        const context = this.context;
        let start = '\u250D\u2501';
        let middle = this.alertMessage ? ' ' + this.alertMessage + ' ' : '';
        let end = '\u2501'.repeat(context.width - start.length - middle.length - 1) + '\u2511';

        let index = 0;
        index = this.fillMessage(start, index, context.height - 4);
        index = this.fillMessage(middle, index, context.height - 4, 'yellow');
        index = this.fillMessage(end, index, context.height - 4);

        const messages = this.log.messages;
        const count = this.log.index;
        let numToDisplay = messages.length - count;

        if (numToDisplay > this.numLinesBottom - 1) {
            let num = numToDisplay - this.numLinesBottom + 1;
            num = this.formatNumber(num, 2);
            let str = ` more ${num} ... `;
            this.fillMessage(str, context.width - (str.length + 2), context.height - 4);
            numToDisplay = this.numLinesBottom - 1;
        }
        for (let i = 0, index = messages.length - 1; i < numToDisplay; i++, index--) {
            let dy = numToDisplay < 3 ? numToDisplay - 3 : 0;
            this.fillMessage(messages[index], 0, context.height - 1 - i + dy, 'white');
        }
    }

    drawRightBar() {
        const context = this.context;
        const barX = context.width - this.numColsRight;
        context.render(barX, 0, '\u2503');
        for(let i=1;i<context.height - this.numLinesBottom;i++){
            context.render(barX, i, '\u2503');
        }

        let turnMessage = 'Turn: ' + this.formatNumber(this.game.turnCount, 6)
        this.fillMessage(turnMessage, barX + 2, 1);
        let depthMessage = 'Depth: ' + this.formatNumber(this.game.depth, 5);
        this.fillMessage(depthMessage, barX + 2, 2);

        const player = this.game.player;
        let hp = player.combatStatus.hp;
        let maxHP = player.combatStatus.maxHP;
        let hpMessage = 'HP:  ' + this.formatNumber(hp, 3) + '/' + this.formatNumber(maxHP, 3);
        this.fillMessage(hpMessage, barX + 2, 4);
    }

    drawToolTip(x, y, message) {

    }

    fillMessage(msg, index, height, fg = 'white', bg = 'black') {
        let width = Math.min(this.context.width, msg.length);
        for (let c = 0; c < width; c++) {
            this.context.render(c + index, height, msg[c], fg, bg);
        }
        return index + width;
    }
}

module.exports = {
    UI
}