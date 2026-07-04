import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const manifestPath = path.join(rootDir, "system.json");

if (!existsSync(manifestPath)) {
  throw new Error("system.json not found in project root.");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const packageId = manifest.id ?? "package";
const version = manifest.version ?? "0.0.0";
const archiveName = `${packageId}-v${version}.zip`;
const archivePath = path.join(distDir, archiveName);

const releaseEntries = [
  "assets",
  "css",
  "lang",
  "module",
  "templates",
  "system.json",
  "template.json",
  "README.md",
  "CHANGELOG.md",
].filter((entry) => existsSync(path.join(rootDir, entry)));

if (releaseEntries.length === 0) {
  throw new Error("No release files found to package.");
}

mkdirSync(distDir, { recursive: true });
rmSync(archivePath, { force: true });

try {
  execFileSync("zip", ["-r", archivePath, ...releaseEntries], {
    cwd: rootDir,
    stdio: "inherit",
  });
} catch (error) {
  if (error.code === "ENOENT") {
    throw new Error("The 'zip' command is required to create a release archive.");
  }
  throw error;
}

process.stdout.write(`${archivePath}\n`);
