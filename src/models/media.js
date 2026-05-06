// src/models/media.js
function toMediaItem(file, host) {
  return {
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
  };
}

function toMediaCatalog(files, host, isVideoMimeType) {
  const items = (files || [])
    .filter(file => isVideoMimeType(file.mimeType))
    .map(file => toMediaItem(file, host));

  return items;
}

module.exports = {
  toMediaItem,
  toMediaCatalog
};
