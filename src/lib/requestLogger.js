// src/lib/requestLogger.js
function requestLogger(req, res, next) {
  const now = new Date().toISOString();
  console.log(
    `[${now}] ${req.method} ${req.originalUrl} - UA: ${req.get("user-agent") || "n/a"}`
  );
  next();
}

module.exports = requestLogger;
