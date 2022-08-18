
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const robot = require("robotjs");
const { google } = require('googleapis');
const child_process = require('child_process');
const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const { BehaviorSubject } = require('rxjs');
const { inputMapper } = require('./input-mapper');

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
const chatInput$ = new BehaviorSubject();

let videoInformation = {
    channel: undefined,
    chatId: undefined,
    videoTitle: undefined,
}

let lastElement = {
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
        videoInformation.channel = videoDetails.snippet.channelTitle
        videoInformation.chatId = videoDetails.liveStreamingDetails.activeLiveChatId;
        videoInformation.videoTitle = videoDetails.snippet.title;

      if (videoDetails === 0) {
          console.error(`No video with id ${VIDEO_ID} was found.`)
      } else {
          console.log('\n\n======= Source =======\n Channel = %s\n Video = %s\n Live Chat Id = %s\n======================\n\n',
            videoInformation.channel, 
            videoInformation.videoTitle,
            videoInformation.chatId);
          getLiveChat(videoInformation.chatId);
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
function getLiveChat(liveChat, updateDelayInterval) {
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
        const delayInterval = liveChatDetails.pollingIntervalMillis <= 2500 ? liveChatDetails.pollingIntervalMillis + 700 : liveChatDetails.pollingIntervalMillis;
        console.log(delayInterval);
        const nextPageToken = liveChatDetails.nextPageToken;

        if (!updateDelayInterval) {     // ensure recursion only begins on first call
            if (liveChatDetails === 0) {
                console.error(`No chat with id ${liveChat} was found.`);
            } else {
                child_process.exec('run node ./build/system-controller.js');
                beginRecursionLogging(liveChat, delayInterval, nextPageToken);
            }
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
        part: 'snippet, authorDetails',
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
                const author = element.authorDetails ? element.authorDetails.displayName : null;
                const time = snippet.publishedAt;
                inputStack.add(JSON.stringify({
                    author: author,
                    time: time,
                    message: snippet.textMessageDetails.messageText,
                }));
            });
            lastElement.previousLastPosition = lastElement.currentLastPosition <= 0 ? 0 : lastElement.currentLastPosition;
            lastElement.currentLastPosition = [...inputStack].length - 1 >= 0 ? [...inputStack].length : 0;
            
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
            console.info('======== chunk: %s ========', i + 1);
            getPaginatedLiveChatAndAddChatsToInputStack(liveChatID, nextPageToken);

            // Update polling interval
            if (i % 20 === 0) getLiveChat(videoInformation.chatId, true)
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
        const content = JSON.parse(el)
        const key = content.message;
        const author = content.author;
        inputMapper(key, author);
    });
};

chatInput$.subscribe((x) => {
    if (x != null) actionAvatar(chatInput$.getValue());
});
    