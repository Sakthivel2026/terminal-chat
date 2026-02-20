const readline = require("readline");
const db = require("./database");
const bcrypt = require("bcrypt");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("1. Register");
console.log("2. Login");

rl.question("Choose option: ", (choice) => {
  if (choice === "1") {
    register();
  } else if (choice === "2") {
    login();
  } else {
    console.log("Invalid option");
    rl.close();
  }
});

function register() {
  rl.question("Username: ", (username) => {
    rl.question("Email: ", (email) => {
      rl.question("Password: ", async (password) => {

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword],
          (err) => {
            if (err) {
              console.log("Username already exists.");
            } else {
              console.log("Registration successful.");
            }
            rl.close();
          }
        );

      });
    });
  });
}


function login() {
  rl.question("Email: ", (email) => {
    rl.question("Password: ", (password) => {

      db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, user) => {
          if (!user) {
            console.log("Invalid credentials");
            rl.close();
            return;
          }

          const match = await bcrypt.compare(password, user.password);

          if (!match) {
            console.log("Invalid credentials");
            rl.close();
            return;
          }

          console.log(`Welcome ${user.username}!`);
          showChatMenu(user);
        }
      );

    });
  });
}

function showChatMenu(user) {
  console.log("\n=== Chat Menu ===");
  console.log("1. Join Public Chat");
  console.log("2. Logout");

  rl.question("Choose: ", (choice) => {
    if (choice === "1") {
      joinPublicChat(user);
    } else {
      console.log("Logged out");
      rl.close();
    }
  });
}

function joinPublicChat(user) {
  console.log(`\nWelcome ${user.username}`);
  console.log("You can now join terminal chat.");
  console.log("Run client.js to start chatting.");
  rl.close();
}


