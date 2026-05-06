// src/providers/googleDrive/plugin.js
const { toMediaCatalog, toMediaItem } = require("../../models/media");

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

  async function getItemDetails(tokens, fileId, host) {
    const file = await googleDriveService.getFileMetadata(tokens, fileId);

    if (!isVideoMimeType(file.mimeType)) {
      throw new Error("Requested file is not a video");
    }

    const item = toMediaItem(file, host);

    return {
      title: item.title,
      url: `drive-item://${file.id}`,
      poster: item.thumbnail || "",
      year: null,
      rating: null,
      duration: item.durationMillis || null,
      description: [
        file.mimeType ? `MIME: ${file.mimeType}` : null,
        file.size ? `Size: ${file.size}` : null,
        item.width && item.height ? `Resolution: ${item.width}x${item.height}` : null
      ].filter(Boolean).join(" • "),
      actors: [],
      tags: ["Google Drive", "Video"],
      type: "movie"
    };
  }

  async function getLinks(tokens, fileId, host) {
    const file = await googleDriveService.getFileMetadata(tokens, fileId);

    if (!isVideoMimeType(file.mimeType)) {
      throw new Error("Requested file is not a video");
    }

    if (file.capabilities && file.capabilities.canDownload === false) {
      throw new Error("Download is not allowed for this file");
    }

    return [
      {
        name: file.name || "Google Drive Stream",
        url: `https://${host}/stream/${encodeURIComponent(file.id)}`,
        referer: "",
        user_agent: "",
        subtitles: []
      }
    ];
  }

  async function getStreamFile(tokens, fileId) {
    return googleDriveService.getFileMetadata(tokens, fileId);
  }

  async function getStreamResponse(tokens, fileId, rangeHeader = null) {
    return googleDriveService.getFileStream(tokens, fileId, rangeHeader);
  }

  return {
    getMediaCatalog,
    getItemDetails,
    getLinks,
    getStreamFile,
    getStreamResponse
  };
}

module.exports = createGoogleDrivePlugin;
