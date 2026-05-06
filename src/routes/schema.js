// src/routes/schema.js
const express = require("express");

const router = express.Router();

router.get("/api/v1/schema", (req, res) => {
  const baseUrl = `https://${req.get("host")}`;

  res.json({
    provider_name: "Nobody TV",
    description: "Streaming nowhere...",
    proxy_url: baseUrl,
  });
});

module.exports = router;
