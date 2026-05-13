// src/auth/getAuthContext.js
const createTokenStore = require("./tokenStore");
const {
  createRequireLogin,
  setOAuthCredentialsFromTokens
} = require("../lib/auth");

async function getAuthContext({ redisUrl }) {
  const tokenStore = await createTokenStore({ redisUrl });

  return {
    tokenStore,
    requireLogin: createRequireLogin({ tokenStore }),
    setOAuthCredentialsFromTokens
  };
}

module.exports = getAuthContext;