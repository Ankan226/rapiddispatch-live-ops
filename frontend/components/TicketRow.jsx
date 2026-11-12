"use client";

export default function TicketRow({ ticket, lock, mySocketId, connected, onEdit }) {
  const isLocked = Boolean(lock);
  const lockedByMe = isLocked && lock.socketId === mySocketId;
  const lockedByOther = isLocked && !lockedByMe;


  const editDisabled = lockedByOther || !connected;

  return (
    <li
      className={[
        "ticket-row",
        lockedByOther ? "locked" : "",
        lockedByMe ? "mine" : "",
        ticket.isNew ? "slide-in" : "",
      ].join(" ")}
    >
      <div className="ticket-main">
        <div className="ticket-title">
          <span className="ticket-id">#{ticket.id}</span> {ticket.title}
          <span className={`pill ${ticket.priority}`}>{ticket.priority}</span>
          {ticket.status === "resolved" && <span className="pill resolved">resolved</span>}
        </div>
        <div className="muted">{ticket.description}</div>
        {ticket.resolution && (
          <div className="resolution">
            <strong>Resolution:</strong> {ticket.resolution}
          </div>
        )}
      </div>

      <div className="ticket-side">
        {lockedByOther && (
          <div className="lock-info">
            <span aria-label="locked">🔒</span> Locked by {lock.agentName}
          </div>
        )}
        {lockedByMe && <div className="lock-info mine-text">✏️ You are editing</div>}
        <button
          className="btn"
          disabled={editDisabled}
          onClick={() => onEdit(ticket.id)}
        >
          Edit
        </button>
      </div>
    </li>
  );
}