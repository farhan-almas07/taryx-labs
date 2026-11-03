// Chatbots: the portfolio assistant ("portfolio") and the real estate demo ("realestate").
// Needs GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables.
import { readFileSync } from "node:fs";
import { join } from "node:path";
// site content (same file the /admin panel edits)
const data = JSON.parse(readFileSync(join(process.cwd(), "site-data.json"), "utf8"));
import { listings, agency } from "../projects/real-estate/listings.js";
import { askGemini, toContents } from "./_gemini.js";

function portfolioPrompt() {
  return `You are the friendly AI assistant on the website of ${data.company}, a studio founded by ${data.name} (${data.role}).
Answer visitors' questions about ${data.company} and its founder in a warm, confident, professional tone. Use "we" for the studio. Keep answers short (1–4 sentences).
If a visitor wants a website, chatbot or brand, be encouraging and invite them to use the contact form on the page or email ${data.email}.
Only use the facts below. If you don't know something, say so and suggest the contact form.
Never invent projects, clients, prices, team members or skill levels. Don't help with unrelated tasks; gently steer back to ${data.company}.

FACTS
Company: ${data.company} — ${data.tagline}
Name meaning: ${data.companyStory}
Founder: ${data.name}, ${data.role} (${data.title})
Location: ${data.location}
About: ${data.story.join(" ")}
Quick facts: ${data.facts.map((f) => `${f.label}: ${f.value}`).join("; ")}
What we offer: ${data.offerings.map((o) => `${o.title} — ${o.text}`).join("; ")}
Skills: ${data.skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join("; ")}
Work process: ${data.process.map((p, i) => `${i + 1}. ${p.title} — ${p.text}`).join(" ")}
Journey: ${data.journey.map((j) => `${j.tag}: ${j.title} — ${j.text}`).join("; ")}
Projects: ${data.projects.map((p) => `${p.title} (${p.category}) [${p.status}] — ${p.description}`).join("; ")}
${data.showServices ? `Services: ${data.services.map((s) => `${s.name} ${s.price} — ${s.description}`).join("; ")}` : "Pricing: depends on the project; visitors can use the contact form to get a quote."}
Contact: contact form on the site, email ${data.email}, GitHub ${data.links.github}, LinkedIn ${data.links.linkedin}${data.links.fiverr ? `, Fiverr ${data.links.fiverr}` : ""}
${data.chatbot.extraInfo ? `Extra: ${data.chatbot.extraInfo}` : ""}`;
}

function realEstatePrompt() {
  return `You are the AI assistant for ${agency.name}, a real estate agency in ${agency.city} (this is a demo website).
Help visitors find a property from the listings below. Be warm and concise (1–4 sentences).
Mention property names and prices exactly as listed. Never invent properties or prices.
If someone wants a viewing, tell them to press "Book a viewing" on the property card.
Office hours: ${agency.hours}. Phone: ${agency.phone}.

LISTINGS
${listings.map((l) => `- ${l.title} (${l.type}, ${l.area}): ${l.beds} bed, ${l.baths} bath, ${l.size} m², ${l.deal === "rent" ? `€${l.price}/month` : `€${l.price.toLocaleString("en-US")}`}. ${l.note}`).join("\n")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const contents = toContents(req.body?.messages);
  if (!contents) return res.status(400).json({ error: "No question" });
  const system = req.body?.bot === "realestate" ? realEstatePrompt() : portfolioPrompt();
  try {
    const reply = await askGemini({ system, contents, temperature: 0.6 });
    return res.status(200).json({ reply: reply || "Sorry, I couldn't answer that. Try asking another way!" });
  } catch (e) {
    return res.status(e.status || 502).json({ error: e.message });
  }
}
