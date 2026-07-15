import assert from "node:assert/strict";

const baseUrl = (process.env.DEPLOYMENT_URL ?? "https://gonvex-passport.gabrielmalek.com").replace(/\/$/, "");

const pageResponse = await fetch(`${baseUrl}/`);
assert.equal(pageResponse.status, 200, "the deployed page should load");

const html = await pageResponse.text();
const moduleSource = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/)?.[1];

assert.ok(moduleSource, "the deployed page should reference a module script");
assert.doesNotMatch(moduleSource, /(?:^|\/)src\/|\.tsx?(?:$|\?)/, "the deployment must serve Vite's built JavaScript, not TypeScript source");

const assetUrl = new URL(moduleSource, `${baseUrl}/`);
const assetResponse = await fetch(assetUrl);
assert.equal(assetResponse.status, 200, "the built module script should load");

const contentType = assetResponse.headers.get("content-type") ?? "";
assert.match(contentType, /(?:java|ecma)script/i, `the module script must have a JavaScript MIME type, received ${contentType || "none"}`);

console.log(`deployment smoke test passed: ${assetUrl.pathname} (${contentType})`);
