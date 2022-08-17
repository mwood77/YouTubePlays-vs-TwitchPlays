
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const robot = require("robotjs");
const { google } = require('googleapis');
const child_process = require('child_process');
const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const { BehaviorSubject } = require('rxjs');
const { delay } = require('rxjs/operators');

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.super-secrets/';
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';
const compiledSystemController = './build/system-controller.js';
const VIDEO_ID = process.env.LIVE_VIDEO_ID;
const API_KEY = process.env.API_KEY;

let authed;
const maximumDailyRequests = 10000;
const logFile = './resources/unfiltered.txt';
const stream = fs.createWriteStream(logFile);
const inputStack = new Set();

const testdata = [ '1269263808561907.8:3218045119735973:32=|=LEFT',
  '608735901392197.4:1706407399606036.8:32=|=RIGHT',
  '723178311771181.1:3221158275719277.5:32=|=LEFT',
  '820951888759867.8:3535926528258230:32=|=LEFT',
  '307992593499863.2:526113526534884.06:32=|=RIGHT',
  '559870234966952.8:1799743470955929.5:32=|=LEFT',
  '1087650888835583:2075360276612875.5:32=|=LEFT',
  '1029736948508536:1299292188352571.2:32=|=LEFT',
  '1005582244618705.6:1676320493846581.5:32=|=LEFT',
  '877558502177898.6:2229451411654787.5:32=|=LEFT',
  '222833786899644.72:3533037193623500.5:32=|=LEFT',
  '57269500150224.01:1680123418481632.2:32=|=RIGHT',
  '349651472871849.2:1100253453770880.5:32=|=RIGHT',
  '555910224788135.25:2308181631979193:32=|=RIGHT',
  '639595492638207.5:1722381571786702.2:32=|=RIGHT',
  '598412586987056.9:4586452301137160:32=|=LEFT',
  '474736853259584.8:2377887202977574:32=|=RIGHT',
  '332252554170838.06:4035494236507272.5:32=|=LEFT',
  '1339258216691753.5:145783196883006.66:32=|=LEFT',
  '437584216386933.25:3635063345833791.5:32=|=LEFT',
  '105217705348800.64:715715668949036.8:32=|=RIGHT',
  '1068988747516420.6:114626569450813.05:32=|=LEFT',
  '241205191853257.66:2880290366532234:32=|=LEFT',
  '262701550851957.47:3385484730301904.5:32=|=LEFT',
  '804274843252499.8:3684996282174653.5:33=|=LEFT',
  '705497178773022:1365565964758332.5:33=|=LEFT',
  '826948371517401.2:4126770620465589:33=|=LEFT',
  '385505903268562.1:446209764090673.3:33=|=LEFT',
  '146169530472601.75:4081462092519688.5:33=|=LEFT',
  '93820996327918.75:1190625404849182.8:33=|=LEFT',
  '210350933471577.25:1181508282460232.2:33=|=RIGHT',
  '865717976464411.1:3533940109886320:33=|=LEFT',
  '604966986885668:2959255727170073:33=|=LEFT',
  '582794899553501:1739904337083800.2:33=|=LEFT',
  '1163893909109690.2:3857221171758602:33=|=LEFT',
  '720488498449313:2419624794726517.5:33=|=LEFT',
  '1257479729857760.8:3189829084010346:33=|=RIGHT',
  '155066832365507.84:2768150595960797.5:33=|=RIGHT',
  '204171768321291.16:3501370382092664:33=|=RIGHT',
  '435613090603672.8:638704533751094.1:33=|=LEFT',
  '1253744652005914:2978388908071535:33=|=RIGHT',
  '477033762250198.7:640995175413468:33=|=LEFT',
  '850247850933907.4:3804606534815944.5:33=|=LEFT',
  '1005374039957562.6:2912399792709513.5:33=|=LEFT',
  '541504950718756.56:2074661235820177.5:33=|=LEFT',
  '1098731007415706.1:3614231063745562.5:33=|=LEFT',
  '237533600703343.9:2244116662688153.2:33=|=RIGHT',
  '672800738915612.8:711149174631226.1:33=|=LEFT',
  '1011574757140506.4:1308118469396191.5:33=|=LEFT',
  '426081016514113.4:2400629471128145.5:33=|=LEFT',
  '995077340230530.2:1923831983039593.2:33=|=RIGHT',
  '980173939026746.2:4219167958118671:33=|=LEFT',
  '693467755415769.6:4181979474597712:33=|=RIGHT',
  '507183260132752.7:3303450947742356:33=|=LEFT',
  '1151417717807141.2:4128487731139206.5:33=|=LEFT',
  '1200752642522285.2:1199605205858443.5:33=|=RIGHT',
  '794140352861993.8:2618647666316085.5:33=|=LEFT',
  '623558028386276.9:492574684359982.1:33=|=LEFT',
  '6801724424242.726:762248415488282:33=|=LEFT',
  '99156428608466.83:997417831972676.5:33=|=LEFT',
  '618482058103898.9:2245832417122061.5:33=|=LEFT',
  '290270574060131.5:2985215193721068.5:33=|=LEFT',
  '952986064587133.1:3673853766211337.5:33=|=LEFT',
  '1427377457942597.8:3459254517966215:33=|=LEFT',
  '1109704172227204.1:3985070773414978:33=|=RIGHT',
  '385520528148477.25:3695797997673429.5:33=|=RIGHT',
  '299881217194169.75:3226743797489517:33=|=LEFT',
  '721542239830289.9:3217330157397141:33=|=LEFT',
  '514121937704841.56:1901150445705324.8:33=|=RIGHT',
  '482862814271593.8:2197224956919387:33=|=LEFT',
  '1178687435754539.5:149905180621832.06:33=|=LEFT',
  '149128867760203.78:3919505306935335:33=|=RIGHT',
  '1252113898836603.5:2782971527787428.5:33=|=LEFT',
  '484795843066455.56:1342399731645472.8:33=|=RIGHT',
  '477151834043519.44:4331847709918955:33=|=LEFT',
  '1326062059078907.5:4472175775114513:33=|=LEFT',
  '1430608795921744.5:1111547067823421.8:33=|=LEFT',
  '804005314894806.2:782355625290478:33=|=LEFT',
  '366209516013158:348510085073200.4:33=|=LEFT',
  '1164326712291622.5:1346302046693455:33=|=ENTER',
  '947345497308848.6:996616283944428.6:33=|=LEFT',
  '1134454071147274.5:337445988633126.06:33=|=LEFT',
  '679792856589243.6:1106110272440516.8:33=|=LEFT',
  '574048108766266.5:4291647986044733.5:33=|=LEFT',
  '1088288820919080.8:891595807190834.5:33=|=LEFT',
  '605706887970611.4:4572070785709476:33=|=RIGHT',
  '932302732908228.1:1594557598219547.2:33=|=LEFT',
  '392355242776577.3:2756222226790915:33=|=LEFT',
  '887556534888132.9:2690864546326087.5:33=|=ENTER',
  '450835393283617.75:2494125312456868.5:33=|=LEFT',
  '934059949269530.5:2301044265029808:33=|=LEFT',
  '9005235155612.816:243508839562629.4:33=|=LEFT',
  '732316344034208.4:4574524534268185:33=|=LEFT',
  '479236734384028:3402793314086205:33=|=ENTER',
  '759037540685721:3094964191383003:33=|=LEFT',
  '1329142604099488.2:129788329659065.16:33=|=LEFT',
  '1354955770055928.8:3455708012113448:33=|=RIGHT',
  '776866309438882.5:1432145149864654.8:33=|=LEFT',
  '1335927788374698.5:2545037280881312:33=|=RIGHT',
  '114964822141856.02:1682061688124978.2:33=|=LEFT',
  '956523652346240.4:1341612179832387.5:33=|=RIGHT' ];
