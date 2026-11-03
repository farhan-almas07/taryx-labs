// All site content lives in site-data.json (edited from the /admin panel)
const data = await fetch("site-data.json", { cache: "no-cache" }).then((r) => r.json());

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduce = false; // animations always on
const desktop = () => innerWidth > 900;

/* ================= Fill content from site-data.js ================= */
$$("[data-name]").forEach((el) => (el.textContent = data.name));
$$("[data-role]").forEach((el) => (el.textContent = data.role));
$$("[data-company]").forEach((el) => (el.textContent = data.company));
$$("[data-company-story]").forEach((el) => (el.textContent = data.companyStory));
$$("[data-title]").forEach((el) => (el.textContent = data.title));
$$("[data-photo]").forEach((el) => (el.src = data.photo));
$$("[data-avatar]").forEach((el) => (el.src = data.avatar || data.photo));
$("[data-hero-line]").textContent = data.heroLine;
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
$$("[data-location]").forEach((el) => (el.textContent = data.location));
$("[data-bigname]").textContent = data.company;

// Live local time
const clock = $("[data-clock]");
const tick = () => (clock.textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: data.timeZone }));
tick();
setInterval(tick, 30000);

// Headline: each word rises in; *word* becomes the glowing gold word
let wi = 0;
$("[data-headline]").innerHTML = data.headline
  .map((line) => `<span class="line">${line.split(" ").map((w) => {
      const m = w.match(/^\*(.+)\*$/);
      const inner = m ? `<span class="shine">${esc(m[1])}</span>` : esc(w);
      return `<span class="wd" style="--i:${wi++}">${inner}</span>`;
    }).join(" ")}</span>`)
  .join("");



// Tech tiles (light up when the terminal mentions them)
const kinds = ["language", "framework", "ai", "design"];
const kindOf = (t) => {
  const g = data.skills.findIndex((s) => s.items.includes(t));
  return g >= 0 ? kinds[g] || "tool" : "tool";
};
$("[data-techgrid]").innerHTML = data.tools
  .map((t) => `<div class="tile" data-tool="${esc(t)}"><small>${kindOf(t)}</small>${esc(t)}</div>`)
  .join("");

$("[data-statement]").innerHTML = data.statement
  .split(" ")
  .map((w) => `<span class="w${data.highlight.includes(w) ? " hl" : ""}">${esc(w)}</span>`)
  .join(" ");

const icons = {
  web: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>`,
  design: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.7z"/></svg>`,
};
$("[data-offerings]").innerHTML = data.offerings
  .map((o, i) => `<div class="card offer tilt reveal" style="--d:${i * 0.1}s">
      <div class="icon">${icons[o.icon] || icons.web}</div>
      <h3>${esc(o.title)}</h3><p>${esc(o.text)}</p>
    </div>`)
  .join("");

$("[data-story]").innerHTML = data.story.map((p, i) => `<p class="reveal" style="--d:${i * 0.1}s">${esc(p)}</p>`).join("");
$("[data-facts]").innerHTML = data.facts
  .map((f, i) => `<div class="fact reveal" style="--d:${i * 0.08}s"><span>${esc(f.label)}</span><strong>${esc(f.value)}</strong></div>`)
  .join("");
$("[data-journey]").innerHTML =
  `<div class="line-fill"></div>` +
  data.journey
    .map((s, i) => `<div class="step reveal" style="--d:${0.2 + i * 0.15}s"><small>${esc(s.tag)}</small><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`)
    .join("");

$("[data-skills]").innerHTML = data.skills
  .map((s, i) => `<div class="card skill tilt reveal" style="--d:${i * 0.1}s">
      <div class="num">${String(i + 1).padStart(2, "0")}</div>
      <h3>${esc(s.group)}</h3><p>${esc(s.note)}</p>
      <div class="chips">${s.items.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </div>`)
  .join("");

