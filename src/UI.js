
const UIState = { Idle: 0, Log: 1, Tooltip: 2, Message: 3 };

class UI {
    constructor(context, numLinesBottom = 4, numColsLeft = 20) {
        this.context = context;
        this.turn = 0;
        this.state = UIState.Idle;
        this.numColsLeft = numColsLeft;
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
        return (' '.repeat(numPlaces) + number).substring(numPlaces);
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
            this.drawLeftBar();
            this.drawBottomBar();
        }
    }

    drawLog() {
        const context = this.context;
        const messages = this.log.messages;
        let numToDisplay = Math.min(messages.length, context.height);
        for (let i = 0, index = messages.length - 1; i < numToDisplay; i++, index--) {
            let dy = numToDisplay < this.numLinesBottom - 1 ? numToDisplay - this.numLinesBottom - 1 : 0;
            this.fillMessage(messages[index], 0, context.height - 1 - i + dy, 'office green');
        }
    }

    drawBottomBar() {
        const context = this.context;
        let start = '\u250D' + '\u2501'.repeat(this.numColsLeft + 3);
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
            let num = numToDisplay - this.numLinesBottom - 1;
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

    drawLeftBar() {

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