const fs = require("fs");
const path = require("path");

const buildSwPath = path.join(__dirname, "..", "build", "sw.js");

if (!fs.existsSync(buildSwPath)) {
  console.error("stamp-sw: build/sw.js not found — run after react-scripts build");
  process.exit(1);
}

const version =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
  process.env.REACT_APP_BUILD_ID ??
  Date.now().toString(36);

const content = fs.readFileSync(buildSwPath, "utf8");

if (!content.includes("__CACHE_VERSION__")) {
  console.error("stamp-sw: __CACHE_VERSION__ placeholder missing in build/sw.js");
  process.exit(1);
}

fs.writeFileSync(buildSwPath, content.replaceAll("__CACHE_VERSION__", version));
console.log(`stamp-sw: cache version set to ${version}`);
