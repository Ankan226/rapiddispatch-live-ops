# RapidDispatch Live Ops Helpdesk

A real-time collaborative support helpdesk for **RapidDispatch Freight & Logistics**. When an agent opens a ticket, it instantly locks for every other agent in the building, so two agents can never overwrite each other's work.

Built for **Prodesk IT, Sprint 19: Client Delivery Phase II (Concurrency, WebSockets and Race Conditions)**.

## Live Links

| Item | URL |
|---|---|
| Frontend (Vercel) | https://rapiddispatch-live-ops-jade.vercel.app |
| Backend (Render) | https://rapiddispatch-live-ops-14av.onrender.com

> The Render free tier sleeps when idle. Open the health check URL once and wait a few seconds before using the app.

## The Problem

RapidDispatch's old system was a basic CRUD app. Agent A and Agent B could open the same ticket, type different resolutions, and the last one to save silently overwrote the other. This caused conflicting customer messages, duplicate emails, and double billing.

## The Solution

A persistent WebSocket connection (Socket.io) between every agent and the server. The server is the single source of truth for who holds which lock, and it broadcasts every change to all connected clients immediately, with no polling and no page refreshes.

## Features

- **Live ticket board**: new tickets slide into every connected client instantly.
- **Real-time locking**: clicking Edit on a ticket emits `lock_ticket`. For every other agent the row turns gray, shows a icon and "Locked by [Agent Name]", and its Edit button is disabled.
- **Release protocol**: Save or Close emits `unlock_ticket` and the ticket is re-enabled for everyone immediately.
- **Ghost disconnect handler**: if an agent closes their tab or laptop lid, the server finds every lock held by that `socket.id`, releases it, and broadcasts the release automatically.
- **Graceful degradation**: on socket disconnect, a red "Connection Lost: Reconnecting..." banner appears, and editing is disabled until the connection returns.
- **Auto re-sync**: on every reconnect the client rejoins the dashboard and receives the full current state.
- **Lock ownership enforcement**: only the lock holder can save or unlock a ticket, checked on the server.
- **Login and logout**: agents enter a name per browser tab. Logout disconnects the socket, which releases any held locks.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, socket.io-client |
| Backend | Node.js, Express, Socket.io |
| State | In-memory `Map` (ticketId to socketId, agentName, lockedAt) |
| Hosting | Vercel (frontend), Render (backend) |

## Architecture

```
 Agent A (browser)                                  Agent B (browser)
 Next.js + socket.io-client                         Next.js + socket.io-client
        |                                                   |
        |   wss://  (lock_ticket, unlock_ticket, ...)       |
        +-------------------------+-------------------------+
                                  |
                       Express + Socket.io server
                                  |
                  in-memory Map: ticketId -> { socketId, agentName }
                  in-memory array: tickets
```

1. An agent clicks **Edit**, and the client emits `lock_ticket`.
2. The server checks the Map. If the ticket is free, it locks it and broadcasts `ticket_locked` to all clients. If it is taken, it replies only to that agent with `lock_rejected`.
3. When the agent saves, closes, or disconnects, the server releases the lock and broadcasts `ticket_unlocked`.


## Run Locally

**Requirements:** Node.js 18 or newer.

**Backend (Terminal 1)**
```bash
cd backend
cp .env.example .env      
npm install
npm run dev
```
Runs on http://localhost:4000. Check http://localhost:4000/health.

**Frontend (Terminal 2)**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Runs on http://localhost:3000.

**Try it:** open two separate browser windows side by side, log in as `Alice` in one and `Bob` in the other, and click Edit on a ticket in Alice's window.

## Environment Variables

| File | Variable | Example | Notes |
|---|---|---|---|
| `backend/.env` | `PORT` | `4000` | Render sets this automatically |
| `backend/.env` | `CLIENT_ORIGINS` | `http://localhost:3000,https://your-app.vercel.app` | Comma-separated, **no trailing slash** |
| `frontend/.env.local` | `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:4000` | Use `https://` in production so the browser connects over WSS |

## Deployment

**Backend on Render (Web Service)**
1. Root directory: `backend`
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment variable: `CLIENT_ORIGINS=https://<your-vercel-app>.vercel.app`

**Frontend on Vercel**
1. Root directory: `frontend`
2. Environment variable: `NEXT_PUBLIC_SOCKET_URL=https://<your-render-app>.onrender.com`

Deploy the backend first, then the frontend, then update `CLIENT_ORIGINS` on Render with the final Vercel URL and redeploy the backend.

## Testing Checklist (Dual-Window)

| Test | Steps | Expected result |
|---|---|---|
| Live create | Add a ticket in Window 1 | It slides into Window 2 with no refresh |
| Lock | Click Edit in Window 1 | Window 2 shows gray row, 🔒, "Locked by Alice", Edit disabled |
| Release | Click Save or Close in Window 1 | Window 2 row re-enables instantly |
| Ghost disconnect | Lock a ticket in Window 1, then close that tab | Window 2 unlocks it within about a second |
| Logout | Lock a ticket, then click Logout | Lock is released for everyone |
| Offline banner | Stop the backend or turn off Wi-Fi | Red "Connection Lost: Reconnecting..." banner appears, then clears on reconnect |

## Design Decisions

- **No polling.** There is no `setInterval` anywhere. All updates arrive through one open Socket.io connection.
- **Race-safe locking.** Node runs JavaScript on a single thread, and the check-and-set on the lock Map is fully synchronous. Two simultaneous lock requests are processed one after the other, so only one can win.
- **Server is the source of truth.** The UI only reflects what the server broadcasts. The server also rejects saves from anyone who does not hold the lock.
- **One lock per socket.** Locking a second ticket automatically releases the first, so an agent cannot hoard tickets.
- **Fast ghost detection.** The server pings every 3 seconds with a 3 second timeout. A closed tab disconnects immediately, and a dead connection such as a closed laptop is cleared within about 6 seconds.
- **React Strict Mode safe.** The socket is a singleton, and the hook's cleanup removes listeners without disconnecting the socket, so double-mounting in development does not create duplicate handlers.
- **WebSocket-only transport.** The client uses `transports: ["websocket"]` to avoid sticky-session problems with long-polling on hosted platforms.
- **Per-tab identity.** The agent name is stored in `sessionStorage`, so two windows can act as two different agents.

## Known Limitations

- State is in memory by design, as the brief requires. Tickets and locks reset when the backend restarts.
- A single server instance is assumed. Scaling to several instances would need the Socket.io Redis adapter and a shared lock store.
- There is no real authentication. Agent names are self-declared.
- Render's free tier sleeps when idle, so the first request after a pause can be slow.

## AI Usage

AI assistance is documented in [Prompts.md](./Prompts.md).

## Author

Ankan Pal