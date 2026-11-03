// AI tools for the demo projects: "captions" (CaptionCraft) and "brandkit" (BrandKit AI).
import { askGemini, clean } from "./_gemini.js";

export const FONTS = ["Inter", "Poppins", "Playfair Display", "DM Serif Display", "Space Grotesk", "Montserrat", "Lora", "Sora", "Outfit", "Fraunces", "Manrope", "Bebas Neue"];
const HEX = /^#[0-9a-f]{6}$/i;

const tools = {
  captions(input) {
    const business = clean(input.business, 120), topic = clean(input.topic, 200);
    const tone = clean(input.tone, 30), platform = clean(input.platform, 30);
    if (!business || !topic) return null;
    return {
      system: `You write high-converting social media captions for small businesses. Reply with JSON only:
{"captions": [string, string, string], "hashtags": [8 strings without spaces, each starting with #]}
Each caption: 1–3 sentences, fits ${platform}, ${tone} tone, may use 1–2 fitting emojis, ends with a clear call to action.`,
      prompt: `Business: ${business}\nPost about: ${topic}`,
      check: (j) => Array.isArray(j.captions) && j.captions.length >= 1 && Array.isArray(j.hashtags),
      shape: (j) => ({ captions: j.captions.slice(0, 3).map((c) => clean(c, 400)), hashtags: j.hashtags.slice(0, 10).map((h) => clean(h, 40)) }),
    };
  },
  brandkit(input) {
    const name = clean(input.name, 40), about = clean(input.about, 240);
    const vibes = (Array.isArray(input.vibes) ? input.vibes : []).slice(0, 4).map((v) => clean(v, 20)).join(", ");
    if (!name || !about) return null;
    return {
      system: `You are a senior brand designer. Reply with JSON only:
{"palette":[{"name":string,"hex":"#RRGGBB","role":string} x5],"headingFont":string,"bodyFont":string,"tagline":string,"voice":[3 short adjectives],"logoIdea":string}
Pick fonts ONLY from: ${FONTS.join(", ")}. Palette: background, surface, primary, accent, text roles with good contrast. Tagline under 8 words.`,
      prompt: `Brand: ${name}\nWhat it does: ${about}\nVibe: ${vibes || "modern"}`,
      check: (j) => Array.isArray(j.palette) && j.palette.length >= 4 && j.palette.every((c) => HEX.test(c.hex)),
      shape: (j) => ({
        palette: j.palette.slice(0, 5).map((c) => ({ name: clean(c.name, 30), hex: c.hex.toUpperCase(), role: clean(c.role, 20) })),
        headingFont: FONTS.includes(j.headingFont) ? j.headingFont : "Space Grotesk",
        bodyFont: FONTS.includes(j.bodyFont) ? j.bodyFont : "Inter",
        tagline: clean(j.tagline, 80),
        voice: (Array.isArray(j.voice) ? j.voice : []).slice(0, 3).map((v) => clean(v, 20)),
        logoIdea: clean(j.logoIdea, 200),
      }),
    };
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const make = tools[req.body?.tool];
  const job = make && make(req.body?.input || {});
  if (!job) return res.status(400).json({ error: "Missing input" });
  try {
    const text = await askGemini({ system: job.system, contents: [{ role: "user", parts: [{ text: job.prompt }] }], json: true, temperature: 0.9 });
    const j = JSON.parse(text.replace(/^```(json)?|```$/g, ""));
    if (!job.check(j)) throw Object.assign(new Error("Bad AI response"), { status: 502 });
    return res.status(200).json(job.shape(j));
  } catch (e) {
    return res.status(e.status || 502).json({ error: e.message });
  }
}
