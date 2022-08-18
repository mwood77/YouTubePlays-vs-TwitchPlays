const robot = require("robotjs");


function logInput(key, author) {
    author != null ?
        console.info ('action: ' + key  + '\n\tfrom user: ' + author ) :
        console.info('action: ' + key);
}

function inputMapper(key, author) {
    const inputToUpperCase = key.toUpperCase();
    switch (inputToUpperCase) {
        case 'UP':
            logInput(key, author);
            robot.keyToggle('up', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('up', 'up');
            break;
        case 'DOWN':
            logInput(key, author);
            robot.keyToggle('down', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('down', 'up');
            break;
        case 'LEFT':
            logInput(key, author);
            robot.keyToggle('left', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('left', "up");
            break;
        case 'RIGHT':
            logInput(key, author);
            robot.keyToggle('right', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('right', 'up');
            break;
        case 'A':
            logInput(key, author);
            robot.keyToggle('a', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('a', 'up');
            break;
        case 'B':
            logInput(key, author);
            robot.keyToggle('b', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('b', 'up');
            break;
        case 'START':
            logInput(key, author);
            robot.keyToggle('enter', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('enter', 'up');
            break;
        case 'L':
            logInput(key, author);
            robot.keyToggle('l', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('l', 'up');
            break;
        case 'R':
            logInput(key, author);
            robot.keyToggle('r', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('r', 'up');
            break;
        case 'Z':
            logInput(key, author);
            robot.keyToggle('z', 'down');
            robot.setKeyboardDelay(50);
            robot.keyToggle('z', 'up');
            break;
        default:
            break;
    }
}

module.exports = {inputMapper};