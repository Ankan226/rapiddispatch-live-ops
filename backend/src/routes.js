import { Router } from "express";
import { listTickets, createTicket, getLocksObject } from "./store.js";

export function buildRoutes(io) {
  const router = Router();

  router.get("/health", (_req, res) => res.json({ status: "ok" }));

  router.get("/api/tickets", (_req, res) => {
    res.json({ tickets: listTickets(), locks: getLocksObject() });
  });


  router.post("/api/tickets", (req, res) => {
    const { title, description, priority } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    const ticket = createTicket({ title, description, priority });
    io.emit("ticket_created", ticket);
    res.status(201).json(ticket);
  });

  return router;
}