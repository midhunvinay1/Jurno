import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = readFileSync(resolve(root, "app.js"), "utf8");

function loadChunk(firstMarker, lastMarker, exports, additions = {}) {
  const start = source.indexOf(firstMarker);
  const end = source.indexOf(lastMarker, start);
  assert.notEqual(start, -1, `missing ${firstMarker}`);
  assert.notEqual(end, -1, `missing ${lastMarker}`);
  const context = vm.createContext({ ...additions });
  vm.runInContext(`${source.slice(start, end)};globalThis.testExports={${exports.join(",")}};`, context);
  return context.testExports;
}

function loadLetterboxdImporter(state) {
  const start = source.indexOf("function csvRows");
  const end = source.indexOf("function showView", start);
  const context = vm.createContext({
    state,
    uid: (() => { let count = 0; return () => `test-${++count}`; })(),
    todayISO: () => "2026-09-02",
    validISODate: value => /^\d{4}-\d\d-\d\d$/.test(value),
    titleCase: value => value,
  });
  vm.runInContext(`${source.slice(start, end)};globalThis.testImporter={parseCSV,letterboxdFileType,upsertImportedFilm,importDiaryRow};`, context);
  return context.testImporter;
}

test("recognizes the real List Export v7 header after its preamble", () => {
  const { parseCSV } = loadChunk("function csvRows", "function csvValue", ["parseCSV"]);
  const fixture = readFileSync(resolve(root, "tests/fixtures/letterboxd-list-v7.csv"), "utf8");
  const parsed = parseCSV(fixture);
  assert.deepEqual([...parsed.headers], ["position", "name", "year", "url", "description"]);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0].name, "A, Quoted Film");
  assert.equal(parsed.rows[0].description, "A comma, safely preserved");
});

test("keeps diary rewatch data in the detected table", () => {
  const { parseCSV } = loadChunk("function csvRows", "function csvValue", ["parseCSV"]);
  const fixture = readFileSync(resolve(root, "tests/fixtures/letterboxd-diary.csv"), "utf8");
  const parsed = parseCSV(fixture);
  assert.equal(parsed.rows[1].rewatch, "Yes");
  assert.equal(parsed.rows[1]["watched date"], "2026-08-21");
});

test("quick capture keeps hour-only durations, page fractions, course parts, and explicit dates", () => {
  const { parseOneCapture } = loadChunk("function extractMinutes", "function ensureLibraryItem", ["parseOneCapture"], {
    todayISO: () => "2026-09-02",
    isoOffset: days => `2026-09-0${2 - days}`,
    formatDuration: minutes => `${minutes}m`,
  });
  const study = parseOneCapture("s 2h linear algebra @2026-08-25");
  const book = parseOneCapture("b piranesi p120/272 25m");
  const course = parseOneCapture("c astro physics 3");
  assert.equal(study.minutes, 120);
  assert.equal(study.date, "2026-08-25");
  assert.deepEqual({ page: book.page, totalPages: book.totalPages, progress: book.progress }, { page: 120, totalPages: 272, progress: 44 });
  assert.equal(course.courseTitle, "astro physics");
  assert.equal(course.coursePart, 3);
});

test("Letterboxd core import preserves overlapping states and is diary-idempotent", () => {
  const state = { library: [], mediaLists: [], activities: [] };
  const { parseCSV, letterboxdFileType, upsertImportedFilm, importDiaryRow } = loadLetterboxdImporter(state);
  const fixture = readFileSync(resolve(root, "tests/fixtures/letterboxd-diary.csv"), "utf8");
  const diary = parseCSV(fixture);
  const first = diary.rows[0];
  const watchlistItem = upsertImportedFilm(first, { watchlisted: true });
  const watchedItem = upsertImportedFilm(first, { watched: true });
  assert.equal(watchlistItem, watchedItem);
  assert.equal(watchedItem.watchlisted, true);
  assert.equal(watchedItem.watched, true);
  assert.equal(watchedItem.rating, 4.5);
  assert.equal(letterboxdFileType({ name: "diary.csv", webkitRelativePath: "" }, diary), "diary");
  const counters = { diary: 0 };
  for (const row of diary.rows) importDiaryRow(row, counters);
  for (const row of diary.rows) importDiaryRow(row, counters);
  assert.equal(state.activities.length, 2);
  assert.equal(state.activities[1].rewatch, true);
  assert.equal(counters.diary, 2);
});

test("portable backups and restores never carry provider secrets", () => {
  const seedState = () => ({
    profile: { name: "You" },
    ui: { library: "films" },
    provider: { type: "none", endpoint: "", model: "", key: "" },
    activities: [], library: [], mediaLists: [], courses: [], goals: [], skills: [], rituals: [], events: [], resolutions: [], breathworkLogs: [], achievements: [], journals: {},
  });
  const { createPortableBackup, restoreBackupState, upgradeState } = loadChunk("function normalizeProvider", "function loadState", ["createPortableBackup", "restoreBackupState", "upgradeState"], { seedState });
  const configured = {
    ...seedState(),
    provider: { type: "custom", endpoint: "https://example.test/v1", model: "personal-model", key: "live-key-must-stay-local", apiKey: "legacy-secret", headers: { Authorization: "Bearer legacy-secret" } },
  };
  const backup = createPortableBackup(configured);
  assert.deepEqual({ ...backup.provider }, { type: "custom", endpoint: "https://example.test/v1", model: "personal-model", key: "" });
  assert.doesNotMatch(JSON.stringify(backup), /live-key-must-stay-local|legacy-secret/);
  assert.equal(upgradeState(configured).provider.key, "live-key-must-stay-local", "normal local loading keeps the device's current key");
  assert.deepEqual({ ...restoreBackupState(configured).provider }, { ...backup.provider }, "restoring a backup strips every provider secret");
});

test("the public app keeps imports idempotent and routes backup restore through the safe path", () => {
  assert.match(source, /importKey/);
  assert.match(source, /const archive=createPortableBackup\(state\)/);
  assert.match(source, /const restored=restoreBackupState\(raw\)/);
});
