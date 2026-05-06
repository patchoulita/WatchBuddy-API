// src/routes/plugins.js
const express = require("express");

function createPluginsRouter({ providerManifest }) {
  const router = express.Router();

  router.get("/api/v1/get_all_plugins", (req, res) => {
    const manifest = providerManifest;

    const result = [
      {
        name: manifest.provider_name,
        language: "en",
        main_url: manifest.main_url || "https://drive.google.com",
        favicon:
          manifest.favicon ||
          "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
        description: manifest.description,
        main_page: manifest.main_page || {}
      }
    ];

    res.json({
      result
    });
  });

  return router;
}

module.exports = createPluginsRouter;
