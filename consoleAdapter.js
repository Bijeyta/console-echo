const botbuilderCore = require('botbuilder-core');
const { BotAdapter, TurnContext, ActivityTypes } = botbuilderCore
const readline = require('readline');

class ConsoleAdapter extends BotAdapter {
    constructor(reference) {
        super();
        this.nextId = 0;
        this.reference = {
            channelId: 'console',
            user: { id: 'user', name: 'User1'},
            bot: { id: 'bot', name: 'Bot'},
            conversation: { id: 'convo1', name: '', isGroup: false},
            serviceUrl: '',
            ...reference
        };
    }

    listen(logic) {
        const rl = this.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        rl.on('line', line => {
            const activity = TurnContext.applyConversationReference(
                {
                    type: ActivityTypes.Message,
                    id: (this.nextId++).toString(),
                    timestamp: new Date(),
                    text: line
                },
                this.reference,
                true
            );
            const context = new TurnContext(this, activity);
            this.runMiddleware(context, logic).catch(err => {
                this.printError(err.toString());
            });
        });
        return () => {
            rl.close();
        };
    }
    continueConversation(reference, logic) {
        const activity = TurnContext.applyConversationReference(
            {},
            reference,
            true
        );
        const context = new TurnContext(this, activity);
        return this.runMiddleware(context, logic).catch(err => {
            this.printError(err.toString());
        });
    }

    async sendActivities(context, activities) {
        const responses = [];
        for (const activity of activities) {
            responses.push({});

            switch (activity.type) {
                case 'delay':
                    await this.sleep(activity.value);
                    break;
                case ActivityTypes.Message:
                    if (
                        activity.attachments && activity.attachments.length > 0
                    ) {
                        const append = activity.attachments.length === 1 ? '(1 attachment)' : `(${ activity.attachments.length } attachments)`;
                        this.print(`${ activity.text} ${ append }`);
                    } else {
                        this.print(activity.text || '');
                    }
                    break;
                default:
                    this.print(`[${ activity.type }]`);
                    break; 
            }
        }
        return responses;
    }

    updateActivity(context, activity) {
        return Promise.reject(new Error('ConsoleAdapter.updateActivity(): not supported.'));
    }

    deleteActivity(context, reference) {
        return Promise.reject(new Error('ConsoleAdapter.deleteActivity(): not supported.'));
    }

    createInterface(options) {
        return readline.createInterface(options);
    }

    print(line) {
        console.log(line);
    }

    printError(line) {
        console.log(line);
    }

    sleep(millisecond) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
}

module.exports = { ConsoleAdapter };