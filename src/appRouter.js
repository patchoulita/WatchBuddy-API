// src/appRouter.js
const createAuthRouter = require("./routes/auth");
const createMediaRouter = require("./routes/media");
const createStreamRouter = require("./routes/stream");
const createSchemaRouter = require("./routes/schema");

function mountAppRoutes(app, {
  oauth2Client,
  latestTokensRef,
  requireLogin,
  providerContext,
  isVideoMimeType
}) {
  app.use(
    createAuthRouter({
      oauth2Client,
      latestTokensRef
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
      requireLogin
    })
  );

  app.use(
    createStreamRouter({
      provider: providerContext.plugin,
      latestTokensRef,
      isVideoMimeType
    })
  );
}

module.exports = mountAppRoutes;
