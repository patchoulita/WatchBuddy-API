// src/app.js
const express = require("express");
const session = require("express-session");

function createApp({ sessionConfig }) {
  const app = express();

  app.set("trust proxy", 1);

  // If your current server.js already has these lines,
  // move them here exactly as-is. If not, leave them out.
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));

  app.use(session(sessionConfig));

  return app;
}

module.exports = createApp;
