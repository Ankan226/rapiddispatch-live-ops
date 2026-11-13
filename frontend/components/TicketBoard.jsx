"use client";

import { useLiveOps } from "../hooks/useLiveOps";
import ConnectionBanner from "./ConnectionBanner";
import NewTicketForm from "./NewTicketForm";
import TicketRow from "./TicketRow";
import TicketEditor from "./TicketEditor";

export default function TicketBoard({ agentName, onLogout}) {
  const {
    connected,
    mySocketId,
    tickets,
    locks,
    toast,
    lockTicket,
    unlockTicket,
    createTicket,
    saveTicket,
  } = useLiveOps(agentName);


  const myTicketId = Object.keys(locks).find((id) => locks[id].socketId === mySocketId);
  const myTicket = myTicketId ? tickets.find((t) => t.id === Number(myTicketId)) : null;

  return (
    <>
      <ConnectionBanner connected={connected} />

      <main className="container">
                <header className="header">
          <h1>🚚 Live Ops Helpdesk</h1>
          <div className="row">
            <div className="muted">
              Signed in as <strong>{agentName}</strong>
            </div>
            <button className="btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {toast && <div className="toast">{toast}</div>}

        <NewTicketForm onCreate={createTicket} disabled={!connected} />

        {myTicket && (
          <TicketEditor
            key={myTicket.id}
            ticket={myTicket}
            onSave={saveTicket}
            onClose={unlockTicket}
            connected={connected}
          />
        )}

        <h2>Active Tickets ({tickets.length})</h2>
        <ul className="ticket-list">
          {tickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              lock={locks[ticket.id]}
              mySocketId={mySocketId}
              connected={connected}
              onEdit={lockTicket}
            />
          ))}
        </ul>
      </main>
    </>
  );
}