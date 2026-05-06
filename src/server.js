const env = require("./config/env");
const { google, oauth2Client, SCOPES } = require("./config/google");
const { requireLogin, setOAuthCredentialsFromTokens } = require("./lib/auth");
const { isVideoMimeType } = require("./lib/media");

const getProviderContext = require("./providers/getProviderContext");
const mountAppRoutes = require("./appRouter");
const createApp = require("./app");

const port = env.PORT;

const sessionConfig = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
};

const app = createApp({ sessionConfig });

const latestTokensRef = { current: null };

const providerContext = getProviderContext({
  google,
  oauth2Client,
  setOAuthCredentialsFromTokens,
  isVideoMimeType
});

mountAppRoutes(app, {
  oauth2Client,
  latestTokensRef,
  requireLogin,
  providerContext,
  isVideoMimeType
});

app.get("/", (req, res) => {
  res.send('Nobody TV provider is running. Schema: <a href="/api/v1/schema">/api/v1/schema</a>');
});

module.exports = {
  app,
  port
};