const badge = (s) => (/^live/i.test(s) ? "live" : /soon|planned/i.test(s) ? "soon" : "");
const ext = (u) => (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : "");
const host = (u) => (u ? u.replace(/^https?:\/\//, "").replace(/\/$/, "") : "taryxlabs.com");
$("[data-projects]").innerHTML = data.projects
  .map((p, i) => {
    const caseUrl = `case.html?p=${encodeURIComponent(p.slug)}`;
    return `<article class="slide" style="--accent:${esc(p.accent || "#e2bd7b")}" data-i="${i}">
      <a class="slide-media" href="${caseUrl}" aria-label="${esc(p.title)} case study" draggable="false">
        <div class="browser">
          <div class="browser-bar"><i></i><i></i><i></i><span>taryxlabs.com/${esc(host(p.demo) === "taryxlabs.com" ? "" : host(p.demo))}</span></div>
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy" draggable="false" />` : `<div class="browser-empty">${esc(p.title)}</div>`}
        </div>
      </a>
      <div class="slide-body">
        <div class="slide-meta"><span class="badge ${badge(p.status)}">${esc(p.status)}</span><span>${esc(p.category || "")}${p.year ? ` · ${esc(p.year)}` : ""}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <div class="slide-actions">
          ${p.case ? `<a class="btn btn-primary small" href="${caseUrl}">View case study <span class="arr">→</span></a>` : ""}
          ${p.demo ? `<a class="btn btn-ghost small" href="${esc(p.demo)}"${ext(p.demo)}>Live demo ↗</a>` : ""}
          ${p.code ? `<a class="btn btn-ghost small" href="${esc(p.code)}" target="_blank" rel="noopener">Code ↗</a>` : ""}
        </div>
      </div>
      <span class="slide-num">${String(i + 1).padStart(2, "0")}</span>
    </article>`;
  })
  .join("");

$("[data-process]").innerHTML = data.process
  .map((p, i) => `<div class="card proc tilt reveal" style="--d:${i * 0.1}s"><span class="n">${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`)
  .join("");

if (data.showServices) {
  $("#services").hidden = false;
  $(".services-link").hidden = false;
  $("[data-services]").innerHTML = data.services
    .map((s, i) => `<div class="card service tilt reveal" style="--d:${i * 0.1}s">
        <h3>${esc(s.name)}</h3><div class="price">${esc(s.price)}</div><p>${esc(s.description)}</p>
        <a class="btn ${i === 1 ? "btn-primary" : "btn-ghost"}" href="${esc(s.link || "#contact")}" ${s.link ? 'target="_blank" rel="noopener"' : "data-start"}>Get started</a>
      </div>`)
    .join("");
}

$("[data-email]").textContent = data.email;
$("[data-gmail]").href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.email)}&su=${encodeURIComponent("Project inquiry")}`;
$("[data-copy-email]").addEventListener("click", async (e) => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(data.email); } catch {
    const r = document.createRange(); r.selectNodeContents($("[data-email]"));
    getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy");
  }
  b.textContent = "Copied ✓"; b.classList.add("done");
  setTimeout(() => ((b.textContent = "Copy"), b.classList.remove("done")), 1800);
});

// "What do you need?" choices in the contact form
$("[data-choices]").innerHTML = [...data.offerings.map((o) => o.title), "Something else"]
  .map((c, i) => `<label><input type="radio" name="service" value="${esc(c)}" ${i === 0 ? "checked" : ""} /><span>${esc(c)}</span></label>`)
  .join("");
$("[data-github]").href = data.links.github;
$("[data-linkedin]").href = data.links.linkedin;
if (data.links.fiverr) Object.assign($("[data-fiverr]"), { href: data.links.fiverr, hidden: false });

/* ================= Intro → hero ================= */
// Waits for the 3D intro (intro3d.js) to finish, with a safety timeout.
const introDone = new Promise((res) => {
  if (reduce || window.__introDone) return res();
  addEventListener("intro:done", res, { once: true });
  setTimeout(res, 7000);
});
introDone.then(() => {
  document.body.classList.remove("loading");
  document.body.classList.add("ready");
  $$(".hero .reveal").forEach((el, i) => {
    el.style.setProperty("--d", `${0.5 + i * 0.12}s`);
    el.classList.add("in");
  });
  // after the entrance, make the photo card respond instantly to tilt
  setTimeout(() => document.body.classList.add("settled"), 2400);
});

/* ================= Reveal on scroll ================= */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
$$(".reveal, .journey").forEach((el) => !el.closest(".hero") && io.observe(el));

/* ================= Scroll-linked effects ================= */
const nav = $("#nav"), bar = $(".progress");
const heroInner = $(".hero-inner");
const statement = $("#statement"), words = $$(".statement-text .w");
const bigname = $(".bigname");
let lastY = 0;

function onScroll() {
  const y = scrollY, vh = innerHeight;
  nav.classList.toggle("scrolled", y > 20);
  nav.classList.toggle("hide", y > lastY && y > vh * 0.8 && !document.body.classList.contains("chat-open"));
  lastY = y;
  bar.style.transform = `scaleX(${y / (document.documentElement.scrollHeight - vh) || 0})`;

  if (!desktop()) {
    heroInner.style.cssText = "";
  } else if (!reduce) {
    const p = Math.min(1, y / vh);
    heroInner.style.transform = `translateY(${p * -80}px) scale(${1 - p * 0.1})`;
    heroInner.style.opacity = Math.max(0, 1 - p * 1.6);
  }

  // Giant name fills with color as it scrolls through the screen
  const br = bigname.getBoundingClientRect();
  const bp = Math.min(1, Math.max(0, (vh - br.top) / (vh * 0.9)));
  bigname.style.setProperty("--fill", `${bp * 100}%`);

  // Statement words light up
  const r = statement.getBoundingClientRect();
  const prog = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
  const lit = Math.round(prog * 1.2 * words.length);
  words.forEach((w, i) => w.classList.toggle("on", i < lit));

}
let ticking = false;
addEventListener("scroll", () => {
  if (!ticking) requestAnimationFrame(() => (onScroll(), (ticking = false)));
  ticking = true;
}, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ================= Projects slider ================= */
// Swipe / trackpad (native scroll-snap), mouse drag, arrows, dots and keyboard.
const slider = $(".slider"), slidesEl = $(".slides"), slides = $$(".slide");
const dotsEl = $("[data-dots]");
dotsEl.innerHTML = slides.map((_, i) => `<button aria-label="Go to project ${i + 1}"></button>`).join("");
const dots = $$("button", dotsEl);
$("[data-slide-total]").textContent = String(slides.length).padStart(2, "0");
let current = 0;

function goTo(i) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  const pad = parseFloat(getComputedStyle(slidesEl).paddingLeft) || 0;
  slidesEl.scrollTo({ left: slides[i].offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
}
function updateActive() {
  const mid = slidesEl.scrollLeft + slidesEl.clientWidth / 2;
  let best = 0, dist = Infinity;
  slides.forEach((s, i) => {
    const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
    if (d < dist) ((dist = d), (best = i));
  });
  // at the very end, the last slide is active
  if (slidesEl.scrollLeft + slidesEl.clientWidth >= slidesEl.scrollWidth - 4) best = slides.length - 1;
  current = best;
  slides.forEach((s, i) => s.classList.toggle("active", i === best));
  dots.forEach((d, i) => d.classList.toggle("on", i === best));
  $("[data-slide-now]").textContent = String(best + 1).padStart(2, "0");
  $("[data-prev]").disabled = best === 0;
  $("[data-next]").disabled = best === slides.length - 1;
}
slidesEl.addEventListener("scroll", () => requestAnimationFrame(updateActive), { passive: true });
addEventListener("resize", updateActive);
$("[data-prev]").addEventListener("click", () => goTo(current - 1));
$("[data-next]").addEventListener("click", () => goTo(current + 1));
dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));
slider.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") (e.preventDefault(), goTo(current + 1));
  if (e.key === "ArrowLeft") (e.preventDefault(), goTo(current - 1));
});
// click a dimmed side slide to bring it to the centre
slidesEl.addEventListener("click", (e) => {
  const s = e.target.closest(".slide");
  if (s && !s.classList.contains("active")) { e.preventDefault(); goTo(+s.dataset.i); }
}, true);
// mouse drag (touch uses native swipe)
let drag = null;
slidesEl.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  drag = { x: e.clientX, left: slidesEl.scrollLeft, moved: false, start: current };
});
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) > 6) {
    drag.moved = true;
    slidesEl.classList.add("dragging");
  }
  if (drag.moved) slidesEl.scrollLeft = drag.left - dx;
});
addEventListener("pointerup", () => {
  if (!drag) return;
  const wasMoved = drag.moved, dx = slidesEl.scrollLeft - drag.left, start = drag.start;
  drag = null;
  if (!wasMoved) return;
  slidesEl.classList.remove("dragging");
  // stop the click that follows a drag, then snap to the nearest slide
  slidesEl.addEventListener("click", (e) => (e.preventDefault(), e.stopPropagation()), { capture: true, once: true });
  updateActive();
  // a short drag still moves one slide in the drag direction
  goTo(current === start && Math.abs(dx) > 60 ? start + Math.sign(dx) : current);
});
updateActive();

