const fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var stream = fs.createWriteStream('output.txt')

var OAuth2 = google.auth.OAuth2;
var service = google.youtube('v3');
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.super-secrets/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';
const API_KEY = process.env.APIKEY;
const VIDEO_ID = process.env.VIDID;

var authed;
var maximumDailyRequests = 10000;


// var { Controller }  = require('./models/controller');
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
        const channel = videoDetails.snippet.channelTitle
        const chatId = videoDetails.liveStreamingDetails.activeLiveChatId;
        const videoTitle = videoDetails.snippet.title

        if (videoDetails == 0) {
            console.error(`No video with id ${VIDEO_ID} was found.`)
        } else {
            console.log('\n\n======= Source =======\n Channel = %s\n Video = %s\n Live Chat Id = %s\n======================\n\n',
              channel, 
              videoTitle,
              chatId);
            getLiveChat(chatId);
        }
    })
}

function getLiveChat(liveChat, interval) {
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
        const totalResults = response.data.pageInfo.totalResults;
        const oldPollingTimeInteval = interval;

        if (liveChatDetails == 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
          beginRecursionLogging(liveChat, liveChatDetails.nextPageToken);
        }
    });
}


function getPaginatedLiveChat(liveChat, nextPageToken) {
    service.liveChatMessages.list({
        auth: authed,
        key: API_KEY,
        liveChatId: liveChat,
        part: 'snippet',
        nextPageToken: nextPageToken
    }, function(err, response) {
        if (err) {
            console.error('Encountered an error retrieving liveChat data: ' + err);
            return;
        }

        const repeat = response.data;
        if (repeat == 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
          // write output to document
          repeat.items.forEach((element, index) => {
            stream.write(element.snippet.textMessageDetails.messageText+'\n');
          })
          // 'separator tone'
          stream.write('\n=====\n=====\n\n')
        }
    });
}

  
function beginRecursionLogging(liveChatID, interval, nextPageToken) {

  (async function loop() {
    for (let i = 0; i < maximumDailyRequests; i++) {
      await new Promise(resolve => setTimeout(resolve, 9000));
      console.info('======== refreshing data @ request number: %s ========', i);
      getPaginatedLiveChat(liveChatID, nextPageToken);
    }
  })();

}
