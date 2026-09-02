import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "CHANGELOG.md",
  ".env.example",
  "package.json",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "ASSET_ATTRIBUTION.md",
  ".github/workflows/ci.yml",
  ".github/dependabot.yml",
  ".github/pull_request_template.md",
  "docs/ARCHITECTURE.md",
  "docs/LLM_BEHAVIOR.md",
  "docs/PRIVACY.md",
  "docs/IMPORTING_LETTERBOXD.md",
  "docs/OSS_RELEASE.md",
  "docs/ENVIRONMENT.md",
];

const prohibited = [
  /\/Users\/[^/]+\//i,
  /\/home\/[^/]+\//i,
  /letterboxd-[a-z0-9_-]+-\d{4}-\d\d-\d\d/i,
];

const violations = [];
for (const filename of publicFiles) {
  const contents = readFileSync(resolve(root, filename), "utf8");
  for (const pattern of prohibited) {
    if (pattern.test(contents)) violations.push(`${filename} matches ${pattern}`);
  }
}

if (violations.length) {
  console.error("Public-source privacy check failed:\n" + violations.join("\n"));
  process.exit(1);
}

console.log(`Public-source privacy check passed for ${publicFiles.length} files.`);
