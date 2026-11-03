// Admin login, step 2: GitHub sends the user back here; we swap the code for a token
// and hand it to the admin panel window (same website only).
export default async function handler(req, res) {
  const { code, state } = req.query || {};
  const cookie = (req.headers.cookie || "").match(/(?:^|;\s*)cms_state=([a-f0-9]+)/);
  const page = (status, payload) => {
    const msg = JSON.stringify(`authorization:github:${status}:${JSON.stringify(payload)}`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Set-Cookie", "cms_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    res.status(200).send(`<!doctype html><meta charset="utf-8"><p style="font-family:system-ui">Signing you in…</p>
<script>
(function () {
  function receive(e) {
    if (e.origin !== window.location.origin) return; // only talk to our own admin page
    window.opener.postMessage(${msg}, e.origin);
    window.removeEventListener("message", receive, false);
    setTimeout(function () { window.close(); }, 300);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", window.location.origin);
})();
</script>`);
  };

  if (!code || !state || !cookie || cookie[1] !== state) return page("error", { message: "Login expired — please try again." });

  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: (process.env.GITHUB_CLIENT_ID || "").trim(),
        client_secret: (process.env.GITHUB_CLIENT_SECRET || "").trim(),
        code,
        redirect_uri: `https://${host}/api/callback`,
      }),
    });
    const data = await r.json();
    if (!data.access_token) return page("error", { message: data.error_description || "GitHub login failed." });
    return page("success", { token: data.access_token, provider: "github" });
  } catch {
    return page("error", { message: "Could not reach GitHub." });
  }
}
