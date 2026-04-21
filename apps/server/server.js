import http from "node:http";
import crypto from "node:crypto";
import { devices, projects, rackDocument } from "./mock-data.js";

const clients = new Map();

function sendJson(socket, payload) {
  if (socket.destroyed) {
    return;
  }

  const message = Buffer.from(JSON.stringify(payload));
  const header =
    message.length < 126
      ? Buffer.from([0x81, message.length])
      : Buffer.from([0x81, 126, message.length >> 8, message.length & 0xff]);

  socket.write(Buffer.concat([header, message]));
}

function getUsers() {
  return Array.from(clients.values()).map((client) => ({
    ...client.session,
    dragPreview: client.dragPreview,
    pointer: client.pointer,
  }));
}

function broadcastUsers() {
  const payload = {
    type: "users",
    users: getUsers(),
  };

  for (const client of clients.values()) {
    sendJson(client.socket, payload);
  }
}

function broadcastOperation(operation, exceptClientId) {
  for (const [clientId, client] of clients) {
    if (clientId !== exceptClientId) {
      sendJson(client.socket, {
        type: "operation",
        operation,
      });
    }
  }
}

function createWebSocketAcceptKey(key) {
  return crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
}

function readWebSocketMessage(buffer) {
  const opcode = buffer[0] & 0x0f;

  if (opcode === 0x8) {
    return null;
  }

  const isMasked = Boolean(buffer[1] & 0x80);
  let length = buffer[1] & 0x7f;
  let offset = 2;

  if (length === 126) {
    length = buffer.readUInt16BE(offset);
    offset += 2;
  }

  if (length === 127) {
    return null;
  }

  const mask = isMasked ? buffer.subarray(offset, offset + 4) : null;
  offset += isMasked ? 4 : 0;

  const payload = buffer.subarray(offset, offset + length);

  if (!mask) {
    return payload.toString("utf8");
  }

  const decoded = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    decoded[index] = payload[index] ^ mask[index % 4];
  }

  return decoded.toString("utf8");
}

function getSessionFromRequest(request) {
  const url = new URL(request.url ?? "/ws", "http://localhost");

  return {
    id: url.searchParams.get("sessionId") || crypto.randomUUID(),
    name: url.searchParams.get("name") || "Guest",
    color: url.searchParams.get("color") || "#38bdf8",
  };
}

const server = http.createServer((request, response) => {
  const { method, url } = request;

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (method !== "GET") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (url === "/api/devices") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(devices));
    return;
  }

  if (url === "/api/projects") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(projects));
    return;
  }

  if (url === "/api/rack-document") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(rackDocument));
    return;
  }

  if (url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ error: "Not found" }));
});

server.on("upgrade", (request, socket) => {
  if (!request.url?.startsWith("/ws")) {
    socket.destroy();
    return;
  }

  const key = request.headers["sec-websocket-key"];

  if (!key) {
    socket.destroy();
    return;
  }

  const session = getSessionFromRequest(request);
  const acceptKey = createWebSocketAcceptKey(key);

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "",
      "",
    ].join("\r\n"),
  );

  clients.set(session.id, {
    socket,
    session: {
      ...session,
      dragPreview: null,
      pointer: null,
    },
    dragPreview: null,
    pointer: null,
  });

  console.log(`WebSocket joined: ${session.name} (${clients.size} online)`);
  broadcastUsers();

  socket.on("data", (buffer) => {
    const message = readWebSocketMessage(buffer);

    if (!message) {
      return;
    }

    try {
      const event = JSON.parse(message);
      const client = clients.get(session.id);

      if (!client) {
        return;
      }

      if (event.type === "presence") {
        client.pointer = event.pointer;
        client.dragPreview = event.dragPreview;
        broadcastUsers();
        return;
      }

      if (event.type === "operation") {
        broadcastOperation(event.operation, session.id);
      }
    } catch (error) {
      console.error("Invalid websocket message", error);
    }
  });

  socket.on("close", () => {
    const currentClient = clients.get(session.id);

    if (currentClient?.socket === socket) {
      clients.delete(session.id);
      console.log(`WebSocket left: ${session.name} (${clients.size} online)`);
      broadcastUsers();
    }
  });

  socket.on("error", () => {
    const currentClient = clients.get(session.id);

    if (currentClient?.socket === socket) {
      clients.delete(session.id);
      console.log(`WebSocket left: ${session.name} (${clients.size} online)`);
      broadcastUsers();
    }
  });
});

const port = Number(process.env.PORT || 3001);

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
