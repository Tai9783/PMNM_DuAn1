# DuAn1 — Todo App (Node.js + Express + SQLite)

This is a minimal Todo web app built with Node.js, Express and SQLite. It includes a simple HTML frontend and REST API backed by an on-disk SQLite database.

Quick start (Windows):

1. Open a terminal in the project folder `DuAn1`.
2. Install dependencies:

```bash
cd DuAn1
npm install
```

3. Run the app locally:

```bash
node server.js
# open http://localhost:3000
```

Development with live restart (optional):

```bash
npm install -g nodemon
npm run dev
```

Files of interest:

- `server.js` — Express server, API and SQLite init
- `public/index.html` — frontend UI
- `public/app.js` — frontend logic
- `data/todos.db` — created automatically on first run

Deploy to Render (quick)

1. Push this repository to GitHub.
2. Create a new Web Service in Render and connect your GitHub repo.
3. Set the build command to `npm install` and the start command to `node server.js`.
4. Render will set `PORT` automatically; the app reads `process.env.PORT`.

Notes

- The SQLite file is stored in `data/todos.db`. Add this path to `.gitignore` (already done).
- If you want a different DB file path, edit `server.js`.
