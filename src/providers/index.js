// src/providers/index.js
const createGoogleDriveService = require("./googleDrive/service");
const createGoogleDrivePlugin = require("./googleDrive/plugin");
const googleDriveManifest = require("./googleDrive/manifest");

const { getGoogleDriveProviderSchema } = require("./googleDrive/metadata");

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
      manifest: googleDriveManifest,
      service: googleDriveService,
      plugin: googleDrivePlugin,
      getSchema: getGoogleDriveProviderSchema
    }
  };
}

module.exports = createProviders;