testdata.forEach(el => inputStack.add(el))


const chatInput$ = new BehaviorSubject();
let lastElement = {
    id: undefined,
    previousLastPosition: 0,
    currentLastPosition: 0,
};

/**
 *  53 bit hash, used to generate IDs for each "chat message"
 * 
 * Credit: bryc @ StackOverflow: https://stackoverflow.com/a/52171480/10800161
 *
 * @param input the string we're going to generate a hash
 * @param seed optional - will generate alternate hashes for identical inputs
 *
 */
const cyrb53 = function(input, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < input.length; i++) {
        ch = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), getVideoDetails);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
};

/**
 * Gets information related to a particular video.
 * Must be authenticated in-order to make the call.
 *
 * @param {google.auth.OAuth2} auth The OAuth2 token.
 * 
 */
function getVideoDetails(auth) {
  service.videos.list({
      auth: auth,
      id: VIDEO_ID,
      part: 'snippet,liveStreamingDetails'
  }, function(err, response) {
      if (err) {
          console.error('Encountered an error retrieving video details: ' + err);
          return;
      }
      const videoDetails = response.data.items[0];
      const channel = videoDetails.snippet.channelTitle
      const chatId = videoDetails.liveStreamingDetails.activeLiveChatId;
      const videoTitle = videoDetails.snippet.title

      if (videoDetails === 0) {
          console.error(`No video with id ${VIDEO_ID} was found.`)
      } else {
          console.log('\n\n======= Source =======\n Channel = %s\n Video = %s\n Live Chat Id = %s\n======================\n\n',
            channel, 
            videoTitle,
            chatId);
          getLiveChat(chatId);
      }
  });
};

