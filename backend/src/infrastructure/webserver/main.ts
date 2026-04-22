import { app, port } from "./server";

const server = app.listen(port, () => {
  console.log(`Banked server is running on port ${port}`);
});

server.on("error", (error: any) => {
  console.error("Failed to start HTTP server:", error);
  process.exit(1);
});

// Keep the server handle referenced so the process does not exit unexpectedly.
server.ref();
