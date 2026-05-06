// src/providers/getProviderContext.js
const createProviders = require("./index");
const selectProvider = require("./selectProvider");
const createProviderContext = require("./createProviderContext");

function getProviderContext({
  google,
  oauth2Client,
  setOAuthCredentialsFromTokens,
  isVideoMimeType
}) {
  const providers = createProviders({
    google,
    oauth2Client,
    setOAuthCredentialsFromTokens,
    isVideoMimeType
  });

  const selectedProvider = selectProvider(providers);

  return createProviderContext(selectedProvider);
}

module.exports = getProviderContext;