/* ================= Card spotlight + 3D tilt ================= */
const finePointer = matchMedia("(pointer: fine)").matches;
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest?.(".card, .tilt");
  if (!card) return;
  const r = card.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  card.style.setProperty("--mx", `${x}px`);
  card.style.setProperty("--my", `${y}px`);
  const settled = !card.classList.contains("reveal") || card.classList.contains("in");
  if (finePointer && !reduce && card.classList.contains("tilt") && settled) {
    const rx = (y / r.height - 0.5) * -6, ry = (x / r.width - 0.5) * 6;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  }
});
$$(".tilt").forEach((c) => c.addEventListener("pointerleave", () => (c.style.transform = "")));

/* ================= Cursor light ================= */
if (finePointer && !reduce) {
  const light = $(".cursor-light");
  document.body.classList.add("has-cursor");
  let lx = innerWidth / 2, ly = innerHeight / 2, tx = lx, ty = ly;
  addEventListener("pointermove", (e) => ((tx = e.clientX), (ty = e.clientY)), { passive: true });
  (function follow() {
    lx += (tx - lx) * 0.12; ly += (ty - ly) * 0.12;
    light.style.transform = `translate(${lx}px, ${ly}px)`;
    requestAnimationFrame(follow);
  })();
}

/* ================= Magnetic buttons ================= */
if (finePointer && !reduce) {
  $$(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

/* ================= Live terminal ================= */
const term = $("[data-terminal]");
const list = (a) => "[" + a.map((x) => `<span class="str">"${esc(x)}"</span>`).join(", ") + "]";
const [langs, fw, ai, design] = data.skills.map((s) => s.items);
const script = [
  { cmd: "whoami" },
  { out: `${esc(data.name)} — ${esc(data.role)}, ${esc(data.company)}` },
  { cmd: "cat stack.json" },
  { out: `{\n  "languages":  ${list(langs)},\n  "frameworks": ${list(fw)},\n  "ai":         ${list(ai.filter((x) => /API|Claude/.test(x)))},\n  "design":     ${list(design.filter((x) => /Figma|UI/.test(x)))}\n}` },
  { cmd: "build --ai --premium --mobile-first" },
  { out: `<span class="ok">✓</span> Design crafted\n<span class="ok">✓</span> AI assistant connected\n<span class="ok">✓</span> Live on the web <span class="cm">// ready for your project</span>` },
];
const tiles = $$(".tile");
function lightTiles(text) {
  tiles.forEach((t) => {
    if (!t.classList.contains("lit") && text.includes(`"${t.dataset.tool}"`)) {
      t.classList.add("lit", "flash");
    }
  });
}
// Type HTML text char by char (tags are inserted whole)
async function typeInto(el, html, speed) {
  const parts = html.match(/<[^>]+>|&[a-z#0-9]+;|[\s\S]/g) || [];
  let buf = "";
  for (const p of parts) {
    buf += p;
    if (p.length === 1 || p.startsWith("&")) {
      el.innerHTML = buf + '<span class="caret"></span>';
      if (p === '"' ) lightTiles(el.textContent);
      if (speed) await new Promise((r) => setTimeout(r, p === "\n" ? speed * 6 : speed));
    }
  }
  el.innerHTML = buf;
}
let termStarted = false;
async function runTerminal() {
  if (termStarted) return;
  termStarted = true;
  let html = "";
  const fast = reduce ? 0 : 1;
  for (const step of script) {
    const line = document.createElement("span");
    term.appendChild(line);
    if (step.cmd) {
      line.innerHTML = '<span class="pr">~ taryx$</span> ';
      const c = document.createElement("span"); line.appendChild(c);
      await typeInto(c, esc(step.cmd), 55 * fast);
      line.appendChild(document.createTextNode("\n"));
      if (fast) await new Promise((r) => setTimeout(r, 350));
    } else {
      await typeInto(line, step.out + "\n\n", 9 * fast);
    }
    lightTiles(term.textContent);
  }
  term.insertAdjacentHTML("beforeend", '<span class="pr">~ taryx$</span> <span class="caret"></span>');
  tiles.forEach((t) => t.classList.add("lit")); // anything not mentioned still lights at the end
}
new IntersectionObserver((entries, o) => {
  if (entries.some((e) => e.isIntersecting)) { runTerminal(); o.disconnect(); }
}, { threshold: 0.35 }).observe($(".terminal"));
$(".tech-grid").addEventListener("pointermove", (e) => {
  const t = e.target.closest(".tile"); if (!t) return;
  const r = t.getBoundingClientRect();
  t.style.setProperty("--mx", `${e.clientX - r.left}px`);
  t.style.setProperty("--my", `${e.clientY - r.top}px`);
});

/* ================= Start a project → contact form ================= */
const cform = $("#contact-form"), status = $(".form-status");
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-start]");
  if (!a) return;
  e.preventDefault();
  $("#contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  setTimeout(() => cform.querySelector("[name=name]").focus({ preventScroll: true }), 900);
});

const gmailLink = (p) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.email)}&su=${encodeURIComponent(p.subject)}&body=${encodeURIComponent(`${p.message}\n\nService: ${p.service}\nBudget: ${p.budget}\n\n— ${p.name} (${p.email})`)}`;

cform.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(cform);
  if (f.get("botcheck")) return; // spam bot
  let bad = null;
  ["name", "email", "message"].forEach((n) => {
    const el = cform.elements[n];
    const ok = el.value.trim() && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
    el.classList.toggle("invalid", !ok);
    if (!ok && !bad) bad = el;
  });
  if (bad) {
    status.className = "form-status err";
    status.textContent = "Please fill in your name, a valid email and a few words about your project.";
    bad.focus();
    return;
  }
  const p = {
    name: f.get("name").trim(),
    email: f.get("email").trim(),
    service: f.get("service"),
    budget: f.get("budget"),
    message: f.get("message").trim(),
    subject: `New project inquiry from ${f.get("name").trim()} — Taryx Labs`,
  };
  const done = (html) => {
    cform.reset();
    cform.classList.add("sent");
    status.className = "form-status ok";
    status.innerHTML = html;
  };

  // No form key yet → open a ready-to-send Gmail message (works everywhere)
  if (!data.contactFormKey) {
    window.open(gmailLink(p), "_blank", "noopener");
    done(`Gmail opened with your message ready — just press <b>Send</b>. Didn't open? <a href="${gmailLink(p)}" target="_blank" rel="noopener">Click here</a>.`);
    return;
  }

  const btn = cform.querySelector(".form-submit");
  btn.disabled = true;
  status.className = "form-status";
  status.textContent = "Sending…";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: data.contactFormKey,
        subject: p.subject,
        from_name: "Taryx Labs website",
        name: p.name, email: p.email, replyto: p.email,
        service: p.service, budget: p.budget, message: p.message,
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.success) throw new Error(out.message || res.status);
    done("Thank you! Your message was sent — we'll reply within 24 hours. ✓");
  } catch {
    status.className = "form-status err";
    status.innerHTML = `The message service didn't respond. <a href="${gmailLink(p)}" target="_blank" rel="noopener">Send it with Gmail instead</a> — your text is already filled in.`;
  }
  btn.disabled = false;
});
cform.addEventListener("input", (e) => e.target.classList.remove("invalid"));

