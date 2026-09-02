import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = readFileSync(resolve(root, "app.js"), "utf8");
const markup = readFileSync(resolve(root, "index.html"), "utf8");

test("keeps the deterministic quick-capture surface available offline", () => {
  for (const marker of [
    'f:{type:"film"',
    'b:{type:"book"',
    'g:{type:"game"',
    's:{type:"study"',
    'c:{type:"course"',
    'j:{type:"journal"',
    't:{type:"task"',
    'h:{type:"habit"',
    'n:{type:"generic"',
    'w:{type:"watchlist"',
  ]) assert.ok(source.includes(marker), `missing quick-capture marker: ${marker}`);
  assert.match(markup, /id="quickCapture"/);
});

test("keeps all local-first modules reachable", () => {
  for (const view of ["library", "study", "courses", "journal", "goals", "rituals", "archive", "dashboard", "achievements", "settings"]) {
    assert.match(markup, new RegExp(`id="view-${view}"`));
  }
});

test("does not embed a user's real Letterboxd export path", () => {
  assert.doesNotMatch(source, /letterboxd-[a-z0-9_-]+-\d{4}-\d\d-\d\d|\/Users\/[^/]+\//i);
  assert.doesNotMatch(markup, /letterboxd-[a-z0-9_-]+-\d{4}-\d\d-\d\d|\/Users\/[^/]+\//i);
});
