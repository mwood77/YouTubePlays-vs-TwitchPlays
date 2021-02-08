import * as fs from 'fs';
import { ControlCButtons } from './ControlCButtons.model';
import { Buttons } from './Buttons.model';
import { DirectionPad } from './DirectionPad.model';
import { Joystick } from './Joystick.model';

const controllerConfig = '../controller-keybinds/n64.json';

export class Controller {

    public loadComplete: boolean = false;

    constructor(
        public joystick: Joystick,
        public directionPad: DirectionPad,
        public buttons: Buttons,
        public controlCButtons: ControlCButtons
        ) {
        this.loadJSONConfig(controllerConfig);
    };

    loadJSONConfig = (source: any) => {
        fs.readFile(source,  (error: any, data: any) => {
            this.joystick = data.joystick;
            this.directionPad = data.directionPad;
            this.buttons = data.buttons;
            this.controlCButtons = data.controlCButtons;

            this.loadComplete = true;
        })
    };

}
