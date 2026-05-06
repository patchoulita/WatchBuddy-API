// src/providers/createProviderEntry.js
function createProviderEntry({
  manifest,
  service,
  plugin,
  getSchema
}) {
  return {
    manifest,
    service,
    plugin,
    getSchema
  };
}

module.exports = createProviderEntry;
