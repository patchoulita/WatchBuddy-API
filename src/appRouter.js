// src/appRouter.js
const createAuthRouter = require("./routes/auth");
const createMediaRouter = require("./routes/media");
const createStreamRouter = require("./routes/stream");
const createSchemaRouter = require("./routes/schema");
const createHealthRouter = require("./routes/health");
const createRootRouter = require("./routes/root");

function mountAppRoutes(app, {
  oauth2Client,
  tokenStore,
  requireLogin,
  providerContext,
  isVideoMimeType
}) {
  app.use(createRootRouter());
  
  app.use(createHealthRouter());
  
  app.use(
    createAuthRouter({
      oauth2Client,
      tokenStore
    })
  );

  app.use(
    createSchemaRouter({
      getSchema: providerContext.getSchema
    })
  );

  app.use(
    createMediaRouter({
      provider: providerContext.plugin,
      requireLogin,
      tokenStore
    })
  );

  app.use(
    createStreamRouter({
      provider: providerContext.plugin,
      tokenStore,
      isVideoMimeType
    })
  );
}

module.exports = mountAppRoutes;
