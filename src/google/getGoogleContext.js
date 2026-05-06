// src/google/getGoogleContext.js
const { google } = require("googleapis");

function getGoogleContext({
  clientId,
  clientSecret,
  redirectUri,
  scopes
}) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  return {
    google,
    oauth2Client,
    scopes
  };
}

module.exports = getGoogleContext;
