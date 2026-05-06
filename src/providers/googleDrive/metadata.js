// src/providers/googleDrive/metadata.js
const googleDriveManifest = require("./manifest");

function getGoogleDriveProviderSchema(baseUrl) {
  return {
    provider_name: googleDriveManifest.provider_name,
    description: googleDriveManifest.description,
    proxy_url: baseUrl
  };
}

module.exports = {
  getGoogleDriveProviderSchema
};