/* ================= Chatbot ================= */
const body = $("#chat-body"), form = $("#chat-form"), input = $("#chat-input"), suggest = $("#chat-suggest");
const history = [];
let greeted = false, busy = false;

function addMsg(text, who) {
  const m = document.createElement("div");
  m.className = `msg ${who}`;
  m.textContent = text;
  body.appendChild(m);
  body.scrollTop = body.scrollHeight;
}
function openChat() {
  document.body.classList.add("chat-open");
  $("#chat").setAttribute("aria-hidden", "false");
  if (!greeted) {
    greeted = true;
    setTimeout(() => addMsg(data.chatbot.greeting, "bot"), 250);
    suggest.innerHTML = data.chatbot.suggestions.map((s) => `<button type="button">${esc(s)}</button>`).join("");
  }
  setTimeout(() => input.focus(), 400);
}
function closeChat() {
  document.body.classList.remove("chat-open");
  $("#chat").setAttribute("aria-hidden", "true");
}
$$("[data-open-chat]").forEach((b) => b.addEventListener("click", openChat));
$(".chat-close").addEventListener("click", closeChat);
addEventListener("keydown", (e) => e.key === "Escape" && closeChat());
suggest.addEventListener("click", (e) => e.target.tagName === "BUTTON" && send(e.target.textContent));

