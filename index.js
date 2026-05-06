// index.js
const { app, port } = require("./src/server");

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
