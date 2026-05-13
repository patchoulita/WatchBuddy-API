// src/app.js
const express = require("express");

function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(express.urlencoded( {
    extended: true
  }));

  return app;
}

module.exports = createApp;
