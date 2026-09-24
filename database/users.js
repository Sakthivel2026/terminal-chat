const db = require("./connection");


// Find user by username
async function findUserByUsername(username) {
    const result = await db.query(
        `SELECT *
         FROM users
         WHERE username = $1`,
        [username]
    );

    return result.rows[0] || null;
}


// Find user by email
async function findUserByEmail(email) {
    const result = await db.query(
        `SELECT *
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
}


// Create a new user
async function createUser(username, email, passwordHash) {
    const result = await db.query(
        `INSERT INTO users
            (username, email, password_hash)
         VALUES
            ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [username, email, passwordHash]
    );

    return result.rows[0];
}


module.exports = {
    findUserByUsername,
    findUserByEmail,
    createUser
};