/**
 * Gets information from a live chat instance, on a live video.
 * Must be authenticated in-order to make the call.
 *
 * @param liveChat the live chat session id of a live video.
 * 
 */
function getLiveChat(liveChat) {
    service.liveChatMessages.list({
        auth: authed,
        key: API_KEY,
        liveChatId: liveChat,
        part: 'snippet'
    }, function(err, response) {
        if (err) {
            console.error('Encountered an error retrieving liveChat log: ' + err);
            return;
        }
        const liveChatDetails = response.data;

        if (liveChatDetails === 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
            child_process.exec('run node ./build/system-controller.js');
            beginRecursionLogging(liveChat, null, liveChatDetails.nextPageToken);
        }
    });
};

/**
 * gets latest paginated chats and adds them to the input stack
 *
 * @param liveChat the live chat session id of a live video.
 * @param nextPageToken token passed to API to get next page of chat results.
 * 
 */
function getPaginatedLiveChatAndAddChatsToInputStack(liveChat, nextPageToken) {
    service.liveChatMessages.list({
        auth: authed,
        key: API_KEY,
        liveChatId: liveChat,
        part: 'snippet',
        pageToken: nextPageToken
    }, function(err, response) {
        if (err) {
            console.error('Encountered an error retrieving liveChat data: ' + err);
            return;
        }

        const repeat = response.data;

        if (repeat === 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
            repeat.items.forEach((element) => {
                const snippet = element.snippet;
                const hashAuthor = cyrb53(snippet.authorChannelId)
                const hashMessage = cyrb53(snippet.textMessageDetails.messageText + snippet.authorChannelId)
                const time = new Date;
                inputStack.add(hashAuthor + ':'+ hashMessage + ':' + time.getMilliseconds() + '=|=' + snippet.textMessageDetails.messageText);
            });
            lastElement.previousLastPosition = lastElement.currentLastPosition;
            lastElement.id = [...inputStack][[...inputStack].length - 1].split(':')[1].split('=|=')[0];   // isolate hashMessage
            lastElement.currentLastPosition = [...inputStack].length - 1;

            chatInput$.next([...inputStack].slice(lastElement.previousLastPosition, lastElement.currentLastPosition)); // emit latest chats
        }
    });
};


  
function beginRecursionLogging(liveChatID, delay, nextPageToken) {
    (async function loop() {
        for (let i = 0; i < maximumDailyRequests; i++) {
            if (delay) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                await new Promise(resolve => setTimeout(resolve, 9000));
            }
            console.info('======== refreshing data @ request number: %s ========', i + 1);
            getPaginatedLiveChatAndAddChatsToInputStack(liveChatID, nextPageToken);
        }
    })();
};

/**
 * emit keyboard events
 * 
 * @param {Array} input BehaviourSubject's value
 */
function actionAvatar(input) {
    input.forEach(el => {
        inputMapper(el.split('=|=')[1]);
    });
};

function inputMapper(key) {
    switch (key) {
        case 'UP':
            robot.keyToggle('up', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('up', 'up');
            break;
        case 'DOWN':
            robot.keyToggle('down', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('down', 'up');
            break;
        case 'LEFT':
            robot.keyToggle('left', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('left', "up");
            break;
        case 'RIGHT':
            robot.keyToggle('right', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('right', 'up');
            break;
        case 'A':
            robot.keyToggle('a', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('a', 'up');
            break;
        case 'B':
            robot.keyToggle('b', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('b', 'up');
            break;
        case 'START':
            robot.keyToggle('enter', 'down');
            robot.setKeyboardDelay(250);
            robot.keyToggle('enter', 'up');
            break;
        default:
            console.log('unkown input: '+ key);
            break;
    }
}

chatInput$.subscribe((x) => {
    if (x != null) actionAvatar(chatInput$.getValue());
});
    