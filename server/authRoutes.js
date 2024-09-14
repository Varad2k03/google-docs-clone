const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./User"); // Ensure this path is correct
const router = express.Router();

// Secret key for signing JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || "pavan"; // Use environment variable for production

// Signup route
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send("User already exists.");

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).send("Error creating user.");
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("User not found.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials.");

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).send("Error logging in.");
    }
});

module.exports = router;
