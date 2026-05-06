// src/providers/googleDrive/plugin.js
const { toMediaCatalog } = require("../../models/media");

function createGoogleDrivePlugin({
  googleDriveService,
  isVideoMimeType
}) {
  async function getMediaCatalog(tokens, host, { pageToken = null } = {}) {
    const data = await googleDriveService.listVideoFiles(tokens, pageToken);
    const files = data.files || [];

    const items = toMediaCatalog(files, host, isVideoMimeType);

    return {
      items,
      nextPageToken: data.nextPageToken || null
    };
  }

  async function getStreamFile(tokens, fileId) {
    return googleDriveService.getFileMetadata(tokens, fileId);
  }

  async function getStreamResponse(tokens, fileId, rangeHeader = null) {
    return googleDriveService.getFileStream(tokens, fileId, rangeHeader);
  }

  return {
    getMediaCatalog,
    getStreamFile,
    getStreamResponse
  };
}

module.exports = createGoogleDrivePlugin;
