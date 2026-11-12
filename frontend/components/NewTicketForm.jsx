"use client";

import { useState } from "react";

export default function NewTicketForm({ onCreate, disabled }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, description, priority });
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <form className="card new-ticket" onSubmit={submit}>
      <h2>Create Ticket</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ticket title"
        maxLength={120}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
        maxLength={1000}
      />
      <div className="row">
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="btn primary" disabled={disabled || !title.trim()}>
          Add Ticket
        </button>
      </div>
    </form>
  );
}