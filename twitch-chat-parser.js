require('dotenv').config();
const { translateInput } = require('./input-mapper');
const tmi = require('tmi.js');

const CONTROLLER = process.env.TWITCH_CONTROLLER;

const client = new tmi.Client({
	channels: [ process.env.TWITCH_CHANNEL ],
    options: {
        debug: false,
        messagesLogLevel: 'warn',
    },
    logger: {
        info: (msg) => console.info(msg),
        warn: (msg) => console.warn(msg),
        error: (msg) => console.error(msg),
    }
});



client.connect();

client.on('message', (channel, tags, message, self) => {
    if(self) return;
    translateInput(message, tags['display-name'], CONTROLLER);
});
