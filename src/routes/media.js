// src/routes/media.js
const express = require("express");

function createMediaRouter({
  provider,
  requireLogin
}) {
  const router = express.Router();

  router.get("/media", requireLogin, async (req, res) => {
    try {
      const catalog = await provider.getMediaCatalog(
        req.session.tokens,
        req.get("host")
      );

      res.json(catalog);
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
