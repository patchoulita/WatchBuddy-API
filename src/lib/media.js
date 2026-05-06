// src/lib/media.js
function isVideoMimeType(mimeType) {
  return typeof mimeType === "string" && mimeType.startsWith("video/");
}

module.exports = {
  isVideoMimeType
};
