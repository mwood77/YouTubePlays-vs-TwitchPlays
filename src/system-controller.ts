import * as fs  from 'fs';
// import * as readline from 'readline';
// import * as Controller from './models/Controller';

const readable = './resources/filtered-output.txt';
const stream = fs.createWriteStream(readable);
