import { httpServerHandler } from "cloudflare:node";
import serverModule from "./src/server.js";

const { createServer } = serverModule;

let handlerPromise = null;

async function getHandler(env) {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      process.env.REDIS_URL = env.REDIS_URL;
      process.env.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
      process.env.GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
      process.env.GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI;

      if (env.SESSION_SECRET) {
        process.env.SESSION_SECRET = env.SESSION_SECRET;
      }

      const { app } = await createServer();
      app.listen(8080);

      return httpServerHandler({ port: 8080 });
    })();
  }

  return handlerPromise;
}

export default {
  async fetch(request, env, ctx) {
    const handler = await getHandler(env);
    return handler.fetch(request, env, ctx);
  }
};