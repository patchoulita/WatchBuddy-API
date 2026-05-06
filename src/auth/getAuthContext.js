// src/auth/getAuthContext.js
const {
  requireLogin,
  setOAuthCredentialsFromTokens
} = require("../lib/auth");

function getAuthContext({ sessionSecret, cookieConfig }) {
  const latestTokensRef = { current: null };

  const sessionConfig = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: cookieConfig
  };

  return {
    sessionConfig,
    latestTokensRef,
    requireLogin,
    setOAuthCredentialsFromTokens
  };
}

module.exports = getAuthContext;
