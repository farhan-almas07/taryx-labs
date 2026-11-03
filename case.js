// Builds a case study page from site-data.js — case.html?p=<slug>
// All site content lives in site-data.json (edited from the /admin panel)
const data = await fetch("site-data.json", { cache: "no-cache" }).then((r) => r.json());

const $ = (s, el = document) => el.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ext = (u) => (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : "");

const slug = new URLSearchParams(location.search).get("p");
const i = Math.max(0, data.projects.findIndex((p) => p.slug === slug));
const p = data.projects[i];
const next = data.projects[(i + 1) % data.projects.length];
const c = p.case || {};
document.title = `${p.title} — Case study · ${data.company}`;
document.documentElement.style.setProperty("--accent-case", p.accent || "#e2bd7b");
$("[data-year]").textContent = new Date().getFullYear();

const list = (arr = []) => arr.map((x) => `<li>${esc(x)}</li>`).join("");

$("#case").innerHTML = `
  <section class="case-hero">
    <div class="container">
      <a class="case-back reveal" href="index.html#projects">← All work</a>
      <p class="case-cat reveal">${esc(p.category || "Project")}${p.year ? ` · ${esc(p.year)}` : ""}</p>
      <h1 class="case-title reveal">${esc(p.title)}</h1>
      <p class="case-lead reveal">${esc(p.description)}</p>
      <div class="case-actions reveal">
        ${p.demo ? `<a class="btn btn-primary" href="${esc(p.demo)}"${ext(p.demo)}>Open live demo <span class="arr">↗</span></a>` : ""}
        ${p.code ? `<a class="btn btn-ghost" href="${esc(p.code)}" target="_blank" rel="noopener">View code</a>` : ""}
        <a class="btn btn-ghost" href="index.html#contact">Start a similar project</a>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="case-shot reveal">
      <div class="browser">
        <div class="browser-bar"><i></i><i></i><i></i><span>taryxlabs.com/${esc((p.demo || "").replace(/\/$/, ""))}</span></div>
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" />` : `<div class="browser-empty">${esc(p.title)}</div>`}
      </div>
    </div>

    <div class="case-meta reveal">
      <div><span>Role</span><strong>${esc(c.role || "Design & development")}</strong></div>
      <div><span>Timeline</span><strong>${esc(c.timeline || "—")}</strong></div>
      <div><span>Year</span><strong>${esc(p.year || "—")}</strong></div>
      <div><span>Status</span><strong>${esc(p.status || "—")}</strong></div>
    </div>

    <div class="case-grid">
      <article class="case-block reveal"><p class="case-label">01 · The challenge</p><p class="case-text">${esc(c.challenge || "")}</p></article>
      <article class="case-block reveal"><p class="case-label">02 · Our solution</p><p class="case-text">${esc(c.solution || "")}</p></article>
    </div>

    <div class="case-block wide reveal">
      <p class="case-label">03 · Key features</p>
      <ul class="case-features">${list(c.features)}</ul>
    </div>

    <div class="case-block wide reveal">
      <p class="case-label">04 · Outcome</p>
      <div class="case-results">${(c.results || []).map((r, k) => `<div><b>${String(k + 1).padStart(2, "0")}</b><p>${esc(r)}</p></div>`).join("")}</div>
    </div>

    <div class="case-block wide reveal">
      <p class="case-label">05 · Built with</p>
      <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </div>
  </section>

  <section class="container">
    <a class="case-next reveal" href="case.html?p=${encodeURIComponent(next.slug)}">
      <span>Next project</span>
      <strong>${esc(next.title)} <span class="arr">→</span></strong>
      <em>${esc(next.category || "")}</em>
    </a>
    <div class="case-cta reveal">
      <h2>Want something like this<br /><span class="shine">for your business?</span></h2>
      <a class="btn btn-primary" href="index.html#contact">Start a project <span class="arr">→</span></a>
    </div>
  </section>`;

// reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, k) => { el.style.setProperty("--d", `${Math.min(k, 5) * 0.06}s`); io.observe(el); });
const bar = $(".progress");
addEventListener("scroll", () => (bar.style.transform = `scaleX(${scrollY / (document.documentElement.scrollHeight - innerHeight) || 0})`), { passive: true });
