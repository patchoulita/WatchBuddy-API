// src/routes/root.js
const express = require("express");

function createRootRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.send(
      'Nobody TV provider is running. Schema: <a href="/api/v1/schema">/api/v1/schema</a>'
    );
  });

  return router;
}

module.exports = createRootRouter;
