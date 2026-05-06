// src/routes/root.js
const express = require("express");

function createRootRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Nobody TV</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #111;
              color: #f5f5f5;
              margin: 0;
              padding: 32px 20px;
              line-height: 1.5;
            }
            .wrap {
              max-width: 720px;
              margin: 0 auto;
            }
            h1 {
              margin: 0 0 12px;
              font-size: 2rem;
            }
            p {
              margin: 0 0 20px;
              color: #d0d0d0;
            }
            ul {
              list-style: none;
              padding: 0;
              margin: 24px 0 0;
            }
            li {
              margin: 12px 0;
            }
            a {
              color: #7dd3fc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            .card {
              background: #1b1b1b;
              border: 1px solid #333;
              border-radius: 12px;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <h1>Nobody TV</h1>
              <p>WatchBuddy Google Drive provider is running.</p>

              <ul>
                <li><a href="/api/v1/schema">Schema</a></li>
                <li><a href="/auth/google">Login with Google</a></li>
                <li><a href="/auth/logout">Logout / Switch Google Account</a></li>
                <li><a href="/api/v1/get_all_plugins">Get All Plugins</a></li>
                <li><a href="/health">Health Check</a></li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  return router;
}

module.exports = createRootRouter;
