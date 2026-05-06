const env = require("./config/env");
const { google, oauth2Client } = require("./config/google");
const { isVideoMimeType } = require("./lib/media");
const requestLogger = require("./lib/requestLogger");

const getProviderContext = require("./providers/getProviderContext");
const mountAppRoutes = require("./appRouter");
const createApp = require("./app");
const getAuthContext = require("./auth/getAuthContext");

async function createServer() {
  console.log("REDIS_URL present?", Boolean(process.env.REDIS_URL));
  const port = env.PORT;

  const authContext = await getAuthContext({
    sessionSecret: env.SESSION_SECRET,
    redisUrl: process.env.REDIS_URL,
    cookieConfig: {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }
  });

  const app = createApp({
    sessionConfig: authContext.sessionConfig
  });

  // Log all incoming requests (for debugging what WatchBuddy calls)
  app.use(requestLogger);

  const providerContext = getProviderContext({
    google,
    oauth2Client,
    setOAuthCredentialsFromTokens: authContext.setOAuthCredentialsFromTokens,
    isVideoMimeType
  });

  mountAppRoutes(app, {
    tokenStore: authContext.tokenStore,
    requireLogin: authContext.requireLogin,
    oauth2Client,
    providerContext,
    isVideoMimeType
  });

  return {
    app,
    port
  };
}

module.exports = {
  createServer
};
