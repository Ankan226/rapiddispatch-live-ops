"use client";

import { useState } from "react";

export default function AgentLogin({ onLogin }) {
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onLogin(trimmed);
  };

  return (
    <main className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <h1>🚚 RapidDispatch Live Ops</h1>
        <p className="muted">Enter your agent name to join the live helpdesk.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Agent Alice"
          maxLength={40}
        />
        <button type="submit" className="btn primary" disabled={!name.trim()}>
          Join Dashboard
        </button>
      </form>
    </main>
  );
}