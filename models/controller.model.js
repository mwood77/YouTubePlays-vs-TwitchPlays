// assume controller = N64, P1
declare interface Controller {
    joystick: Joystick,
    directionPad?: DirectPad,
    buttons: Buttons,
    extras?: ControlCButtons,
}

interface DirectPad {
    DPadUp: number,
    DPadRight: number,
    DpadDown: number,
    DPadLeft: number
}

interface Joystick {
    Up: number,
    Right: number,
    Down: number,
    Left: number
}

interface ControlCButtons {
    ControlUp: number,
    ControlRight: number,
    ControlDown: number,
    ControlLeft: number
}

interface Buttons {
    A: number,
    B: number,
    L: number,
    R: number,
    Z: number,
    Start: number,
}

export {Controller};