## Prerequisites:
1. Get your OAuth2 cert from the Gargler's Cloud. Don't know how? [Follow the Prerequisites and Step 1 of this tutorial](https://developers.google.com/youtube/v3/quickstart/nodejs)
2. Copy the cert (json) you downloaded in Step 1 to `~/community-plays/super-secrets/`. Make sure the cert is named `client_secret.json`, not `client_secret_sjkdhfalkjh2398y4u23ip4.....json`
3. Install dependencies: `npm install`
4. Throw your API key into the `package.json` file. See the following example:
    > ⚠️ **There is an existing key in the package.json file. Can I use that?** ⚠️ - Sure, but it won't work.
    <!-- $env:APIKEY="YOUR-API-KEY-GOES-HERE"; node server.js -->
    ```
    ...
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "tsc": "tsc",
        "start-chat-logger": "cross-env VIDID=YOUR-VIDEO-ID-GOES-HERE APIKEY=YOUR-API-KEY-GOES-HERE node server"
    }
    ...
    ```
5. Proceed to "Run it"

## Run it
> If needed, you can delete your O2Auth token to force a new one. Token should be located in: `super-secrets/youtube-nodejs-whatever.json`
1. `npm run start-chat-logger`
    * make sure your `VIDID` and `APIKEY` are set in your `package.json` file.
        * _this is ugly as frig, why u do dis?_
            * Because windows and this is OS agnostic. If you're super bothered by it, fix it and make a PR.
                * Why are there so many bullet points?
                    * **because I'm a savage and needed a distraction**
2. If prompted to generate new Auth token, do so.
https://developers.google.com/youtube/v3/quickstart/nodejs

https://nodejs.org/en/docs/guides/backpressuring-in-streams/