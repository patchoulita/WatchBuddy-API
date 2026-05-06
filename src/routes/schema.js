// src/routes/schema.js
const express = require("express");

function createSchemaRouter({ getSchema }) {
  const router = express.Router();

  router.get("/api/v1/schema", (req, res) => {
    const baseUrl = `https://${req.get("host")}`;
    res.json(getSchema(baseUrl));
  });

  return router;
}

module.exports = createSchemaRouter;
