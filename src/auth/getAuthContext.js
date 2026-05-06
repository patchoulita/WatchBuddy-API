// src/auth/getAuthContext.js
const { RedisStore } = require("connect-redis");
const { getRedisClient } = require("../lib/redis");

const {
  requireLogin,
  setOAuthCredentialsFromTokens
} = require("../lib/auth");

async function getAuthContext({ sessionSecret, cookieConfig, redisUrl }) {
  const latestTokensRef = { current: null };

  const redisClient = await getRedisClient(redisUrl);
  const sessionStore = new RedisStore({
    client: redisClient,
    prefix: "nobody-tv:"
  });

  const sessionConfig = {
    store: sessionStore,
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
