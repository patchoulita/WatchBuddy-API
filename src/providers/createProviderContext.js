// src/providers/createProviderContext.js
function createProviderContext(entry) {
  return {
    entry,
    plugin: entry.plugin,
    manifest: entry.manifest,
    getSchema: entry.getSchema
  };
}

module.exports = createProviderContext;
