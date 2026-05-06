// src/auth/tokenStore.js
const { getRedisClient } = require("../lib/redis");

const TOKEN_KEY = "nobody-tv:oauth:latest";

async function createTokenStore({ redisUrl }) {
  const redisClient = await getRedisClient(redisUrl);

  return {
    async getTokens() {
      const raw = await redisClient.get(TOKEN_KEY);
      return raw ? JSON.parse(raw) : null;
    },

    async setTokens(tokens) {
      await redisClient.set(TOKEN_KEY, JSON.stringify(tokens));
    },

    async clearTokens() {
      await redisClient.del(TOKEN_KEY);
    }
  };
}

module.exports = createTokenStore;