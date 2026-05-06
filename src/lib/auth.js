// src/lib/auth.js
function requireLogin(req, res, next) {
  if (!req.session.tokens || !req.session.tokens.access_token) {
    return res
      .status(401)
      .send('Not logged in. Go to <a href="/auth/google">/auth/google</a>');
  }

  next();
}

function setOAuthCredentialsFromTokens(oauth2Client, tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

module.exports = {
  requireLogin,
  setOAuthCredentialsFromTokens
};
