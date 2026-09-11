import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";
import Background from "./Background.jsx";
import "./App.css";

// Simple username -> email lookup. Not a secret; the real credential
// (password) lives only in Firebase Auth, never in this file.
const USERNAME_TO_EMAIL = {
  raynocturne: "rayhan.rayhan@outlook.co.id",
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const raw = identifier.trim();
    const email = raw.includes("@")
      ? raw
      : USERNAME_TO_EMAIL[raw.toLowerCase()];

    if (!email) {
      setError("Username or email not recognized.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.jsx picks this up automatically.
    } catch (err) {
      setError("Login failed. Check your username/email and password.");
      setLoading(false);
    }
  };

  return (
    <div className="ops-deck login-deck">
      <Background />
      <div className="login-card">
        <div className="login-brand">RAY<span>.OS</span></div>
        <p className="login-sub">Sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>USERNAME OR EMAIL</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="RayNocturne"
              autoFocus
              required
            />
          </div>
          <div className="modal-field">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
