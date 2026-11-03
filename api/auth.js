// Admin login, step 1: send the browser to GitHub to sign in.
// Needs GITHUB_CLIENT_ID (and GITHUB_CLIENT_SECRET for step 2) in Vercel → Settings → Environment Variables.
import { randomBytes } from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).send("Admin login is not set up yet: add GITHUB_CLIENT_ID in Vercel.");

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const state = randomBytes(16).toString("hex");
  const redirect = `https://${host}/api/callback`;

  res.setHeader("Set-Cookie", `cms_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("scope", "repo");
  url.searchParams.set("state", state);
  res.writeHead(302, { Location: url.toString() });
  res.end();
}
