const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.createConnection(
    {
        port: 3000
    },
    () => {
        console.log("Connected to Terminal Chat Server");
    }
);


// Receive messages from server
client.on("data", (data) => {
    process.stdout.write(data.toString());
});


// Send user input to server
rl.on("line", (input) => {

    if (!input.trim()) {
        return;
    }

    client.write(input);
});


// Server disconnected
client.on("end", () => {

    console.log("\nDisconnected from server.");

    rl.close();

    process.exit(0);
});


// Connection error
client.on("error", (error) => {

    console.error(
        "Connection error:",
        error.message
    );

    rl.close();
});