
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

const testdata = [ '1050243313400561.6:2376772392753257.5:335=|=ENTER=|=Aida Oksana 🔺️☆',
'841937597586246.8:4386672525389954:335=|=LEFT=|=vaishali',
'434795035213907.3:3977872357608002.5:335=|=LEFT=|=vaishali',
'49909936592802.11:3883331693455261.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1130021023969435.5:3889815867030546:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1162579990885944:413921440017639.9:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'317853007674827.9:4306209062198743.5:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'182449716944153.94:3378637712106175:335=|=LEFT=|=Aida Oksana 🔺️☆',
'617731611478739.5:554671247879168.56:335=|=LEFT=|=Aida Oksana 🔺️☆',
'434253021389381.8:2443646231604394:335=|=ENTER=|=🌾🎶🎶',
'828370366334848.8:1275614047215231:335=|=ENTER=|=vaishali',
'1165506262424032:3421607523255743:335=|=LEFT=|=vaishali',
'575537420444590.8:831724905323452:335=|=LEFT=|=vaishali',
'329485789339809.4:969412452185977.8:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'712210144455184.8:3302605127931300.5:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'1225383140893735.8:2550282124513094.5:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'470087571975176.94:2104525808731612.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1059920525603903.9:4437235187726014.5:335=|=LEFT=|=K_A_N_G____ ',
'126718930081721.92:1361177894640070:335=|=LEFT=|=Aida Oksana 🔺️☆',
'374115304778481.2:887675014018862.5:335=|=LEFT=|=K_A_N_G____ ',
'453003718062229.06:2724529784619024.5:335=|=LEFT=|=K_A_N_G____ ',
'590219167636891:4420105473118714:335=|=LEFT=|=vaishali',
'526034955324059.06:1235742970820725.8:335=|=LEFT=|=🌾🎶🎶',
'71840771482217.4:25355304599018.617:335=|=LEFT=|=Aida Oksana 🔺️☆',
'919809831790566.5:1000419227592975.8:335=|=RIGHT=|=K_A_N_G____ ',
'125743780963826.72:3164424429155026:335=|=RIGHT=|=K_A_N_G____ ',
'397303338508457:3757864003039555:335=|=LEFT=|=K_A_N_G____ ',
'910298997619704.4:3886761481714707.5:335=|=LEFT=|=vaishali',
'1227431273057677.2:445363017172448.7:335=|=ENTER=|=Aida Oksana 🔺️☆',
'191899494861383.9:768623247924382.4:335=|=LEFT=|=Aida Oksana 🔺️☆',
'599832106587562:19513144429818.32:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1025696550660054.1:4176986151393697:335=|=LEFT=|=vaishali',
'1255631696710433:2642380656508372:335=|=ENTER=|=Aida Oksana 🔺️☆',
'442788387689029:484092872170436.94:335=|=LEFT=|=K_A_N_G____ ',
'1160797819884071.5:777681640920036.2:335=|=LEFT=|=K_A_N_G____ ',
'1207017417699139.8:4401625439073893:335=|=LEFT=|=K_A_N_G____ ',
'590311683019578.4:3023940744195486.5:335=|=LEFT=|=K_A_N_G____ ',
'271392102867188.06:3563171757611504:335=|=LEFT=|=🌾🎶🎶',
'1307499673044888.2:951128440077690.9:335=|=DOWN=|=Aida Oksana 🔺️☆',
'148727409282588.12:2933506888376201:335=|=RIGHT=|=K_A_N_G____ ',
'924908833811538.6:3990412489169149.5:335=|=RIGHT=|=K_A_N_G____ ',
'163988327867748.72:374589153132633.4:335=|=LEFT=|=Aida Oksana 🔺️☆',
'935401511472786.2:532194388814573:335=|=LEFT=|=K_A_N_G____ ',
'957488200463029.5:1350463687040518.8:335=|=LEFT=|=Aida Oksana 🔺️☆',
'340872440406416.2:1212625316497483.5:335=|=ENTER=|=Aida Oksana 🔺️☆',
'10486521357779.662:176126239618266.78:335=|=RIGHT=|=K_A_N_G____ ',
'248796146655241.78:3307693616744094.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1025889398014716.5:2520705844966886:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1301456057809024.2:2666303589109587:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'1411852863906553.2:602018131546168.5:335=|=UP=|=vaishali',
'1281475697407507:4073313665806772:335=|=ENTER=|=K_A_N_G____ ',
'794815929408774:1522825612598027.5:335=|=ENTER=|=vaishali',
'1367383024903466.5:1888007668420550.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1437256613860390.2:486241542467773.7:335=|=LEFT=|=K_A_N_G____ ',
'1338992598422737.5:3945603321296386.5:335=|=UP=|=Aida Oksana 🔺️☆',
'768283263520862.8:1741832306221082.8:335=|=LEFT=|=vaishali',
'359888742358958.56:924833355868820.2:335=|=LEFT=|=K_A_N_G____ ',
'1180281193685698.8:916362252169091.2:335=|=LEFT=|=vaishali',
'385491881565912.56:4128662311611780:335=|=UP=|=Aida Oksana 🔺️☆',
'76650303006657.66:582564796753714.4:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'1094216312558896:2545459348245375:335=|=LEFT=|=K_A_N_G____ ',
'473838806020895.25:3706518636002796.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'639541898535353.1:1145641927279756:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1057135375120823.6:2832928044847410:335=|=RIGHT=|=K_A_N_G____ ',
'1401493368904820:516105634007191.25:335=|=LEFT=|=K_A_N_G____ ',
'10317299705621.943:2091400068428706.8:335=|=UP=|=Aida Oksana 🔺️☆',
'1456607105645389.8:1313630773101211.8:335=|=UP=|=Aida Oksana 🔺️☆',
'36000774649885.72:3808612698673270.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1010375415717310.2:394071339218195.25:335=|=UP=|=Aida Oksana 🔺️☆',
'966491197670643.1:4641986292125107:335=|=RIGHT=|=Aida Oksana 🔺️☆',
'1274451454797492.8:2597591256395696.5:335=|=LEFT=|=🌾🎶🎶',
'380072815096426.4:2487014467199091.5:335=|=LEFT=|=K_A_N_G____ ',
'489127787961942.25:2127112743047175.5:335=|=DOWN=|=K_A_N_G____ ',
'750455615952127.9:2722417735938478:335=|=LEFT=|=vaishali',
'117120778407750.7:3424042822504412.5:335=|=LEFT=|=K_A_N_G____ ',
'463350007263303.3:1577028892504768.5:335=|=DOWN=|=Aida Oksana 🔺️☆',
'570351883581154.1:2874586585110053.5:335=|=ENTER=|=K_A_N_G____ ',
'914741944991484.2:941404712103820.4:335=|=LEFT=|=🌾🎶🎶',
'1193317788040382.5:682561105716171.8:335=|=RIGHT=|=K_A_N_G____ ',
'898145446032548.6:2659374148700151:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1428198351979657.5:3187036927112056.5:335=|=DOWN=|=K_A_N_G____ ',
'374364596635328.4:3450977777111254:335=|=LEFT=|=Aida Oksana 🔺️☆',
'860393899372901.9:3108015373632189.5:335=|=ENTER=|=K_A_N_G____ ',
'599691752510686.6:1897364694086121.8:335=|=LEFT=|=K_A_N_G____ ',
'1377777058923215.8:4044768515677229:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1218038009308307.5:2433958061284409.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'699429705609701.6:1576936788606921.8:335=|=LEFT=|=Aida Oksana 🔺️☆',
'6518935228449.809:2609225189684034.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'474689386924513.06:1933711615215158:335=|=LEFT=|=Aida Oksana 🔺️☆',
'1358034184384621:2152866740956289.5:335=|=LEFT=|=K_A_N_G____ ',
'1475732127092635.5:4375827239803265:335=|=LEFT=|=vaishali',
'216508785839474.75:3502225873862403.5:335=|=LEFT=|=Aida Oksana 🔺️☆',
'859845039083475:479456520971321.56:335=|=UP=|=K_A_N_G____ ',
'985022918741521.6:3505462793818890:335=|=LEFT=|=Aida Oksana 🔺️☆',
'582618046264618.5:737697481858709.9:335=|=RIGHT=|=K_A_N_G____ ',
'649127284995018.8:1557117558978591.8:335=|=RIGHT=|=vaishali',
'777994610783585.4:3505438234396619.5:335=|=UP=|=🌾🎶🎶',
'300614539689543.9:1207908062088171.5:335=|=ENTER=|=K_A_N_G____ ',
'348633165975792.56:4112482977446241.5:335=|=UP=|=vaishali',
'936739134872628:2761180147229277:335=|=DOWN=|=K_A_N_G____ ',
'1333861953801080.2:236209750101889.5:335=|=ENTER=|=Aida Oksana 🔺️☆' ];
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
        const delayInterval = liveChatDetails.pollingIntervalMillis;
        const nextPageToken = liveChatDetails.nextPageToken;

        if (liveChatDetails === 0) {
            console.error(`No chat with id ${liveChat} was found.`);
        } else {
            child_process.exec('run node ./build/system-controller.js');
            beginRecursionLogging(liveChat, delayInterval, nextPageToken);
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
                const hashAuthor = cyrb53(snippet.authorChannelId);
                const hashMessage = cyrb53(snippet.textMessageDetails.messageText + snippet.authorDetails);
                const time = new Date;
                inputStack.add(hashAuthor + ':'+ hashMessage + ':' + time.getMilliseconds() + '=|=' + snippet.textMessageDetails.messageText + '=|=' + author);
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
            console.info('======== chunk: %s ========', i + 1);
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
        const key = el.split('=|=')[1].split('=|=')[0]
        const author = el.split('=|=')[2];
        inputMapper(key, author);
    });
};

chatInput$.subscribe((x) => {
    if (x != null) actionAvatar(chatInput$.getValue());
});
    