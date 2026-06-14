import React, { useState } from "react";

export default function AuthForm({ onLogin, onSignup, errorMessage }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const resetFields = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setLocalError("");
  };

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    resetFields();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setLocalError("Please enter a username.");
      return;
    }
    if (!password) {
      setLocalError("Please enter a password.");
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
      const result = onSignup(username.trim(), password);
      if (result) {
        setLocalError(result);
      }
    } else {
      const result = onLogin(username.trim(), password);
      if (result) {
        setLocalError(result);
      }
    }
  };

  return (
    <div className="auth-card">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="input-form" style={{ flexDirection: "column" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        {mode === "signup" && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
          />
        )}
        {(localError || errorMessage) && (
          <div className="auth-error">{localError || errorMessage}</div>
        )}
        <button type="submit" className="btn-add">
          {mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
      <div style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>
        {mode === "login" ? (
          <>Need an account? <button type="button" className="theme-toggle" onClick={() => handleModeSwitch("signup")}>Sign up</button></>
        ) : (
          <>Already have an account? <button type="button" className="theme-toggle" onClick={() => handleModeSwitch("login")}>Login</button></>
        )}
      </div>
    </div>
  );
}
