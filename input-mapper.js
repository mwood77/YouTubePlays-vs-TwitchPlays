const robot = require("robotjs");

function logInput(key, author) {
    author != null ?
        console.info ('action: ' + key  + '\n\tfrom user: ' + author ) :
        console.info('action: ' + key);
}

/**
 * 
 * @param {string} action key action to emit
 * @param {number} delay duration to emit action
 */
function holdInput(action, modifier) {
    // @todo - appears to be a bug with the 'analog stick' hold down
    const delay = modifier != null ? modifier * 100 : 100
    robot.keyToggle(action.toLowerCase(), 'down');
    robot.setKeyboardDelay(delay);
    robot.keyToggle(action.toLowerCase(), 'up');
}
/**
 * 
 * @param {string} action key action to emit
 * @param {number} delay duration to emit action
 */
function tapOrRepititiveTapInput(action, modifier) {
    if (modifier != null) {
        for (let i = 0; i < modifier; i++) {
            robot.keyToggle(action.toLowerCase(), 'down');
            robot.setKeyboardDelay(35);
            robot.keyToggle(action.toLowerCase(), 'up');
        }
    } else {
        robot.keyToggle(action.toLowerCase(), 'down');
        robot.setKeyboardDelay(30);
        robot.keyToggle(action.toLowerCase(), 'up');
    }
}

/**
 * 
 * @param {array} keys the keys to combo press. Position 0 is always held.
 */
function comboInput(keys) {
    robot.keyToggle(keys[0].toLowerCase(), 'down',);
    robot.setKeyboardDelay(100);
    robot.keyToggle(keys[1].toLowerCase(), 'down');
    robot.setKeyboardDelay(100);
    robot.keyToggle(keys[1].toLowerCase(), 'up');
    robot.keyToggle(keys[0].toLowerCase(), 'up');
}

function inputMapper(key, modifier, author) {
    
    if(key.includes('+')) {
        const keys = key.split('+');
        logInput(key, author);
        comboInput(keys)
    };
    // @todo - add diagonal directional input (use combo?)
    const inputToUpperCase = key.toUpperCase();
    switch (inputToUpperCase) {
        case 'UP':
            logInput(key, author);
            holdInput('up', modifier);
            break;
        case 'DOWN':
            logInput(key, author);
            holdInput('down', modifier);
            break;
        case 'LEFT':
            logInput(key, author);
            holdInput('left', modifier);
            break;
        case 'RIGHT':
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
        case 'L':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'R':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        case 'Z':
            logInput(key, author);
            tapOrRepititiveTapInput(key, modifier);
            break;
        default:
            break;
    }
}


function findNumberAtIndex(string) {
    var num = /\d/;
    var nums = string.match(num);
    return string.indexOf(nums);
}

/**
 * deconstructs input. Find is modifiers are present.
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

// @todo - use to debug
// const sampleInput = [
//     'Z+A',
//     'UP12,UR2,DOWN5,A15,B15',
//     'UP',
//     'A',
//     'Z',
//     'B',
//     'UP12',
//     'A+Z,B12,A+Z',
//     'A+B'
// ];
// sampleInput.forEach(el => translateInput(el));

module.exports = {translateInput};