// src/providers/googleDrive/metadata.js
function getGoogleDriveProviderSchema(baseUrl) {
  return {
    provider_name: "Nobody TV",
    description: "Streaming nowhere...",
    proxy_url: baseUrl
  };
}

module.exports = {
  getGoogleDriveProviderSchema
};
