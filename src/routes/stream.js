// src/routes/stream.js
const express = require("express");

function createStreamRouter({
  provider,
  tokenStore,
  isVideoMimeType
}) {
  const router = express.Router();

  function attachStreamCleanup(req, res, upstream) {
    const cleanup = () => {
      if (upstream && !upstream.destroyed) {
        upstream.destroy();
      }
    };

    req.on("close", cleanup);
    req.on("aborted", cleanup);
    res.on("close", cleanup);
    res.on("finish", cleanup);
    res.on("error", cleanup);
    upstream.on("error", cleanup);
  }

  router.get("/stream/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;

      const tokens = await tokenStore.getTokens();

      if (!tokens || !tokens.access_token) {
        return res.status(401).json({
          error: "No Google token available. Sign in again at /auth/google"
        });
      }

      const file = await provider.getStreamFile(
        tokens,
        fileId
      );
      const totalSize = Number(file.size);

      if (!isVideoMimeType(file.mimeType)) {
        return res.status(400).json({
          error: "Requested file is not a video",
          file
        });
      }

      if (file.capabilities && file.capabilities.canDownload === false) {
        return res.status(403).json({
          error: "Download is not allowed for this file"
        });
      }

      if (!req.headers.range) {
        const mediaResponse = await provider.getStreamResponse(
          tokens,
          fileId
        );

        const upstream = mediaResponse.data;
        attachStreamCleanup(req, res, upstream);

        res.writeHead(200, {
          "Content-Type": file.mimeType || "application/octet-stream",
          "Content-Length": totalSize,
          "Accept-Ranges": "bytes"
        });

        return upstream.pipe(res);
      }

      const range = req.headers.range;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || isNaN(end) || start > end || end >= totalSize) {
        return res.status(416).set({
          "Content-Range": `bytes */${totalSize}`
        }).end();
      }

      const chunkSize = (end - start) + 1;

      const mediaResponse = await provider.getStreamResponse(
        tokens,
        fileId,
        `bytes=${start}-${end}`
      );

      const upstream = mediaResponse.data;
      attachStreamCleanup(req, res, upstream);

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": file.mimeType || "application/octet-stream"
      });

      upstream.pipe(res);
    } catch (error) {
      const status = error.response?.status || 500;
      const details = error.response?.data || error.message;

      res.status(status).json({
        error: "Failed to stream Drive file",
        details
      });
    }
  });

  return router;
}

module.exports = createStreamRouter;
