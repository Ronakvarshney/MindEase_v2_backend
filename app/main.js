const InitializeApp = require("./bootstrap");
const InitializeWS = require("./services/websocket.service");
const config = require("./core/config");
const http = require("http");

const startServer = async () => {
  try {
    const app = await InitializeApp();
    const server = http.createServer(app);
    InitializeWS(server);
    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();
