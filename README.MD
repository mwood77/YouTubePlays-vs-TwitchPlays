## Prerequisites:
1. Get your credentials:
    - You'll need an OAuth2 cert from the Google Cloud. [Don't know how? Follow the Prerequisites and Step 1 of this tutorial](https://developers.google.com/youtube/v3/quickstart/nodejs)
    - You'll also need to generate an API key for this Google Cloud project. **Make sure to restrict the key to `YouTube Data API v3`**
2. Copy the cert you downloaded (the json file) in Step 1 to 
    ```
    ~/community-plays/
    ```
    Make sure the cert is named 
    ```
    client_secret.json
    ```
    and not something like...
    ```
    client_secret_sjkdhfalkjh2398y4u23ip4.....com.json
    ```
3. Install dependencies: `npm install`
4. Throw your API key into the `.env` file. See the following example:
    ```
    API_KEY=YOUR_YOUTUBE_API_KEY
    LIVE_VIDEO_ID=THE_ID_OF_THE_LIVE_VIDEO (ex. 36YnV9STBqc)
    ```
5. Proceed to [Run it](#run-it)

## Run it
> If needed, you can delete your O2Auth token to force a new one.
> The token should be located at: `Users/{YOU}/super-secrets/youtube-nodejs-whatever.json`

> If this is the first time you're running the application,
> you'll need to authorize it via google cloud. Simply run this application 
> as normal, and follow the prompts that appear in your terminal. Make sure you paste the generated activation
> hash back into your active terminal.

1. `npm run start-chat-logger`
    * make sure your `LIVE_VIDEO_ID` and `API_KEY` are set in your `.env` file.
2. If prompted to generate new Auth token, do so. By default, this is stored at `Users/{YOUR-USER}/.super-secrets/` 

<!-- 
https://developers.google.com/youtube/v3/quickstart/nodejs

https://nodejs.org/en/docs/guides/backpressuring-in-streams/ 
-->

## Generating random test data
```javascript
const cannedArray = ['LEFT', 'RIGHT', 'ENTER'];
const inputStack = new Set();
const now = Date.now();

function randomPosition(maxPosition) {
    return Math.floor(Math.random() * maxPosition * Math.random());
} 

for (let i = 0; i <= 100; i++) {
    const hashAuthor = 1491733810630004;
    const hashMessage = 4646774944775204;
    const time = new Date;
    inputStack.add(hashAuthor * Math.random(100) + ':'+ hashMessage * Math.random(100) + ':' + time.getMilliseconds() + '=|=' + cannedArray[randomPosition(3)]);
}

console.log([...inputStack]);
```