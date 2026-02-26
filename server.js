const net = require("net");
const fs = require("fs");


function loadUsers() {
  if (!fs.existsSync("users.json")) {
    fs.writeFileSync("users.json", "{}");
  }
  return JSON.parse(fs.readFileSync("users.json", "utf8"));
}

function saveUsers(users){
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

const clients = [];
const userSockets = new Map();

const server = net.createServer((socket) => {

  socket.authenticated = false;
  socket.stage = "MENU"; // MENU | REG_USER | REG_PASS | LOGIN_USER | LOGIN_PASS
  socket.tempUsername = "";

  socket.write("1. Register\n2. Login\nChoose option: ");

  socket.on("data", (data) => {
    const input = data.toString().trim();
    if (!input) return;
    const users = loadUsers();

    // -------- MENU --------
    if (socket.stage === "MENU") {
      if (input === "1") {
        socket.stage = "REG_USER";
        socket.write("Enter username: ");
        return;
      }
      if (input === "2") {
        socket.stage = "LOGIN_USER";
        socket.write("Enter username: ");
        return;
      }
      socket.write("Invalid choice\nChoose option: ");
      return;
    }

    // REGISTER USERNAME
    if (socket.stage === "REG_USER") {
      if (users[input]) {
        socket.write("Username already exists\nEnter username: ");
        return;
      }
      socket.tempUsername = input;
      socket.stage = "REG_PASS";
      socket.write("Enter password: ");
      return;
    }

    // REGISTER PASSWORD 
    if (socket.stage === "REG_PASS") {
      users[socket.tempUsername] = input;
      saveUsers(users);

      socket.stage = "MENU";
      socket.write("Registration successful\n\n1. Register\n2. Login\nChoose option: ");
      return;
    }

    // LOGIN USERNAME 
    if (socket.stage === "LOGIN_USER") {
      if (!users[input]) {
        socket.write("User not found\nEnter username: ");
        return;
      }
      socket.tempUsername = input;
      socket.stage = "LOGIN_PASS";
      socket.write("Enter password: ");
      return;
    }

    // LOGIN PASSWORD
    if (socket.stage === "LOGIN_PASS") {
      if (users[socket.tempUsername] !== input) {
        socket.write("Wrong password\nEnter password: ");
        return;
      }

      socket.authenticated = true;
      socket.username = socket.tempUsername;
      socket.stage = "CHAT";
      clients.push(socket);
      userSockets.set(socket.username, socket);

      socket.write("Login successful. You can chat now.\n");
      broadcast(`${socket.username} joined the chat\n`, socket);
      return;
    }

   // -------- CHAT --------
if (socket.stage === "CHAT") {

  // -------- ONLINE USERS LIST --------
  if (input === "/users") {
  const onlineUsers = Array.from(userSockets.keys());

  if (onlineUsers.length === 0) {
    socket.write("No users online\n");
  } else {
    socket.write("Online users: " + onlineUsers.join(", ") + "\n");
  }
  return;
 }

  // PRIVATE MESSAGE
  if (input.startsWith("/pm ")) {
    const parts = input.split(" ");
    const targetUser = parts[1];
    const privateMsg = parts.slice(2).join(" ");

    if (!targetUser || !privateMsg) {
      socket.write("Usage: /pm username message\n");
      return;
    }

    const targetSocket = userSockets.get(targetUser);

    if (!targetSocket) {
      socket.write(`User ${targetUser} is not online\n`);
      return;
    }

    targetSocket.write(`[PM from ${socket.username}]: ${privateMsg}\n`);
    socket.write(`[PM to ${targetUser}]: ${privateMsg}\n`);
    return;
  }

  // NORMAL PUBLIC CHAT
  broadcast(`${socket.username}: ${input}\n`, socket);
}
  });

  socket.on("end", () => {
    if (socket.authenticated) {
      const index = clients.indexOf(socket);
      if (index !== -1) clients.splice(index, 1);

      userSockets.delete(socket.username);
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
