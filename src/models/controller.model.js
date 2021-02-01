interface Joystick {
    Up: number,
    Right: number,
    Down: number,
    Left: number
}

interface DirectPad {
    DPadUp: number,
    DPadRight: number,
    DpadDown: number,
    DPadLeft: number
}

interface Buttons {
    A: number,
    B: number,
    L: number,
    R: number,
    Z: number,
    Start: number,
}

interface ControlCButtons {
    ControlUp: number,
    ControlRight: number,
    ControlDown: number,
    ControlLeft: number
}


export class Controller {
    joystick: Object<Joystick>;
    directionPad: Object<DirectPad>;
    buttons: Object<Buttons>;
    extras: Object<ControlCButtons>;

    // constructor () {
    //     this.joystick = joystick,
    //     this.directionPad = directionPad,
    //     this.buttons = buttons,
    //     this.extras = controlCButtons,
    // }

}


