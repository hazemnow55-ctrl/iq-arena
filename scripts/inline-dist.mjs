import { readFile, writeFile, rm, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "../dist/public");
const indexPath = join(publicDir, "index.html");
let html = await readFile(indexPath, "utf8");

const cssMatches = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)];
for (const match of cssMatches) {
  const assetPath = join(publicDir, match[1].replace(/^\.\//, ""));
  const css = await readFile(assetPath, "utf8");
  html = html.replace(match[0], () => `<style data-inline-asset="${match[1]}">\n${css}\n</style>`);
}

const jsMatches = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g)];
for (const match of jsMatches) {
  if (match[1].includes("debug-collector")) {
    html = html.replace(match[0], () => "");
    continue;
  }
  const assetPath = join(publicDir, match[1].replace(/^\.\//, ""));
  const js = await readFile(assetPath, "utf8");
  // Use a Unicode escape so the HTML parser never sees a closing tag inside the bundle.
  const safeJs = js.replace(/<\/script/gi, "<\\\\u002Fscript");
  html = html.replace(match[0], () => `<script type="module" data-inline-asset="${match[1]}">\n${safeJs}\n</script>`);
}

await writeFile(indexPath, html, "utf8");
const entries = await readdir(join(publicDir, "assets"));
await rm(join(publicDir, "assets"), { recursive: true, force: true });
await rm(join(publicDir, "__manus__"), { recursive: true, force: true });
await rm(join(publicDir, ".gitkeep"), { force: true });
console.log(`Created single-file dist/public/index.html; inlined ${entries.length} compiled assets.`);
