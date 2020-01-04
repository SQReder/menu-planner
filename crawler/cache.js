const Keyv = require("keyv");

const keyv = new Keyv("sqlite://./database.sqlite");

// Handle DB connection errors
keyv.on("error", err => {
  console.error("Connection Error", err);
  process.exit(1);
});

module.exports = keyv;
