// assume controller = N64, P1
export interface Controller {
    joystick: Joystick,
    directionPad?: DirectPad,
    buttons: Buttons,
    extras?: ControlCButtons,
}

export interface DirectPad {
    DPadUp: number,
    DPadRight: number,
    DpadDown: number,
    DPadLeft: number
}

export interface Joystick {
    Up: number,
    Right: number,
    Down: number,
    Left: number
}

export interface ControlCButtons {
    ControlUp: number,
    ControlRight: number,
    ControlDown: number,
    ControlLeft: number
}

export interface Buttons {
    A: number,
    B: number,
    L: number,
    R: number,
    Z: number,
    Start: number,
}