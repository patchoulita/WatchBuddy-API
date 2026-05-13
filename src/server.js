const env = require("./config/env");
const { google, oauth2Client } = require("./config/google");
const { isVideoMimeType } = require("./lib/media");

const getProviderContext = require("./providers/getProviderContext");
const mountAppRoutes = require("./appRouter");
const createApp = require("./app");
const getAuthContext = require("./auth/getAuthContext");

async function createServer() {
  console.log("createServer: start");
  console.log("REDIS_URL present?", Boolean(process.env.REDIS_URL));

  const port = env.PORT;
  console.log("createServer: before getAuthContext");

  const authContext = await getAuthContext({
    redisUrl: process.env.REDIS_URL
  });

  console.log("createServer: after getAuthContext");

  const app = createApp();
  console.log("createServer: after createApp");

  const providerContext = getProviderContext({
    google,
    oauth2Client,
    setOAuthCredentialsFromTokens: authContext.setOAuthCredentialsFromTokens,
    isVideoMimeType
  });

  console.log("createServer: after getProviderContext");

  mountAppRoutes(app, {
    tokenStore: authContext.tokenStore,
    requireLogin: authContext.requireLogin,
    oauth2Client,
    providerContext,
    isVideoMimeType
  });

  console.log("createServer: after mountAppRoutes");

  return {
    app,
    port
  };
}

module.exports = {
  createServer
};