import { Controller } from './models/Controller';

// import * as controllerKeybinds  from './controller-keybinds/';
import NES from './controller-keybinds/NES/nes.js';

export class SystemController extends Controller {



    fart = () => {
        console.log('i farted')
    }

}

const system = new SystemController();

system.loadControllerConfig(NES.default);
system.fart()
