// src/routes/root.js
const express = require("express");

function createRootRouter({ tokenStore }) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    let hasToken = false;

    try {
      const tokens = await tokenStore.getTokens();
      hasToken = Boolean(tokens && tokens.access_token);
    } catch (e) {
      hasToken = false;
    }

    const statusText = hasToken ? "Connected to Google Drive" : "Not connected";
    const statusColor = hasToken ? "#4ade80" : "#f97373";

    res.send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Nobody TV Provider</title>
          <style>
            :root {
              color-scheme: dark;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
                ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background: radial-gradient(circle at top left, #1f2937 0, #020617 55%);
              color: #e5e7eb;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
            }
            .shell {
              width: 100%;
              max-width: 900px;
            }
            .card {
              background: rgba(15, 23, 42, 0.9);
              border-radius: 16px;
              border: 1px solid rgba(148, 163, 184, 0.4);
              box-shadow:
                0 18px 45px rgba(15, 23, 42, 0.75),
                0 0 0 1px rgba(15, 23, 42, 0.8);
              padding: 24px 24px 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
              margin-bottom: 20px;
            }
            .title-block h1 {
              margin: 0;
              font-size: 1.8rem;
              letter-spacing: 0.03em;
            }
            .title-block p {
              margin: 4px 0 0;
              font-size: 0.95rem;
              color: #9ca3af;
            }
            .status {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 6px 10px;
              border-radius: 999px;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(148, 163, 184, 0.5);
              font-size: 0.85rem;
              color: #e5e7eb;
            }
            .status-dot {
              width: 8px;
              height: 8px;
              border-radius: 999px;
              background: ${statusColor};
              box-shadow: 0 0 10px ${statusColor};
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              gap: 16px;
              margin-top: 8px;
            }
            .item {
              padding: 14px 14px 12px;
              border-radius: 12px;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(55, 65, 81, 0.9);
            }
            .item h2 {
              margin: 0 0 6px;
              font-size: 1rem;
            }
            .item p {
              margin: 0 0 10px;
              font-size: 0.85rem;
              color: #9ca3af;
            }
            .item a {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-size: 0.85rem;
              color: #7dd3fc;
              text-decoration: none;
            }
            .item a:hover {
              text-decoration: underline;
            }
            .item a span {
              font-size: 0.9rem;
            }
            .pill {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 4px 8px;
              border-radius: 999px;
              background: #0f172a;
              border: 1px solid rgba(148, 163, 184, 0.4);
              font-size: 0.75rem;
              color: #9ca3af;
            }
            .pill code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
                Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: 0.72rem;
              color: #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="card">
              <div class="header">
                <div class="title-block">
                  <h1>Nobody TV Provider</h1>
                  <p>Google Drive source for WatchBuddy.</p>
                </div>
                <div class="status">
                  <span class="status-dot"></span>
                  <span>${statusText}</span>
                </div>
              </div>

              <div class="grid">
                <div class="item">
                  <h2>Schema</h2>
                  <p>Inspect the provider schema that WatchBuddy uses to register Nobody TV.</p>
                  <a href="/api/v1/schema">
                    <span>Open schema</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="item">
                  <h2>Login with Google</h2>
                  <p>Authorize Nobody TV to read videos from your Google Drive.</p>
                  <a href="/auth/google">
                    <span>Start login</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="item">
                  <h2>Logout / Switch Account</h2>
                  <p>Clear the saved token and sign in with a different Google account.</p>
                  <a href="/auth/logout">
                    <span>Logout &amp; switch</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="item">
                  <h2>Plugins View</h2>
                  <p>Raw JSON view of the plugin list that WatchBuddy requests.</p>
                  <a href="/api/v1/get_all_plugins">
                    <span>Get all plugins</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="item">
                  <h2>Health</h2>
                  <p>Quick health check endpoint for monitoring and debugging.</p>
                  <a href="/health">
                    <span>Health check</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="item">
                  <h2>Media Catalog</h2>
                  <p>Direct view into the current Drive media catalog JSON.</p>
                  <a href="/api/v1/media">
                    <span>Open catalog</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <div style="margin-top:16px;">
                <span class="pill">
                  <span>Base URL</span>
                  <code>${req.protocol}://${req.get("host")}</code>
                </span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  return router;
}

module.exports = createRootRouter;
