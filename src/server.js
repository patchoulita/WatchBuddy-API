const env = require("./config/env");
const { google, oauth2Client } = require("./config/google");
const { isVideoMimeType } = require("./lib/media");

const getProviderContext = require("./providers/getProviderContext");
const mountAppRoutes = require("./appRouter");
const createApp = require("./app");
const getAuthContext = require("./auth/getAuthContext");

async function createServer() {
  const port = env.PORT;

  const authContext = await getAuthContext({
    sessionSecret: env.SESSION_SECRET,
    redisUrl: env.REDIS_URL,
    cookieConfig: {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }
  });

  const app = createApp({
    sessionConfig: authContext.sessionConfig
  });

  const providerContext = getProviderContext({
    google,
    oauth2Client,
    setOAuthCredentialsFromTokens: authContext.setOAuthCredentialsFromTokens,
    isVideoMimeType
  });

  mountAppRoutes(app, {
    oauth2Client,
    latestTokensRef: authContext.latestTokensRef,
    requireLogin: authContext.requireLogin,
    providerContext,
    isVideoMimeType
  });

  app.get("/", (req, res) => {
    res.send('Nobody TV provider is running. Schema: <a href="/api/v1/schema">/api/v1/schema</a>');
  });

  return {
    app,
    port
  };
}

module.exports = {
  createServer
};
