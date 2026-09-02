import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function send(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
  response.end(message);
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const file = resolve(root, `.${requested}`);

  if (!file.startsWith(`${root}${sep}`) || /\/(?:\.git|\.env)(?:\/|$)/.test(requested)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    if (!statSync(file).isFile()) throw new Error("not a file");
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(file).pipe(response);
  } catch {
    send(response, 404, "Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`LIFE is running at http://127.0.0.1:${port}`);
});