// Simple built-in answers, used when the AI server isn't available (e.g. local preview)
function localAnswer(q) {
  q = q.toLowerCase();
  const allSkills = data.skills.flatMap((s) => s.items).join(", ");
  if (/contact|email|reach|hire|linkedin|github|talk/.test(q))
    return `Use the contact form on this page or email ${data.email} — we usually reply within 24 hours.`;
  if (/my (web|site|project)|build (my|a|me)|can (you|he)|work with|price|cost|service|quote/.test(q))
    return `Yes! ${data.company} builds AI-powered websites, chatbots and brand identities. Tell us about your project in the contact form and we'll get back to you.`;
  if (/founder|who (is|runs|started)|farhan|owner/.test(q))
    return `${data.company} was founded by ${data.name}, ${data.role}. He's from Bangladesh, based in Lithuania, and studies Programming & Multimedia.`;
  if (/name|taryx mean|why taryx/.test(q)) return data.companyStory;
  if (/what is|about|taryx|company|studio/.test(q))
    return `${data.company} is a studio that designs premium websites with built-in AI — plus chatbots, agents and brand identities. ${data.tagline}`;
  if (/skill|know|tool|tech|stack/.test(q)) return `We work with: ${allSkills}.`;
  if (/project|work|portfolio|demo/.test(q)) return `Our work: ${data.projects.map((p) => `${p.title} (${p.category})`).join("; ")}. Open any project to see its case study and live demo.`;
  if (/where|location|based|country/.test(q)) return `${data.company} is based in ${data.location} and works with clients worldwide.`;
  return `${data.company} designs premium websites with built-in AI that works around the clock. Ask me about our projects, our founder, or how to start a project!`;
}

async function send(text) {
  text = text.trim();
  if (!text || busy) return;
  busy = true;
  form.querySelector("button").disabled = true;
  input.value = "";
  addMsg(text, "me");
  history.push({ role: "user", text });

  const typing = document.createElement("div");
  typing.className = "msg bot typing";
  typing.innerHTML = "<i></i><i></i><i></i>";
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;

  let reply;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10) }),
    });
    if (!res.ok) throw new Error(res.status);
    reply = (await res.json()).reply;
    if (!reply) throw new Error("empty");
  } catch {
    reply = localAnswer(text);
  }
  typing.remove();
  addMsg(reply, "bot");
  history.push({ role: "model", text: reply });
  busy = false;
  form.querySelector("button").disabled = false;
  input.focus();
}
form.addEventListener("submit", (e) => (e.preventDefault(), send(input.value)));
