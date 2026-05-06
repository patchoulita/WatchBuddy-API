require("dotenv").config();

const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");

const schemaRouter = require("./routes/schema");
const createAuthRouter = require("./routes/auth");

const app = express();
app.set("trust proxy", 1);

const port = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly"
];

const latestTokensRef = { current: null };

app.use(schemaRouter);

app.use(
  createAuthRouter({
    oauth2Client,
    SCOPES,
    latestTokensRef
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

app.get("/media", requireLogin, async (req, res) => {
  try {
    const auth = setOAuthCredentialsFromTokens(req.session.tokens);
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: "trashed = false and mimeType contains 'video/'",
      fields: "files(id,name,mimeType,size,thumbnailLink,videoMediaMetadata,capabilities/canDownload),nextPageToken",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    const files = response.data.files || [];

    const items = files
      .filter(file => isVideoMimeType(file.mimeType))
      .map(file => ({
        id: file.id,
        title: file.name || "Untitled Video",
        type: "video",
        mimeType: file.mimeType || null,
        size: file.size || null,
        durationMillis: file.videoMediaMetadata?.durationMillis || null,
        width: file.videoMediaMetadata?.width || null,
        height: file.videoMediaMetadata?.height || null,
        thumbnail: file.thumbnailLink || null,
        canDownload: file.capabilities?.canDownload ?? null,
        streamUrl: `https://${req.get("host")}/stream/${encodeURIComponent(file.id)}`
      }));

    res.json({
      items,
      nextPageToken: response.data.nextPageToken || null
    });
  } catch (error) {
    const details = error.response?.data || error.message;
    res.status(500).json({
      error: "Failed to list Drive media",
      details
    });
  }
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

app.get("/video-test/:fileId", (req, res) => {
  const { fileId } = req.params;

  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Video Test</title>
      </head>
      <body>
        <h1>Video Test</h1>
        <video controls playsinline width="800" src="/stream/${encodeURIComponent(fileId)}"></video>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
