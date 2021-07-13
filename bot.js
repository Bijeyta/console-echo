class EchoBot {
    async onTurn(context) {
        if (context.activity.type === 'message' && context.activity.text) {
            if (context.activity.text.toLowerCase() === 'quit') {
                context.sendActivity('Bye!');
                process.exit();
            } else {
                return context.sendActivity(`I hear you say "${ context.activity.text}"`);
            }
        }
    }
}

module.exports = { EchoBot };