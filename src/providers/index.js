// src/providers/index.js
const createGoogleDriveService = require("./googleDrive/service");
const createGoogleDrivePlugin = require("./googleDrive/plugin");

function createProviders({
  google,
  oauth2Client,
  setOAuthCredentialsFromTokens,
  isVideoMimeType
}) {
  const googleDriveService = createGoogleDriveService({
    google,
    oauth2Client,
    setOAuthCredentialsFromTokens
  });

  const googleDrivePlugin = createGoogleDrivePlugin({
    googleDriveService,
    isVideoMimeType
  });

  return {
    googleDrive: {
      service: googleDriveService,
      plugin: googleDrivePlugin
    }
  };
}

module.exports = createProviders;
