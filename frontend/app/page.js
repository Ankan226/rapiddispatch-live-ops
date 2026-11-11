"use client";

import { useEffect, useState } from "react";
import AgentLogin from "../components/AgentLogin";
import TicketBoard from "../components/TicketBoard";
import { socket } from "../lib/socket";

export default function Home() {
  const [agentName, setAgentName] = useState(null);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("agentName");
      if (saved) setAgentName(saved);
    } catch (e) {}
    setReady(true);
  }, []);

  const handleLogin = (name) => {
    try {
      sessionStorage.setItem("agentName", name);
    } catch (e) {}
    setAgentName(name);
  };

  const handleLogout = () => {
    socket.disconnect();
    try {
      sessionStorage.removeItem("agentName");
    } catch (e) {}
    setAgentName(null);
  };

  if (!ready) return null;
  if (!agentName) return <AgentLogin onLogin={handleLogin} />;
  return <TicketBoard agentName={agentName} onLogout={handleLogout} />;
}