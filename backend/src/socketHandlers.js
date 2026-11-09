import {
  listTickets,
  getLocksObject,
  getLock,
  createTicket,
  updateResolution,
  tryLock,
  unlock,
  releaseAllBySocket,
} from "./store.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[connect] ${socket.id}`);


    socket.on("join_dashboard", ({ agentName } = {}) => {
      const name = String(agentName || "").trim().slice(0, 40);
      if (!name) return;

      socket.data.agentName = name;
      socket.join("dashboard");


      socket.emit("dashboard_state", {
        tickets: listTickets(),
        locks: getLocksObject(),
      });
      console.log(`[join] ${name} (${socket.id})`);
    });


    socket.on("lock_ticket", ({ ticketId } = {}) => {
      const agentName = socket.data.agentName;
      if (!agentName) return;

      const id = Number(ticketId);
      const result = tryLock(id, socket.id, agentName);

      if (!result.ok) {
        socket.emit("lock_rejected", { ticketId: id, lockedBy: result.lockedBy });
        return;
      }

      if (result.releasedPrevious) {
        io.emit("ticket_unlocked", {
          ticketId: result.releasedPrevious,
          reason: "switched",
        });
      }
      io.emit("ticket_locked", { ticketId: id, lock: result.lock });
    });


    socket.on("unlock_ticket", ({ ticketId } = {}) => {
      const id = Number(ticketId);
      if (unlock(id, socket.id)) {
        io.emit("ticket_unlocked", { ticketId: id, reason: "released" });
      }
    });


    socket.on("create_ticket", (payload = {}) => {
      if (!socket.data.agentName) return;
      if (!payload.title || !String(payload.title).trim()) return;
      const ticket = createTicket(payload);
      io.emit("ticket_created", ticket);
    });


    socket.on("save_ticket", ({ ticketId, resolution } = {}, ack) => {
      const id = Number(ticketId);
      const lock = getLock(id);

      if (!lock || lock.socketId !== socket.id) {
        if (typeof ack === "function") ack({ ok: false, error: "You do not hold the lock." });
        return;
      }

      const ticket = updateResolution(id, resolution || "");
      if (!ticket) {
        if (typeof ack === "function") ack({ ok: false, error: "Ticket not found." });
        return;
      }

      io.emit("ticket_updated", ticket);
      if (typeof ack === "function") ack({ ok: true });
    });


    socket.on("disconnect", (reason) => {
      const released = releaseAllBySocket(socket.id);
      released.forEach((ticketId) => {
        io.emit("ticket_unlocked", { ticketId, reason: "disconnect" });
      });
      console.log(
        `[disconnect] ${socket.id} (${reason}) released locks: [${released.join(", ")}]`
      );
    });
  });
}