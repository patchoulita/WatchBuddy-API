// src/lib/auth.js
function createRequireLogin({ tokenStore }) {
  return async function requireLogin(req, res, next) {
    try {
      const tokens = await tokenStore.getTokens();

      if (!tokens || !tokens.access_token) {
        return res
          .status(401)
          .send('Not logged in. Go to <a href="/auth/google">/auth/google</a>');
      }

      req.watchbuddyTokens = tokens;
      next();
    } catch (error) {
      res.status(500).send(`
        <h1>Auth check failed</h1>
        <pre>${error.message}</pre>
      `);
    }
  };
}

function setOAuthCredentialsFromTokens(oauth2Client, tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

module.exports = {
  createRequireLogin,
  setOAuthCredentialsFromTokens
};