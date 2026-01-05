/**
 * server/static.ts
 * 
 * Static file serving for production builds.
 * Serves the compiled React application from the dist/public directory
 * with caching and fallback to index.html for client-side routing.
 */

import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache static assets (Vite appends hashes to filenames for cache busting)
  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    index: false,
    fallthrough: true
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
