# YouTubePlays vs TwitchPlays

## What this is
This is a collection of applications which integrate with Twitch's IRC server and Youtube's Data V3 API, to provide near real time "player input." The actioned input is then emitted as part of a websocket client <-> server connection, which can be consumed by further dependents.

Players participate by sending chat messages through Youtube live or Twitch's chat box. Because of the division between chat parsers, this allows us to assign each platform a different input (controller); 
you can have different platforms (or livestreams) play against one another, without any remote code execution.

### What this (guide) isn't
- I strongly advise that you have a basic understanding of JavaScript / Node before you use this
- You must figure out how you plan to interface this with other software (games, interactive software, microcontrollers, etc). There is a basic keyboard event emitter/mapper included.
- This was written with *nix systems in mind. It should be Windows compatible, but I haven't checked.

## Setup
1. Duplicate the `.env.sample` file and rename it to `.env`
    - This new `.env` file will be gitignored, but **make sure you do not publicize any data contained in this file!**
1. Assign controllers to the stream/platform.
    - Example where player 1 is youtube and player 2 is twitch
        ```properties
        # PLAYER CONTROLLER
        YOUTUBE_CONTROLLER=1
        TWITCH_CONTROLLER=2
        ```
1. Use `nvm` (Node Version Manager) to handle your node dev environmnet. [Download nvm by clicking here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script).
    - Once `nvm` is installed, run the following command `nvm use && nvm install`. The environment should detect NodeJS 18 as a requirement and install/set Node 18.
1. Now install the project's dependencies: 
    ```shell
    npm install
    ```

### YouTube
1. Get your credentials:
    - You'll need an OAuth2 cert from Google Cloud. [Don't know how? Follow the Prerequisites and Step 1 of this tutorial](https://developers.google.com/youtube/v3/quickstart/nodejs)
    - You'll also need to generate an API key for this Google Cloud project. **Make sure to restrict the key to `YouTube Data API v3`**
1. Copy the cert you downloaded (the json file) in Step 1 to 
    ```
    ~/YouTubePlays-vs-TwitchPlays/
    ```
    - Make sure the cert is named `client_secret.json` and not something like `client_secret_sjkdhfalkjh2398y4u23ip4.....com.json`
1. Throw your API key into the `.env` file. 
    - See the following example:
        ```properties
        API_KEY=YOUR_YOUTUBE_API_KEY
        LIVE_VIDEO_ID=THE_ID_OF_THE_LIVE_VIDEO (ex. 36YnV9STBqc)
        ```
    - The live video id can be taken out of the URL, but **it must be active and a livestream.** The id follows the `v=` parameter in the url.
        ```sh
        Example:
        https://www.youtube.com/watch?v=dQw4w9WgXcQ

        Here the id is dQw4w9WgXcQ
        ```
1. Proceed to [Running a parser](#running-a-parser)

### Twitch
1. Get the id of the channel you wish to connect to. You can extract the id from the url.
    ```sh
    Example:
    https://www.twitch.tv/twitchplayspokemon

    Here the id is twitchplayspokemon
    ```
1. Add the channel id to the `.env` file
    ```properties
    TWITCH_CHANNEL=YOUR_TWITCH_CHANNEL
    ```
1. Proceed to [Running a parser](#running-a-parser)

## Running a parser

### Streaming
This will run everything required to stream. Ensure all of the required information is filled-in, in the `.env` file.

Now run:
```
npm run stream
```

### Individual Parsers
#### Youtube
> If needed, you can delete your O2Auth token to force a new one.
> The token should be located at: `Users/{YOUR-USER}/.super-secrets/`

> If this is the first time you're running the application,
> you'll need to authorize it via google cloud. Simply run this application 
> as normal and follow the prompts that appear in your terminal. Make sure you paste the generated activation
> hash back into your active terminal.

1. `npm run start:yt`
    * make sure your `LIVE_VIDEO_ID` and `API_KEY` are set in your `.env` file.
2. If prompted to generate a new Auth token, do so. By default this is stored at `Users/{YOUR-USER}/.super-secrets/`

#### Twitch
1. `npm run start:twitch`

## Websocket consumers (dependents)
Your consumer applications can connect to the websocket server with the following URLS:
```shell
ws://localhost:8070/{ 2 | 3 | 4 | etc }
```

Note
 that the values `2 | 3 | 4 | etc` must be unique to each connected client.

# Debugging

### Generate random test data for parsers
```javascript
const cannedArray = ['LEFT', 'RIGHT', 'ENTER', 'UP', 'DOWN'];
const cannedAuthorArray = ['Aida Oksana 🔺️☆', 'K_A_N_G____ ', 'vaishali', '🌾🎶🎶', 'если не указано кому обращение значит этот вопрос ко всем'];
const inputStack = new Set();
const now = Date.now();

function randomPosition(maxPosition) {
    return Math.floor(Math.random() * maxPosition * Math.random());
} 

for (let i = 0; i <= 100; i++) {
    const hashAuthor = 1491733810630004;
    const hashMessage = 4646774944775204;
    const time = new Date;
    inputStack.add(hashAuthor * Math.random(100) + ':'+ hashMessage * Math.random(100) + ':' + time.getMilliseconds() + '=|=' + cannedArray[randomPosition(5)] + '=|='+ cannedAuthorArray[randomPosition(5)]);
}

console.log([...inputStack]);
```

### Debugging the input mapper

Scroll to the bottom of `input-mapper.js` and uncomment all of the code. Then run the file with the following command:
    
```shell
node input-mapper.js
```
