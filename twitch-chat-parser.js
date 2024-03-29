require('dotenv').config();
const { translateInput } = require('./input-mapper');
const tmi = require('tmi.js');

const CONTROLLER = process.env.TWITCH_CONTROLLER;

const client = new tmi.Client({
	channels: [ process.env.TWITCH_CHANNEL ],
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
    if(self) return;
    translateInput(message, tags['display-name'], CONTROLLER);
});