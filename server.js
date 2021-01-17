const fs = require('fs');
const http = require('http');
var readline = require('readline');
var {google} = require('googleapis');
const port = 3000;

var OAuth2 = google.auth.OAuth2;
var service = google.youtube('v3');
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.super-secrets/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';


var TAKE_THIS_API_KEY_OUT = '';

var authed;
var running = false;
var count = 0;
const VIDEO_ID = process.env.VIDID;               // Your video id

// import { Controller }  from './models/controller.model';
// import * as n64Controller  from './controller-keybinds/n64.json';
// const controls = n64Controller;

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
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
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
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
  var service = google.youtube('v3');
  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'GoogleDevelopers'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var channels = response.data.items;
    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  });
}

// TODO
// 1- get video by ID
// 2 - get live chat from response

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
        var videoDetails = response.data.items[0];
        var chatId = videoDetails.liveStreamingDetails.activeLiveChatId;
        if (videoDetails == 0) {
            console.error(`No video with id ${VIDEO_ID} was found.`)
        } else {
            console.log('Found liveChatId %s for channel %s',
                chatId,
                videoDetails.snippet.channelTitle);
            getLiveChat(chatId);
        }
    })
}

function getLiveChat(liveChat) {
    service.liveChatMessages.list({
        auth: authed,
        key: TAKE_THIS_API_KEY_OUT,
        liveChatId: liveChat,
        part: 'snippet'
    }, function(err, response) {
        if (err) {
            console.error('Encountered an error retrieving liveChat log: ' + err);
            return;
        }
        const liveChatDetails = response.data;
        const totalResults = response.data.pageInfo.totalResults;
        if (liveChatDetails == 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
            running = true;
            console.log(`interval: ${liveChatDetails.pollingIntervalMillis}`);
            getPaginatedLiveChat(liveChat, liveChatDetails.pollingIntervalMillis, liveChatDetails.nextPageToken);
        }
    });
}

function getPaginatedLiveChat(liveChat, pollingInterval, nextPageToken) {
    let repeatValues = {
        newNextPageToken: '',
        interval: 2000,
    };

    service.liveChatMessages.list({
        auth: authed,
        key: TAKE_THIS_API_KEY_OUT,
        liveChatId: liveChat,
        part: 'snippet',
        nextPageToken: nextPageToken
    }, function(err, response) {
        if (err) {
            console.error('Encountered an error retrieving repeat liveChat data: ' + err);
            return;
        }
        let repeat = response.data;
        repeatValues = {
            newNextPageToken: repeat.nextPageToken,
            interval: repeat.pollingIntervalMillis,
        };
        // TEMP TO VIEW DATA =================================
        const totalResults = response.data.pageInfo.totalResults;
        if (repeat == 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
            console.log('The last comment was %s \n',
            repeat.items[totalResults-1].snippet.textMessageDetails.messageText,
            // repeat.items[totalResults-1].snippet.authorChannelId,
            );
            count++;
        }
        // TEMP TO VIEW DATA =================================
    });

    if (running && count === count + 1 || count == 0) {
        setInterval( function() {
            console.log('interval is ' + pollingInterval);
            getPaginatedLiveChat(liveChat, repeatValues.interval, repeatValues.newNextPageToken);
        }, pollingInterval);
    };
}

// TODO
// -- Fix data call to run at the polling time (debug)
//
// -- parse response
// ------- Steps
// ------------- 1:
// ------------- 2:
// ------------- 3:
//

