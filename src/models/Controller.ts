import * as fs from 'fs';
import { ControlCButtons } from './ControlCButtons.model';
import { Buttons } from './Buttons.model';
import { DirectionPad } from './DirectionPad.model';
import { Joystick } from './Joystick.model';

// const controllerConfig = '../controller-keybinds/n64.json';

export class Controller {

    public loadComplete: boolean = false;
    public joystick: Joystick;
    public directionPad: DirectionPad;
    public buttons: Buttons;
    public controlCButtons: ControlCButtons;



    loadJSONConfig = (source: any) => {
        fs.readFile(source,  (error: any, data: any) => {
            if (error) {
                console.error(error);
            } else {
                this.joystick = data.joystick;
                this.directionPad = data.directionPad;
                this.buttons = data.buttons;
                this.controlCButtons = data.controlCButtons;
                this.loadComplete = true;
                console.info('--> Controller loaded')
            }
        })
    };

    checkLoadComplete = () => {
        return this.loadComplete;
    }

}
