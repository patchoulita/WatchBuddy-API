

const express = require("express");
const session = require("express-session");
const env = require("./config/env");
const { google, oauth2Client, SCOPES } = require("./config/google");

const schemaRouter = require("./routes/schema");
const createAuthRouter = require("./routes/auth");
const createMediaRouter = require("./routes/media");

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
    google,
    requireLogin,
    setOAuthCredentialsFromTokens,
    isVideoMimeType
  })
);

function requireLogin(req, res, next) {
  if (!req.session.tokens || !req.session.tokens.access_token) {
    return res
      .status(401)
      .send('Not logged in. Go to <a href="/auth/google">/auth/google</a>');
  }
  next();
}

function setOAuthCredentialsFromTokens(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

function isVideoMimeType(mimeType) {
  return typeof mimeType === "string" && mimeType.startsWith("video/");
}

app.get("/", (req, res) => {
  res.send('Nobody TV provider is running. Schema: <a href="/api/v1/schema">/api/v1/schema</a>');
});

app.get("/stream/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!latestTokensRef.current || !latestTokensRef.current.access_token) {
      return res.status(401).json({
        error: "No Google token available. Sign in again at /auth/google"
      });
    }

    const auth = setOAuthCredentialsFromTokens(latestTokensRef.current);
    const drive = google.drive({ version: "v3", auth });

    const metaResponse = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,size,capabilities/canDownload",
      supportsAllDrives: true
    });

    const file = metaResponse.data;
    const totalSize = Number(file.size);

    if (!isVideoMimeType(file.mimeType)) {
      return res.status(400).json({
        error: "Requested file is not a video",
        file
      });
    }

    if (file.capabilities && file.capabilities.canDownload === false) {
      return res.status(403).json({
        error: "Download is not allowed for this file"
      });
    }

    if (!req.headers.range) {
      const mediaResponse = await drive.files.get(
        {
          fileId,
          alt: "media",
          supportsAllDrives: true
        },
        {
          responseType: "stream"
        }
      );

      res.writeHead(200, {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": totalSize,
        "Accept-Ranges": "bytes"
      });

      return mediaResponse.data.pipe(res);
    }

    const range = req.headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (isNaN(start) || isNaN(end) || start > end || end >= totalSize) {
      return res.status(416).set({
        "Content-Range": `bytes */${totalSize}`
      }).end();
    }

    const chunkSize = (end - start) + 1;

    const mediaResponse = await drive.files.get(
      {
        fileId,
        alt: "media",
        supportsAllDrives: true
      },
      {
        responseType: "stream",
        headers: {
          Range: `bytes=${start}-${end}`
        }
      }
    );

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${totalSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": file.mimeType || "application/octet-stream"
    });

    mediaResponse.data.pipe(res);
  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;

    res.status(status).json({
      error: "Failed to stream Drive file",
      details
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
