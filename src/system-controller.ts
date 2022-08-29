import { Controller } from './models/Controller';
import NES from './controller-keybinds/NES/nes.js';

// @todo - this is a real big pile of todo
export class SystemController extends Controller {

    fart = () => {
        console.log('i farted');
    }

}

const system = new SystemController();

system.loadControllerConfig(NES.default);
system.fart()
