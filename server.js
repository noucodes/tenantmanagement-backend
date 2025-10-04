require("dotenv").config();
const { app, initDB } = require("./src/app");

const PORT = process.env.PORT || 8080;

(async () => {
  await initDB();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
