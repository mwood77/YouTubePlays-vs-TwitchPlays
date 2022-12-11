
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const { BehaviorSubject } = require('rxjs');
const { LiveChat } = require('youtube-chat');
const { translateInput } = require('./input-mapper');

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.super-secrets/';
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';
const CONTROLLER = process.env.YOUTUBE_CONTROLLER;
const VIDEO_ID = process.env.LIVE_VIDEO_ID;
const API_KEY = process.env.API_KEY;

const liveChat = new LiveChat({liveId: VIDEO_ID});

let authed;
const chatInput$ = new BehaviorSubject();

let videoInformation = {
    channel: undefined,
    chatId: undefined,
    videoTitle: undefined,
    pollingInterval: 10000,
}

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
        videoInformation.videoTitle = videoDetails.snippet.title;
        videoInformation.videoId = videoDetails.id;
        videoInformation.chatId = videoDetails.liveStreamingDetails.activeLiveChatId;

      if (videoDetails === 0) {
          console.error(`No video with id ${VIDEO_ID} was found.`)
      } else {
          console.log('\n\n======= Source =======\n Channel = %s\n Video = %s\n Video ID = %s\n Live Chat Id = %s\n======================\n\n',
            videoInformation.channel, 
            videoInformation.videoTitle,
            videoInformation.videoId,
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
        const nextPageToken = liveChatDetails.nextPageToken;
        
        if (liveChatDetails === 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
            handleLiveChatEvents(liveChat, nextPageToken);
        }
    });
};

  
function handleLiveChatEvents() {

    liveChat.on('start', (liveId) => console.log(`handling liveChats from live video id: ${liveId}`));

    liveChat.on("error", (err) => {
        console.log('LiveChat error: ' + err);
    })
    
    liveChat.on("end", (reason) => {
        console.log('LiveChat ended: ' + reason);
    })
    
    liveChat.on('chat', (chatItem) => {
        const author = chatItem.author?.name ? chatItem.author.name : 'unknown';
        const time = chatItem.timestamp;
        const filteredMessageText = chatItem.message.filter(el => el.text).flatMap(el => el?.text.trim());
        const text = filteredMessageText.join(' ');

        const chat = {
            author: author,
            time: time,
            message: text
        };

        if (chat.message != '') chatInput$.next(chat);
    });

    const run = liveChat.start();
    if (!run) console.error('Failed to start; check emitted error');
};

/**
 * emit keyboard events
 * 
 * @param {Array} input BehaviourSubject's value
 */
function actionAvatar(input) {
    const key = input.message;
    translateInput(key, input.author, CONTROLLER);
};

chatInput$.subscribe((x) => {
    if (x != null) actionAvatar(chatInput$.getValue());
});
    