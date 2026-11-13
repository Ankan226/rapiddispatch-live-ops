I used AI only as an assistant for guidance and boilerplate. I reviewed, ran, and tested everything myself in two browser windows.

## Where I used AI

| # | What I asked | What I used | What I verified |
|---|---|---|---|
| 1 | Help structuring the folder layout and the in-memory `Map` for ticket locks | Folder structure; Map keyed by ticket ID storing `socketId` and `agentName` | Two windows: lock in one shows gray row,  and "Locked by" in the other |
| 2 | Help with the `disconnect` handler for ghost locks | Loop over the Map, release locks owned by that `socket.id`, broadcast unlock | Locked a ticket, closed the tab, the other window unlocked it |
| 3 | Why socket listeners can fire twice (React Strict Mode) | Singleton socket and cleanup with `socket.off(...)` | Confirmed events fire once in dev |
| 4 | How to add a Logout button | `socket.disconnect()` plus clearing `sessionStorage` | Logout releases held locks |
| 5 | How to read the browser Network tab (WS) | Filter by Socket, open the Messages tab | Saw the 101 connection and live events |
| 6 | Git commands and a `.gitignore` error | Did not force-add `.env.local`; committed `.env.local.example` instead | Checked `git ls-files` for secrets |

## Declaration

All AI-assisted code was reviewed and tested by me before submission, and I can explain how the locking and disconnect logic works.