import React, { useState } from "react";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import "./Auth.css"; // Add this import for CSS

const Signup = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/auth/signup", form);
            localStorage.setItem("token", response.data.token);
            console.log("Signup successful, redirecting...");
            history.push("/documents");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                />
                <button type="submit" className="auth-button">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login" className="auth-link">Login here</Link>
            </p>
        </div>
    );
};

export default Signup;
