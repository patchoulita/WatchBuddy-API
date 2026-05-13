import { httpServerHandler } from "cloudflare:node";
import serverModule from "./src/server.js";

const { createServer } = serverModule;
const { app } = await createServer();

app.listen(8080);

export default httpServerHandler({ port: 8080 });