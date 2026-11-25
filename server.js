require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const app = express();
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || "doorlist",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  supportBigNumbers: true,
  bigNumberStrings: true
});

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appHtml = indexHtml.replace(
  '<script src="app.js"></script>',
  '<script>window.DOORLIST_API=true;</script>\n<script src="app.js"></script>'
);

if (appHtml === indexHtml) {
  throw new Error('Could not enable the API mode in index.html.');
}

app.use(express.json({ limit: "100kb" }));

function asyncRoute(handler) {
  return function(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function timestamp(value) {
  return value == null ? null : Number(value);
}

function guestFromRow(row) {
  return {
    code: row.code,
    name: row.name,
    email: row.email,
    ticket: row.ticket,
    checkedInAt: timestamp(row.checkedInAt),
    checkedOutAt: timestamp(row.checkedOutAt),
    createdAt: timestamp(row.createdAt)
  };
}

function validGuest(body, code) {
  return body && typeof body === "object" &&
    typeof body.name === "string" && body.name.trim().length > 0 &&
    body.name.length <= 200 &&
    typeof (body.email || "") === "string" && (body.email || "").length <= 320 &&
    typeof (body.ticket || "General") === "string" && (body.ticket || "General").length <= 100 &&
    code.length <= 40 &&
    (body.checkedInAt == null || Number.isSafeInteger(body.checkedInAt)) &&
    (body.checkedOutAt == null || Number.isSafeInteger(body.checkedOutAt)) &&
    (body.createdAt == null || Number.isSafeInteger(body.createdAt));
}

app.get("/", function(req, res) {
  res.type("html").send(appHtml);
});

app.get("/index.html", function(req, res) {
  res.type("html").send(appHtml);
});

app.get("/api/guests", asyncRoute(async function(req, res) {
  const [rows] = await pool.query(
    "SELECT code, name, email, ticket, checked_in_at AS checkedInAt, " +
    "checked_out_at AS checkedOutAt, created_at AS createdAt " +
    "FROM doorlist_guests ORDER BY name"
  );
  res.json(rows.map(guestFromRow));
}));

app.put("/api/guests/:code", asyncRoute(async function(req, res) {
  const code = String(req.params.code || "");
  const body = req.body;
  if (!code || !validGuest(body, code)) {
    return res.status(400).json({ error: "Guest details are invalid." });
  }

  await pool.execute(
    "INSERT INTO doorlist_guests " +
    "(code, name, email, ticket, checked_in_at, checked_out_at, created_at) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), " +
    "ticket=VALUES(ticket), checked_in_at=VALUES(checked_in_at), " +
    "checked_out_at=VALUES(checked_out_at), created_at=VALUES(created_at)",
    [
      code,
      body.name.trim(),
      body.email || "",
      body.ticket || "General",
      body.checkedInAt == null ? null : body.checkedInAt,
      body.checkedOutAt == null ? null : body.checkedOutAt,
      body.createdAt == null ? Date.now() : body.createdAt
    ]
  );
  res.status(204).end();
}));

app.delete("/api/guests/:code", asyncRoute(async function(req, res) {
  await pool.execute("DELETE FROM doorlist_guests WHERE code = ?", [req.params.code]);
  res.status(204).end();
}));

app.get("/api/event", asyncRoute(async function(req, res) {
  const [rows] = await pool.execute("SELECT name FROM doorlist_event WHERE id = 1");
  res.json({ name: rows.length ? rows[0].name : null });
}));

app.put("/api/event", asyncRoute(async function(req, res) {
  const name = req.body && req.body.name;
  if (typeof name !== "string" || name.trim().length === 0 || name.length > 80) {
    return res.status(400).json({ error: "Event name must be 1 to 80 characters." });
  }
  await pool.execute(
    "INSERT INTO doorlist_event (id, name) VALUES (1, ?) " +
    "ON DUPLICATE KEY UPDATE name=VALUES(name)",
    [name.trim()]
  );
  res.status(204).end();
}));

app.use(express.static(root, { dotfiles: "deny", index: false }));
app.use("/api", function(req, res) {
  res.status(404).json({ error: "API endpoint not found." });
});
app.use(function(error, req, res, next) {
  console.error("Request failed:", error.message);
  if (res.headersSent) return next(error);
  res.status(error.type === "entity.parse.failed" ? 400 : 500).json({
    error: error.type === "entity.parse.failed" ? "Request body must be valid JSON." : "Request failed."
  });
});

async function start() {
  await pool.query("SELECT 1");
  app.listen(port, "127.0.0.1", function() {
    console.log("Doorlist is running at http://127.0.0.1:" + port);
  });
}

start().catch(async function(error) {
  console.error("Could not connect to MySQL. Check .env and run mysql-setup.sql:", error.message);
  await pool.end();
  process.exitCode = 1;
});

async function shutdown() {
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
