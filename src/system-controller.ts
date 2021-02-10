import * as fs  from 'fs';
import * as readline from 'readline';
import { Controller } from './models/Controller';

const readable = './resources/filtered-output.txt';
const stream = fs.createWriteStream(readable);

import {default as controllerConfig}  from '../controller-keybinds/n64.json';

export class SystemController extends Controller {



    fart = () => {
        console.log('i farted')
    }

}

const system = new SystemController();

system.loadJSONConfig(controllerConfig);
system.fart()
