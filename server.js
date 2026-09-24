const net = require("net");

const {
    registerUser,
    loginUser
} = require("./auth/authService");

const clients = [];
const userSockets = new Map();


// ========================================
// CREATE TCP SERVER
// ========================================

const server = net.createServer((socket) => {

    // ------------------------------------
    // Initial socket state
    // ------------------------------------

    socket.authenticated = false;
    socket.stage = "MENU";

    socket.tempUsername = "";
    socket.tempEmail = "";


    // ------------------------------------
    // Welcome message
    // ------------------------------------

    socket.write(
        "\n=== TERMINAL CHAT ===\n" +
        "1. Register\n" +
        "2. Login\n" +
        "Choose option: "
    );


    // ========================================
    // RECEIVE CLIENT DATA
    // ========================================

    socket.on("data", async (data) => {

        const input = data.toString().trim();

        if (!input) {
            return;
        }


        try {

            // ========================================
            // MENU
            // ========================================

            if (socket.stage === "MENU") {

                if (input === "1") {

                    socket.stage = "REG_USER";

                    socket.write(
                        "Enter username: "
                    );

                    return;
                }


                if (input === "2") {

                    socket.stage = "LOGIN_USER";

                    socket.write(
                        "Enter username: "
                    );

                    return;
                }


                socket.write(
                    "Invalid choice\n" +
                    "Choose option: "
                );

                return;
            }


            // ========================================
            // REGISTER - USERNAME
            // ========================================

            if (socket.stage === "REG_USER") {

                socket.tempUsername = input;

                socket.stage = "REG_EMAIL";

                socket.write(
                    "Enter email: "
                );

                return;
            }


            // ========================================
            // REGISTER - EMAIL
            // ========================================

            if (socket.stage === "REG_EMAIL") {

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(input)) {

            socket.write(
            "Invalid email format.\n" +
            "Enter email: "
             );

             return;
            }

            socket.tempEmail = input;

            socket.stage = "REG_PASS";

             socket.write(
             "Enter password: "
             );

            return;
             }


            // ========================================
            // REGISTER - PASSWORD
            // ========================================

            if (socket.stage === "REG_PASS") {

                const user = await registerUser(
                    socket.tempUsername,
                    socket.tempEmail,
                    input
                );


                // Clear temporary data

                socket.tempUsername = "";
                socket.tempEmail = "";

                socket.stage = "MENU";


                socket.write(
                    "\nRegistration successful!\n" +
                    `Welcome ${user.username}.\n\n` +
                    "1. Register\n" +
                    "2. Login\n" +
                    "Choose option: "
                );

                return;
            }


            // ========================================
            // LOGIN - USERNAME
            // ========================================

            if (socket.stage === "LOGIN_USER") {

                socket.tempUsername = input;

                socket.stage = "LOGIN_PASS";

                socket.write(
                    "Enter password: "
                );

                return;
            }


            // ========================================
            // LOGIN - PASSWORD
            // ========================================

            if (socket.stage === "LOGIN_PASS") {

                const user = await loginUser(
                    socket.tempUsername,
                    input
                );


                // ------------------------------------
                // Prevent duplicate login
                // ------------------------------------

                if (userSockets.has(user.username)) {

                    socket.write(
                        "This user is already logged in.\n"
                    );

                    socket.tempUsername = "";
                    socket.stage = "MENU";

                    socket.write(
                        "\n1. Register\n" +
                        "2. Login\n" +
                        "Choose option: "
                    );

                    return;
                }


                // ------------------------------------
                // Authenticate socket
                // ------------------------------------

                socket.authenticated = true;

                socket.username = user.username;
                socket.userId = user.id;

                socket.tempUsername = "";

                socket.stage = "CHAT";


                // Add user to online users

                clients.push(socket);

                userSockets.set(
                    socket.username,
                    socket
                );


                socket.write(
                    "\nLogin successful!\n" +
                    `Welcome ${socket.username}!\n\n` +
                    "Available commands:\n" +
                    "/users - Show online users\n" +
                    "/pm username message - Private message\n" +
                    "/logout - Logout\n\n"
                );


                broadcast(
                    `${socket.username} joined the chat.\n`,
                    socket
                );

                return;
            }


            // ========================================
            // CHAT
            // ========================================

            if (socket.stage === "CHAT") {


                // ====================================
                // /users
                // ====================================

                if (input === "/users") {

                    const onlineUsers =
                        Array.from(userSockets.keys());


                    if (onlineUsers.length === 0) {

                        socket.write(
                            "No users online.\n"
                        );

                    } else {

                        socket.write(
                            "Online users: " +
                            onlineUsers.join(", ") +
                            "\n"
                        );
                    }

                    return;
                }


                // ====================================
                // /pm
                // ====================================

                if (input.startsWith("/pm ")) {

                    const parts = input.split(" ");

                    const targetUser = parts[1];

                    const privateMessage =
                        parts.slice(2).join(" ");


                    if (!targetUser || !privateMessage) {

                        socket.write(
                            "Usage: /pm username message\n"
                        );

                        return;
                    }


                    const targetSocket =
                        userSockets.get(targetUser);


                    if (!targetSocket) {

                        socket.write(
                            `User ${targetUser} is not online.\n`
                        );

                        return;
                    }


                    // Send to receiver

                    targetSocket.write(
                        `[PM from ${socket.username}]: ${privateMessage}\n`
                    );


                    // Confirm to sender

                    socket.write(
                        `[PM to ${targetUser}]: ${privateMessage}\n`
                    );

                    return;
                }


                // ====================================
                // /logout
                // ====================================

                if (input === "/logout") {

                    logoutUser(socket);

                    return;
                }


                // ====================================
                // PUBLIC CHAT MESSAGE
                // ====================================

                broadcast(
                    `${socket.username}: ${input}\n`,
                    socket
                );

                return;
            }

        } catch (error) {

            console.error(
                "Server error:",
                error.message
            );


            // ------------------------------------
            // Registration errors
            // ------------------------------------

            if (socket.stage === "REG_PASS") {

                socket.write(
                    `Registration failed: ${error.message}\n`
                );

                socket.tempUsername = "";
                socket.tempEmail = "";

                socket.stage = "MENU";

                socket.write(
                    "\n1. Register\n" +
                    "2. Login\n" +
                    "Choose option: "
                );

                return;
            }


            // ------------------------------------
            // Login errors
            // ------------------------------------

            if (socket.stage === "LOGIN_PASS") {

                socket.write(
                    `${error.message}\n`
                );

                socket.tempUsername = "";

                socket.stage = "MENU";

                socket.write(
                    "\n1. Register\n" +
                    "2. Login\n" +
                    "Choose option: "
                );

                return;
            }


            socket.write(
                "Server error. Please try again.\n"
            );
        }
    });


    // ========================================
    // CLIENT DISCONNECT
    // ========================================

    socket.on("end", () => {

        if (socket.authenticated) {

            removeClient(socket);

            broadcast(
                `${socket.username} left the chat.\n`
            );
        }
    });


    // ========================================
    // SOCKET ERROR
    // ========================================

    socket.on("error", (error) => {

        console.error(
            `Socket error for ${socket.username || "unknown user"}:`,
            error.message
        );
    });

});


// ========================================
// BROADCAST MESSAGE
// ========================================

function broadcast(message, sender = null) {

    clients.forEach((client) => {

        if (
            client !== sender &&
            !client.destroyed
        ) {
            client.write(message);
        }

    });
}


// ========================================
// REMOVE CLIENT
// ========================================

function removeClient(socket) {

    const index = clients.indexOf(socket);

    if (index !== -1) {
        clients.splice(index, 1);
    }


    if (socket.username) {

        userSockets.delete(
            socket.username
        );
    }


    socket.authenticated = false;
}


// ========================================
// LOGOUT
// ========================================

function logoutUser(socket) {

    const username = socket.username;

    removeClient(socket);

    socket.stage = "MENU";
    socket.username = "";
    socket.userId = null;

    socket.write(
        "\nLogged out successfully.\n\n" +
        "1. Register\n" +
        "2. Login\n" +
        "Choose option: "
    );


    broadcast(
        `${username} left the chat.\n`
    );
}


// ========================================
// START SERVER
// ========================================

server.listen(3000, () => {

    console.log(
        "Terminal Chat server running on port 3000"
    );

});