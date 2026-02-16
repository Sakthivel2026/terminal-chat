const net = require("net");

const clients = [];

const server = net.createServer((socket) => {
  socket.write("Welcome to Terminal Chat\n");
  socket.write("Enter your name: ");

  socket.on("data", (data) => {
    const message = data.toString().trim();

    // First message = username
    if (!socket.username) {
      socket.username = message;
      clients.push(socket);
      broadcast(`${socket.username} joined the chat\n`, socket);
      return;
    }

    // Normal chat message
    broadcast(`${socket.username}: ${message}\n`, socket);
  });

  socket.on("end", () => {
    clients.splice(clients.indexOf(socket), 1);
    if (socket.username) {
      broadcast(`${socket.username} left the chat\n`);
    }
  });
});

function broadcast(msg, sender) {
  clients.forEach((client) => {
    if (client !== sender) {
      client.write(msg);
    }
  });
}

server.listen(3000, () => {
  console.log("Terminal chat server running on port 3000");
});
