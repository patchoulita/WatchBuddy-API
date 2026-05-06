// src/lib/redis.js
const { createClient } = require("redis");

let redisClient = null;

async function getRedisClient(redisUrl) {
  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: redisUrl
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  await redisClient.connect();

  return redisClient;
}

module.exports = {
  getRedisClient
};
