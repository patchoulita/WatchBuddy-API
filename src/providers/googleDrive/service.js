// src/providers/googleDrive/service.js
function createGoogleDriveService({
  google,
  oauth2Client,
  setOAuthCredentialsFromTokens
}) {
  function createDriveClient(tokens) {
    const auth = setOAuthCredentialsFromTokens(oauth2Client, tokens);
    return google.drive({ version: "v3", auth });
  }

  async function listVideoFiles(tokens) {
    const drive = createDriveClient(tokens);

    const response = await drive.files.list({
      q: "trashed = false and mimeType contains 'video/'",
      fields: "files(id,name,mimeType,size,thumbnailLink,videoMediaMetadata,capabilities/canDownload),nextPageToken",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    return response.data;
  }

  async function getFileMetadata(tokens, fileId) {
    const drive = createDriveClient(tokens);

    const response = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,size,capabilities/canDownload",
      supportsAllDrives: true
    });

    return response.data;
  }

  async function getFileStream(tokens, fileId, rangeHeader = null) {
    const drive = createDriveClient(tokens);

    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
        supportsAllDrives: true
      },
      {
        responseType: "stream",
        ...(rangeHeader
          ? {
              headers: {
                Range: rangeHeader
              }
            }
          : {})
      }
    );

    return response;
  }

  return {
    listVideoFiles,
    getFileMetadata,
    getFileStream
  };
}

module.exports = createGoogleDriveService;
