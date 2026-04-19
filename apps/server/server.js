import http from "node:http";
import { devices, rackDevices } from "./mock-data.js";

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

  if (url === "/api/rack-devices") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(rackDevices));
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

const port = Number(process.env.PORT || 3001);

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
