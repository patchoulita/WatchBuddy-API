// src/routes/media.js
const express = require("express");

function createMediaRouter({
  google,
  requireLogin,
  setOAuthCredentialsFromTokens,
  isVideoMimeType
}) {
  const router = express.Router();

  router.get("/media", requireLogin, async (req, res) => {
    try {
      const auth = setOAuthCredentialsFromTokens(req.session.tokens);
      const drive = google.drive({ version: "v3", auth });

      const response = await drive.files.list({
        q: "trashed = false and mimeType contains 'video/'",
        fields: "files(id,name,mimeType,size,thumbnailLink,videoMediaMetadata,capabilities/canDownload),nextPageToken",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      const files = response.data.files || [];

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
          streamUrl: `https://${req.get("host")}/stream/${encodeURIComponent(file.id)}`
        }));

      res.json({
        items,
        nextPageToken: response.data.nextPageToken || null
      });
    } catch (error) {
      const details = error.response?.data || error.message;

      res.status(500).json({
        error: "Failed to list Drive media",
        details
      });
    }
  });

  router.get("/video-test/:fileId", (req, res) => {
    const { fileId } = req.params;

    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Video Test</title>
        </head>
        <body>
          <h1>Video Test</h1>
          <video controls playsinline width="800" src="/stream/${encodeURIComponent(fileId)}"></video>
        </body>
      </html>
    `);
  });

  return router;
}

module.exports = createMediaRouter;
