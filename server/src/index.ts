import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket: Socket) => {

  console.log('Client connected');

  socket.on("disconnect", () => {
    console.log('Client disconnected');
  });

});

httpServer.listen(8008, () => {
  console.log('Server is listening on port 8008');
});