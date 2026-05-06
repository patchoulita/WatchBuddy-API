// src/providers/googleDrive/plugin.js
function createGoogleDrivePlugin({
  googleDriveService,
  isVideoMimeType
}) {
  async function getMediaCatalog(tokens, host) {
    const data = await googleDriveService.listVideoFiles(tokens);
    const files = data.files || [];

    const items = files
      .filter(file => isVideoMimeType(file.mimeType))
      .map(file => ({
        id: file.id,
        title: file.name || "Untitled Video",
        type: "video",
        mimeType: file.mimeType || null,
        size: file.size || null,
        durationMillis: file.videoMediaMetadata?.durationMillis || null,
        width: file.videoMediaMetadata?.width || null,
        height: file.videoMediaMetadata?.height || null,
        thumbnail: file.thumbnailLink || null,
        canDownload: file.capabilities?.canDownload ?? null,
        streamUrl: `https://${host}/stream/${encodeURIComponent(file.id)}`
      }));

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
