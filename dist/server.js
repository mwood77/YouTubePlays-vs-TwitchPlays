"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { google, youtube_v3, oauth2_v2 } from 'googleapis';
const { gapi } = require("https://apis.google.com/js/api.js");
const secret = __importStar(require("./super-secrets/me-client.json"));
const http = require('http');
const port = 3000;
const n64Controller = __importStar(require("./controller-keybinds/n64.json"));
const controls = n64Controller;
const oauth2Client = new gapi.auth.OAuth2(secret["client-ID"], secret["client-Secret"], secret["client-redirect"]);
gapi.options({
    auth: oauth2Client
});
function authenticate() {
    return gapi.client.getAuthInstance()
        .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
        .then(function () { console.log("Sign-in successful"); }, function (err) { console.error("Error signing in", err); });
}
function loadClient() {
    gapi.client.setApiKey(oauth2Client._clientSecret);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", 'v3')
        .then(function () { console.log("GAPI client loaded for API"); }, function (err) { console.error("Error loading GAPI client for API", err); });
}
authenticate().then(loadClient);
//create a server object:
// http.createServer(function (req, res) {
//   res.write('farts'); //write a response to the client
//   res.end(); //end the response
// }).listen(port);
// console.info(`Running port ${port}`);
// const event = new KeyboardEvent("keydown", {
//     key: 38,
//   } as KeyboardEventInit);
//# sourceMappingURL=server.js.map