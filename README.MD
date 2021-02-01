> FYI - this is still very much a work in progress..

## Prerequisites:
1. Get your OAuth2 cert from the Gargler's Cloud. Don't know how? [Follow the Prerequisites and Step 1 of this tutorial](https://developers.google.com/youtube/v3/quickstart/nodejs)
2. Copy the cert you downloaded (the json file) in Step 1 to `~/community-plays/`. Make sure the cert is named `client_secret.json`, not `client_secret_sjkdhfalkjh2398y4u23ip4.....com.json`
3. Install dependencies: `npm install`
4. Throw your API key into the `package.json` file. See the following example:
    <!-- $env:APIKEY="YOUR-API-KEY-GOES-HERE"; node chat-logger.js -->
    ```
    ...
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "tsc": "tsc",
        "start-chat-logger": "cross-env VIDID=YOUR-VIDEO-ID-GOES-HERE APIKEY=YOUR-API-KEY-GOES-HERE node server"
    }
    ...
    ```
5. Proceed to [Run it](#run-it)

## Run it
> If needed, you can delete your O2Auth token to force a new one.
> Token should be located in: `super-secrets/youtube-nodejs-whatever.json`

> If this is the first time you're running the application,
> you'll need to authorize it via google cloud. Simply run this application 
> as normal, and follow the prompts that appear in your terminal. Make sure you paste the generated activation
> hash back into your active terminal.

1. `npm run start-chat-logger`
    * make sure your `VIDID` and `APIKEY` are set in your `package.json` file.
        * _this is ugly as frig, why u do dis?_
            * Because windows and this is OS agnostic. If you're all hot n' bothered by it, fix it, and make a PR.
                * Why are there so many bullet points?
                    * **because I'm a savage and needed a distraction**
2. If prompted to generate new Auth token, do so. By default, this is store at `Users/{YOUR-USER}/.super-secrets/` 


https://developers.google.com/youtube/v3/quickstart/nodejs

https://nodejs.org/en/docs/guides/backpressuring-in-streams/