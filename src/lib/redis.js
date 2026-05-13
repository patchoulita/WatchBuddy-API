// src/lib/redis.js
const {
  createClient
} = require("redis");

let redisClient = null;

async function getRedisClient(redisUrl) {
  console.log("redis: getRedisClient called");
  console.log("redis: url present?", Boolean(redisUrl));

  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  if (redisClient) {
    console.log("redis: reusing existing client");
    return redisClient;
  }

  redisClient = createClient( {
    url: redisUrl
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  console.log("redis: before connect");
  await redisClient.connect();
  console.log("redis: after connect");

  return redisClient;
}

module.exports = {
  getRedisClient
};
