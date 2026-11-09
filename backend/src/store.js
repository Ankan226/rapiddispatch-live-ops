let nextId = 106;

const tickets = [
  {
    id: 101,
    title: "Truck #4411 broke down on I-35",
    description: "Driver reports engine failure near Waco. Cargo: refrigerated goods.",
    priority: "high",
    status: "open",
    resolution: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    title: "Missed delivery - Dallas warehouse",
    description: "Customer says no one arrived for the 2 PM slot.",
    priority: "medium",
    status: "open",
    resolution: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: 103,
    title: "Duplicate invoice sent",
    description: "Client received two invoices for shipment RD-8821.",
    priority: "low",
    status: "open",
    resolution: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: 104,
    title: "Wrong delivery address",
    description: "Package routed to Austin instead of Houston.",
    priority: "high",
    status: "open",
    resolution: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: 105,
    title: "Refrigeration unit alarm",
    description: "Reefer trailer temperature rising above threshold.",
    priority: "high",
    status: "open",
    resolution: "",
    createdAt: new Date().toISOString(),
  },
];


const locks = new Map();

export function listTickets() {
  return tickets;
}

export function getTicket(id) {
  return tickets.find((t) => t.id === id);
}

export function createTicket({ title, description, priority }) {
  const ticket = {
    id: nextId++,
    title: String(title).trim().slice(0, 120),
    description: String(description || "").trim().slice(0, 1000),
    priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
    status: "open",
    resolution: "",
    createdAt: new Date().toISOString(),
  };
  tickets.unshift(ticket);
  return ticket;
}

export function updateResolution(id, resolution) {
  const ticket = getTicket(id);
  if (!ticket) return null;
  ticket.resolution = String(resolution).slice(0, 5000);
  ticket.status = "resolved";
  return ticket;
}

export function getLocksObject() {
  return Object.fromEntries(locks);
}

export function getLock(ticketId) {
  return locks.get(ticketId);
}



export function tryLock(ticketId, socketId, agentName) {
  const existing = locks.get(ticketId);
  if (existing && existing.socketId !== socketId) {
    return { ok: false, lockedBy: existing.agentName };
  }


  let releasedPrevious = null;
  for (const [id, lock] of locks) {
    if (lock.socketId === socketId && id !== ticketId) {
      locks.delete(id);
      releasedPrevious = id;
    }
  }

  const lock = { socketId, agentName, lockedAt: Date.now() };
  locks.set(ticketId, lock);
  return { ok: true, lock, releasedPrevious };
}


export function unlock(ticketId, socketId) {
  const existing = locks.get(ticketId);
  if (!existing || existing.socketId !== socketId) return false;
  locks.delete(ticketId);
  return true;
}


export function releaseAllBySocket(socketId) {
  const released = [];
  for (const [ticketId, lock] of locks) {
    if (lock.socketId === socketId) {
      locks.delete(ticketId);
      released.push(ticketId);
    }
  }
  return released;
}