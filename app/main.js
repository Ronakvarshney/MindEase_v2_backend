const InitializeApp = require("./bootstrap");
const config = require("./core/config");

const startServer = async () => {
  try {
    const app = await InitializeApp();
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();
