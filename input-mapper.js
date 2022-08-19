const robot = require("robotjs");

function logInput(key, author) {
    author != null ?
        console.info ('action: ' + key  + '\n\tfrom user: ' + author ) :
        console.info('action: ' + key);
}

/**
 * Single action hold. This is primarily designed to emulate an analog joystick.
 * Button is held 60ms * modifier. 
 * Example, 60ms * 15 = button held for 900ms.
 * 
 * @param {string} action key action to emit
 * @param {number} delay duration to emit action
 */
function holdInput(action, modifier) {
    for (let i = 0; i <= modifier; i++) {
        robot.setKeyboardDelay(60);
        robot.keyToggle(action, 'down');
    }
    robot.keyToggle(action, 'up');
}
/**
 * Single tap without modifier present. If modifier is present
 * it'll tap the action a modifier amount of times
 * 
 * @param {string} action key action to emit
 * @param {number} delay duration to emit action
 */
function tapOrRepititiveTapInput(action, modifier) {
    if (modifier != null) {
        for (let i = 0; i < modifier; i++) {
            robot.keyToggle(action.toLowerCase(), 'down');
            robot.setKeyboardDelay(60);
            robot.keyToggle(action.toLowerCase(), 'up');
        }
    } else {
        robot.keyToggle(action.toLowerCase(), 'down');
        robot.setKeyboardDelay(60);
        robot.keyToggle(action.toLowerCase(), 'up');
    }
}

/**
 * Holds key[0] down, then toggles key[1], then release both
 * 
 * @param {array} keys the actions to combo press. Position 0 is always held.
 */
function comboInput(keys) {
    // keys.forEach((el, index) => el.length > 1 ? )
    robot.keyToggle(keys[0].toLowerCase(), 'down',);
    robot.setKeyboardDelay(75);
    robot.keyToggle(keys[1].toLowerCase(), 'down');
    robot.keyToggle(keys[1].toLowerCase(), 'up');
    robot.keyToggle(keys[0].toLowerCase(), 'up');
}

/**
 * Modified version of comboInput, used to center the camera for Super Mario 64
 * 
 * @param {array} keys the actions to combo press. Position 0 is always held.
 */
 function centerCamera(keys) {
     robot.setKeyboardDelay(60);
    robot.keyToggle(keys[0], 'down');
    robot.keyToggle(keys[0], 'up');
    robot.setKeyboardDelay(75);
    setTimeout(() => {
        robot.keyToggle(keys[1], 'down');
        robot.setKeyboardDelay(60);
        robot.keyToggle(keys[1], 'up');
    }, 1500)
}

function inputMapper(key, modifier, author) {
    if(key.includes('+')) {
        const keys = key.split('+');
        logInput(key, author);
        comboInput(keys)
    };
    const inputToUpperCase = key.toUpperCase();
    switch (inputToUpperCase) {
        case 'U': 
        case 'UP': 
            logInput(key, author);
            holdInput('up', modifier);
            break;
        case 'D':
        case 'DOWN' || 'D':
            logInput(key, author);
            holdInput('down', modifier);
            break;
        case 'LT':
        case 'LEFT' || 'LT':
            logInput(key, author);
            holdInput('left', modifier);
            break;
        case 'RT':
        case 'RIGHT' || 'RT':
            logInput(key, author);
            holdInput('right', modifier);
            break;
        case 'A':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'B':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'START':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'LTRIG':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'RTRIG':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'Z':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'CENTERCAM':
            // Super Mario 64 Specific
            logInput('centering camera', author);
            centerCamera(['u', 'j']); // [0] = zoom in, [1] = zoom out
            break;
        default:
            break;
    }
}


/**
 * Locates the position of a number within a string. If no number is present, -1 is returned.
 * 
 * @param {string} string string to locate number position
 * @returns {number} the index position of the first number
 */
function findNumberAtIndex(string) {
    var num = /\d/;
    var nums = string.match(num);
    return string.indexOf(nums);
}

/**
 * deconstructs input. Find whether modifiers are present.
 * 
 * @param {string} key a comma delimited string of movement actions with or without modifiers
 * @param {string} author author of action
 */
function translateInput(key, author) {
    key.split(',').forEach(e => {
        const modifierPosition = findNumberAtIndex(e);
        
        if (modifierPosition < 0) {
            // no modifier
            inputMapper(e, null, author)
        } else {
            inputMapper(e.slice(0, modifierPosition), e.slice(modifierPosition, e.length), author)
        }
    });
}

/**
 * Use to debug input functions
 */
const sampleInput = [
    'Z+A',
    'UP30,DOWN40,RIGHT15,LEFT32,UP12',
    'CENTERCAM',
    'UP',
    'A',
    'Z',
    'B',
    'UP12',
    'A+B',
    'U23',
    'LT45'
];
setTimeout(function(){
    sampleInput.forEach(
        el => {
            translateInput(el)
        }
    );
}, 2000);

module.exports = {translateInput};