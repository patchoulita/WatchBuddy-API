const express = require("express");
const session = require("express-session");
const env = require("./config/env");
const { google, oauth2Client, SCOPES } = require("./config/google");
const { requireLogin, setOAuthCredentialsFromTokens } = require("./lib/auth");
const { isVideoMimeType } = require("./lib/media");

const schemaRouter = require("./routes/schema");
const createAuthRouter = require("./routes/auth");
const createMediaRouter = require("./routes/media");
const createStreamRouter = require("./routes/stream");
const createGoogleDriveService = require("./providers/googleDrive/service");

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

const googleDriveService = createGoogleDriveService({
  google,
  oauth2Client,
  setOAuthCredentialsFromTokens
});

app.use(schemaRouter);

app.use(
  createAuthRouter({
    oauth2Client,
    SCOPES,
    latestTokensRef
  })
);

app.use(
  createMediaRouter({
    googleDriveService,
    requireLogin,
    isVideoMimeType
  })
);

app.use(
  createStreamRouter({
    googleDriveService,
    latestTokensRef,
    isVideoMimeType
  })
);

app.get("/", (req, res) => {
  res.send('Nobody TV provider is running. Schema: <a href="/api/v1/schema">/api/v1/schema</a>');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
