// src/config/google.js
const { google } = require("googleapis");
const env = require("./env");

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly"
];

module.exports = {
  google,
  oauth2Client,
  SCOPES
};
