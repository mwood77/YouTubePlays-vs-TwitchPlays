## Dependency it
`npm install`

## Baby's first steps:
1. Get your OAuth2 cert from the Gargler's Cloud. Don't know how? [Follow the Prerequisites and Step 1 of this tutorial](https://developers.google.com/youtube/v3/quickstart/nodejs)
2. Copy the cert (json) you downloaded in Step 1 to `~/community-plays/super-secrets/`. Make sure the cert is named `client_secret.json`, not `client_secret_sjkdhfalkjh2398y4u23ip4.....json`

## Run it
1. delete your O2Auth token to force a new one. Token should be located in: `super-secrets/youtube-nodejs-whatever.json`
2. run the service: `$env:VIDID="36YnV9STBqc" ; node .\server.js`
3. If prompted to generate new Auth token, do so.

https://developers.google.com/youtube/v3/quickstart/nodejs

https://nodejs.org/en/docs/guides/backpressuring-in-streams/