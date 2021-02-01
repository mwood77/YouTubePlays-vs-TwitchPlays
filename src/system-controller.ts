import fs from 'fs';
import readline from 'readline';
import Controller from './models/Controller.ts';

const readable = '~/resources/filtered-output.txt';
const stream = fs.createWriteStream(readable);

const world = 'world';

export function hello(word: string = world): string {
    return `Hello ${world}! `;
}
