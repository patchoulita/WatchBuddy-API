const express = require("express");
const session = require("express-session");
const env = require("./config/env");
const { google, oauth2Client, SCOPES } = require("./config/google");
const { requireLogin, setOAuthCredentialsFromTokens } = require("./lib/auth");
const { isVideoMimeType } = require("./lib/media");

const createProviders = require("./providers");
const selectProvider = require("./providers/selectProvider");
const createProviderContext = require("./providers/createProviderContext");
const mountAppRoutes = require("./appRouter");

const app = express();
app.set("trust proxy", 1);

const port = env.PORT;

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

const latestTokensRef = { current: null };

const providers = createProviders({
  google,
  oauth2Client,
  setOAuthCredentialsFromTokens,
  isVideoMimeType
});

const providerContext = createProviderContext(
  selectProvider(providers)
);

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
