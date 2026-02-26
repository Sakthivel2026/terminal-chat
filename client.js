const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter your username: ", (username) => {

  const client = net.createConnection({ port: 3000 }, () => {
    console.log("Connected to server");
    client.write(username); // send username first
  });

  client.on("data", (data) => {
    console.log(data.toString());
  });

  rl.on("line", (input) => {
    client.write(input); // normal chat messages
  });

  
  client.on("end", () => {
    console.log("Disconnected from server");
    process.exit(0);
  });

});