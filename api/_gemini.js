// Shared helper for talking to Google Gemini. Files starting with "_" are not public routes on Vercel.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

export async function askGemini({ system, contents, json = false, temperature = 0.7 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("Missing GEMINI_API_KEY"), { status: 500 });

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}) },
    }),
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(out.error?.message || "Gemini error"), { status: 502 });
  return (out.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
}

// Turn [{role, text}] from the browser into Gemini "contents", with size limits.
export function toContents(messages) {
  const list = (Array.isArray(messages) ? messages : []).slice(-10)
    .filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "model"))
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 1000) }] }));
  return list.length && list[list.length - 1].role === "user" ? list : null;
}

export const clean = (v, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
