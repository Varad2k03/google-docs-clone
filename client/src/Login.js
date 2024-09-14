import React, { useState } from "react";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import "./Auth.css"; // Add this import for CSS

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/auth/login", form);
            localStorage.setItem("token", response.data.token);
            console.log("Login successful, redirecting...");
            history.push("/documents");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
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
                <button type="submit" className="auth-button">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/signup" className="auth-link">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
