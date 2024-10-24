import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer(
  (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("https://github.com/NotReeceHarris/asciidepths.com");
  }
);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket: Socket) => {

  console.log('Client connected');

  socket.on("disconnect", () => {
    console.log('Client disconnected');
  });

});

httpServer.listen(8080, () => {
  console.log('Server is listening on port 8080');
});