"use client";

import { useState } from "react";

export default function TicketEditor({ ticket, onSave, onClose, connected }) {
  const [text, setText] = useState(ticket.resolution || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    const res = await onSave(ticket.id, text);
    setSaving(false);
    if (!res?.ok) {
      setError(res?.error || "Save failed.");
      return;
    }
    onClose(ticket.id); 
  };

  return (
    <div className="card editor">
      <h2>
        Editing #{ticket.id}: {ticket.title}
      </h2>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your resolution..."
      />
      {!connected && (
        <p className="error-text">Offline: your changes may not save until reconnected.</p>
      )}
      {error && <p className="error-text">{error}</p>}
      <div className="row">
        <button className="btn primary" onClick={save} disabled={saving || !connected}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn" onClick={() => onClose(ticket.id)}>
          Close
        </button>
      </div>
    </div>
  );
}