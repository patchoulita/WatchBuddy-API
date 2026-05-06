// src/routes/providerApi.js
const express = require("express");

function createProviderApiRouter({
  providerManifest,
  provider,
  tokenStore
}) {
  const router = express.Router();

  router.get("/api/v1/get_plugin", (req, res) => {
    const requestedPlugin = req.query.plugin;

    if (!requestedPlugin) {
      return res.status(410).json({
        error: "/api/v1/get_plugin?plugin=Nobody%20TV"
      });
    }

    if (requestedPlugin !== providerManifest.provider_name) {
      return res.status(410).json({
        error: `/api/v1/get_plugin?plugin=${encodeURIComponent(providerManifest.provider_name)}`
      });
    }

    const encodedMainPage = {};
    for (const [url, category] of Object.entries(providerManifest.main_page || {})) {
      encodedMainPage[encodeURIComponent(url)] = encodeURIComponent(category);
    }

    res.json({
      result: {
        name: providerManifest.provider_name,
        language: "en",
        main_url: providerManifest.main_url || "https://drive.google.com",
        favicon:
          providerManifest.favicon ||
          "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
        description: providerManifest.description,
        main_page: encodedMainPage
      }
    });
  });

  router.get("/api/v1/get_main_page", async (req, res) => {
    try {
      const requestedPlugin = req.query.plugin;
      const page = Number(req.query.page || 1);
      const encodedUrl = req.query.encoded_url || "";
      const encodedCategory = req.query.encoded_category || "";

      if (!requestedPlugin || !encodedUrl || !encodedCategory) {
        return res.status(410).json({
          error: `/api/v1/get_main_page?plugin=${encodeURIComponent(
            providerManifest.provider_name
          )}&page=1&encoded_url=&encoded_category=`
        });
      }

      if (requestedPlugin !== providerManifest.provider_name) {
        return res.status(410).json({
          error: `/api/v1/get_main_page?plugin=${encodeURIComponent(
            providerManifest.provider_name
          )}&page=1&encoded_url=&encoded_category=`
        });
      }

      const tokens = await tokenStore.getTokens();

      if (!tokens || !tokens.access_token) {
        return res.status(401).json({
          error: "No Google token available. Visit /auth/google in a browser to authorize Nobody TV."
        });
      }

      const catalog = await provider.getMediaCatalog(
        tokens,
        req.get("host")
      );

      const result = (catalog.items || []).map((item) => ({
        title: item.title,
        url: encodeURIComponent(`drive-item://${item.id}`),
        poster: item.thumbnail || "",
        poster_url: item.thumbnail || "",
        type: "movie"
      }));

      res.json({
        result
      });
    } catch (error) {
      const details = error.response?.data || error.message;

      res.status(500).json({
        error: "Failed to build main page",
        details
      });
    }
  });

  router.get("/api/v1/load_item", async (req, res) => {
    try {
      const requestedPlugin = req.query.plugin;
      const encodedUrl = req.query.encoded_url || "";

      if (!requestedPlugin || !encodedUrl) {
        return res.status(410).json({
          error: `/api/v1/load_item?plugin=${encodeURIComponent(
            providerManifest.provider_name
          )}&encoded_url=`
        });
      }

      if (requestedPlugin !== providerManifest.provider_name) {
        return res.status(410).json({
          error: `/api/v1/load_item?plugin=${encodeURIComponent(
            providerManifest.provider_name
          )}&encoded_url=`
        });
      }

      const decodedUrl = decodeURIComponent(encodedUrl);

      if (!decodedUrl.startsWith("drive-item://")) {
        return res.status(400).json({
          error: "Unsupported encoded_url"
        });
      }

      const fileId = decodedUrl.replace("drive-item://", "");
      const tokens = await tokenStore.getTokens();

      if (!tokens || !tokens.access_token) {
        return res.status(401).json({
          error: "No Google token available. Visit /auth/google in a browser to authorize Nobody TV."
        });
      }

      const result = await provider.getItemDetails(
        tokens,
        fileId,
        req.get("host")
      );

      res.json({ result });
    } catch (error) {
      const details = error.response?.data || error.message;

      res.status(500).json({
        error: "Failed to load item",
        details
      });
    }
  });

  return router;
}

module.exports = createProviderApiRouter;
