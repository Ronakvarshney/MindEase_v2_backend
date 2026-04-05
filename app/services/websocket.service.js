const WebSocket = require("ws");

const InitializeWS = (server) => {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(ip);
    console.log("client connected");

    ws.on("close", () => {
      console.log("client disconnected");
    });
  });

  server.on("upgrade", (req, socket, head) => {
    console.log(req.url);
    if (!req.url.startsWith("/chat")) {
      return socket.destroy();
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
};

module.exports = InitializeWS;
