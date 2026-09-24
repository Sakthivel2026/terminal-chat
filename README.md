# Terminal Chat Client

A real-time terminal-based chat client built with **Node.js TCP sockets**. It allows users to connect to the Terminal Chat server and communicate with other connected users through the command line.

## Features

* Real-time messaging using TCP sockets
* User registration and login
* Broadcast messages
* Private messaging
* View currently connected users
* Lightweight command-line interface
* Works across computers on the same network or through a configured public tunnel

## Requirements

* [Node.js](https://nodejs.org/) installed
* Terminal / Command Prompt
* Access to the Terminal Chat server
* Server host IP address and port

## How to Run on a Friend's PC

### 1. Install Node.js

Download and install Node.js on the friend's computer.

Verify the installation:

```bash
node --version
```

### 2. Get the Client Code

Copy the `client.js` file to the friend's computer.

Example:

```text
terminal-chat/
└── client.js
```

### 3. Configure the Server IP

Open `client.js` and find:

```javascript
PUT_HOST_IP_HERE
```

Replace it with the IP address of the computer running the Terminal Chat server.

Example:

```javascript
const HOST = "192.168.1.10";
const PORT = 3000;
```

> Use the server computer's **local IP address** when both computers are connected to the same Wi-Fi/LAN.

### 4. Start the Client

Open Command Prompt or Terminal inside the project folder:

```bash
node client.js
```

The client will connect to the Terminal Chat server.

## Same Wi-Fi / LAN Example

If the server computer has:

```text
IP: 192.168.1.10
Port: 3000
```

Configure the client:

```javascript
const HOST = "192.168.1.10";
const PORT = 3000;
```

Then run:

```bash
node client.js
```

## Chat Commands

Once connected, users can use commands such as:

```text
/users
```

View currently connected users.

```text
/pm username message
```

Send a private message.

Example:

```text
/pm ravi Hello!
```

Normal text messages are sent as broadcast messages to connected users.

## Project Structure

```text
terminal-chat/
│
├── client.js
├── server.js
├── auth.js
├── database.js
├── package.json
└── README.md
```

## Troubleshooting

### Cannot connect to server

Check that:

* The server is running.
* The IP address in `client.js` is correct.
* The port number matches the server.
* Both computers are connected to the same network when using a local IP.
* Windows Firewall allows Node.js/network connections on the required port.

### Connection refused

Make sure the server is listening on the configured port:

```text
3000
```

Start the server before starting the client.

## Technology

* **Node.js**
* **JavaScript**
* **TCP Socket (`net` module)**
* **Command Line Interface**
* **Authentication**
* **Database Persistence**

## Project Purpose

This project demonstrates how real-time communication can be implemented using **low-level TCP sockets in Node.js**, including client-server architecture, authentication, message routing, private messaging, and multi-user communication.

## Author

**Sakthivel**

GitHub: `Sakthivel2026`
