const bcrypt = require("bcrypt");

const {
    findUserByUsername,
    findUserByEmail,
    createUser
} = require("../database/users");


// Register user
async function registerUser(username, email, password) {

    // Check username
    const existingUsername =
        await findUserByUsername(username);

    if (existingUsername) {
        throw new Error("Username already exists");
    }


    // Check email
    const existingEmail =
        await findUserByEmail(email);

    if (existingEmail) {
        throw new Error("Email already exists");
    }


    // Hash password
    const passwordHash =
        await bcrypt.hash(password, 10);


    // Create user
    const user = await createUser(
        username,
        email,
        passwordHash
    );

    return user;
}


// Login user
async function loginUser(username, password) {

    const user =
        await findUserByUsername(username);


    if (!user) {
        throw new Error("Invalid credentials");
    }


    const passwordMatch =
        await bcrypt.compare(
            password,
            user.password_hash
        );


    if (!passwordMatch) {
        throw new Error("Invalid credentials");
    }


    return user;
}


module.exports = {
    registerUser,
    loginUser
};