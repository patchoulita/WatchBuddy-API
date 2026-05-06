// src/routes/auth.js
const express = require("express");

function createAuthRouter({ oauth2Client, tokenStore }) {
  const router = express.Router();

  router.get("/auth/google", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "select_account consent",
      scope: ["https://www.googleapis.com/auth/drive.readonly"]
    });

    res.redirect(authUrl);
  });

  router.get("/auth/logout", async (req, res) => {
    try {
      await tokenStore.clearTokens();

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send(`
            <h1>Logout failed</h1>
            <pre>${err.message}</pre>
          `);
        }

        res.send(`
          <h1>Google account cleared</h1>
          <p>The saved Drive token has been removed.</p>
          <p><a href="/auth/google">Sign in with a different Google account</a></p>
        `);
      });
    } catch (error) {
      res.status(500).send(`
        <h1>Logout failed</h1>
        <pre>${error.message}</pre>
      `);
    }
  });

  router.get("/auth/callback", async (req, res) => {
    try {
      const code = req.query.code;

      if (!code) {
        return res.status(400).send("Missing authorization code");
      }

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      req.session.tokens = tokens;

      await tokenStore.setTokens(tokens);
    
      res.send(`
        <h1>Google login successful</h1>
        <p>Your Drive OAuth token has been saved.</p>
        <p><a href="/media">Next: View media</a></p>
        <pre>${JSON.stringify(tokens, null, 2)}</pre>
      `);
    } catch (error) {
      res.status(500).send(`
        <h1>OAuth failed</h1>
        <pre>${error.message}</pre>
      `);
    }
  });

  return router;
}

module.exports = createAuthRouter;
