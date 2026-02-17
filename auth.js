const readline = require("readline");
const db = require("./database");

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
      rl.question("Password: ", (password) => {

        db.run(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, password],
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
  rl.question("Username: ", (username) => {
    rl.question("Password: ", (password) => {

      db.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, row) => {
          if (row) {
            console.log("Login successful.");
          } else {
            console.log("Invalid username or password.");
          }
          rl.close();
        }
      );

    });
  });
}
