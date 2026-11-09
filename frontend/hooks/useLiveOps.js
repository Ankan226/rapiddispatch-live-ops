"use client";

import { useEffect, useState, useCallback } from "react";
import { socket } from "../lib/socket";

export function useLiveOps(agentName) {
  const [connected, setConnected] = useState(false);
  const [mySocketId, setMySocketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [locks, setLocks] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!agentName) return;

    const join = () => {
      setConnected(true);
      setMySocketId(socket.id);
      socket.emit("join_dashboard", { agentName });
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onState = ({ tickets, locks }) => {
      setTickets(tickets);
      setLocks(locks);
    };

    const onCreated = (ticket) => {
      setTickets((prev) =>
        prev.some((t) => t.id === ticket.id) ? prev : [{ ...ticket, isNew: true }, ...prev]
      );
    };

    const onUpdated = (ticket) => {
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
    };

    const onLocked = ({ ticketId, lock }) => {
      setLocks((prev) => ({ ...prev, [ticketId]: lock }));
    };

    const onUnlocked = ({ ticketId }) => {
      setLocks((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
    };

    const onRejected = ({ ticketId, lockedBy }) => {
      setToast(`Ticket #${ticketId} is already locked by ${lockedBy}.`);
      setTimeout(() => setToast(null), 3000);
    };

    socket.on("connect", join);
    socket.on("disconnect", onDisconnect);
    socket.on("dashboard_state", onState);
    socket.on("ticket_created", onCreated);
    socket.on("ticket_updated", onUpdated);
    socket.on("ticket_locked", onLocked);
    socket.on("ticket_unlocked", onUnlocked);
    socket.on("lock_rejected", onRejected);

    if (socket.connected) join();
    else socket.connect();


    return () => {
      socket.off("connect", join);
      socket.off("disconnect", onDisconnect);
      socket.off("dashboard_state", onState);
      socket.off("ticket_created", onCreated);
      socket.off("ticket_updated", onUpdated);
      socket.off("ticket_locked", onLocked);
      socket.off("ticket_unlocked", onUnlocked);
      socket.off("lock_rejected", onRejected);
    };
  }, [agentName]);

  const lockTicket = useCallback((ticketId) => {
    socket.emit("lock_ticket", { ticketId });
  }, []);

  const unlockTicket = useCallback((ticketId) => {
    socket.emit("unlock_ticket", { ticketId });
  }, []);

  const createTicket = useCallback((payload) => {
    socket.emit("create_ticket", payload);
  }, []);

  const saveTicket = useCallback((ticketId, resolution) => {
    return new Promise((resolve) => {
      socket.emit("save_ticket", { ticketId, resolution }, (res) => resolve(res));
    });
  }, []);

  return {
    connected,
    mySocketId,
    tickets,
    locks,
    toast,
    lockTicket,
    unlockTicket,
    createTicket,
    saveTicket,
  };
}