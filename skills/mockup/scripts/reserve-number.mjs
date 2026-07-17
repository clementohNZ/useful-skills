#!/usr/bin/env node

import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const SEQUENCE_PATTERN = /(?:^|[^0-9])(\d{6})(?=[^0-9]|$)/g;
const MAX_SEQUENCE = 999_999;

function collectSequenceNumbers(mockupsRoot, reservationsRoot) {
  const numbers = [];
  const directories = [mockupsRoot];

  while (directories.length > 0) {
    const directory = directories.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (path === reservationsRoot) continue;
      if (entry.isDirectory()) {
        directories.push(path);
        continue;
      }
      for (const match of entry.name.matchAll(SEQUENCE_PATTERN)) numbers.push(Number(match[1]));
    }
  }

  const manifestPath = join(mockupsRoot, "manifest.js");
  if (existsSync(manifestPath)) {
    const manifest = readFileSync(manifestPath, "utf8");
    for (const match of manifest.matchAll(/"(?:n|id)"\s*:\s*"?(\d{1,6})"?/g)) numbers.push(Number(match[1]));
  }

  if (existsSync(reservationsRoot)) {
    for (const entry of readdirSync(reservationsRoot, { withFileTypes: true })) {
      if (entry.isFile() && /^\d{6}$/.test(entry.name)) numbers.push(Number(entry.name));
    }
  }

  return numbers;
}

function reserveNumber(workspaceRoot) {
  const root = resolve(workspaceRoot);
  const mockupsRoot = basename(root) === "mock-ups" ? root : join(root, "mock-ups");
  const reservationsRoot = join(mockupsRoot, ".sequence-reservations");
  mkdirSync(reservationsRoot, { recursive: true });

  const ignorePath = join(reservationsRoot, ".gitignore");
  if (!existsSync(ignorePath)) {
    try {
      writeFileSync(ignorePath, "*\n!.gitignore\n", { flag: "wx" });
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }
  }

  while (true) {
    const numbers = collectSequenceNumbers(mockupsRoot, reservationsRoot);
    const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
    if (next > MAX_SEQUENCE) throw new Error("Mockup sequence exhausted its 6-digit range");

    const id = String(next).padStart(6, "0");
    const reservationPath = join(reservationsRoot, id);
    try {
      const descriptor = openSync(reservationPath, "wx");
      writeFileSync(descriptor, JSON.stringify({ id, n: next, pid: process.pid, reservedAt: new Date().toISOString() }) + "\n");
      closeSync(descriptor);
      return { id, n: next, reservationPath };
    } catch (error) {
      if (error?.code === "EEXIST") continue;
      throw error;
    }
  }
}

const workspaceRoot = process.argv[2] || process.cwd();
try {
  process.stdout.write(JSON.stringify(reserveNumber(workspaceRoot)) + "\n");
} catch (error) {
  process.stderr.write(`reserve-number: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
