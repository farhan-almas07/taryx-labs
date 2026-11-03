# Taryx Labs — Website

## Edit your website (admin panel)
Open **https://your-site.com/admin** → "Login with GitHub" → edit anything → **Publish**.
The live site updates automatically about 1 minute later.
- Projects: add / reorder / delete, upload screenshots, write the case study
- Hero text, services, pricing, founder info, photos, skills, links, AI assistant

### One-time admin setup (after the site is on GitHub + Vercel)
1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App
   - Homepage URL: `https://your-site.com`
   - Authorization callback URL: `https://your-site.com/api/callback`
2. Copy the **Client ID**, click "Generate a new client secret" and copy it.
3. Vercel → your project → Settings → **Environment Variables**: add
   `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, then Redeploy.
4. In `admin/config.yml`, set `repo:` to `your-github-username/your-repo-name`
   and `base_url:` / `site_url:` to your site address.
Only people with write access to your GitHub repository can log in.


## Add your own project
1. Put a screenshot in `assets/projects/` (e.g. `assets/projects/my-app.png`) — optional.
2. Open **site-data.json**, find `projects: [`, copy one `{ ... }` block and paste it at the top of the list.
3. Change the title, status, description, tags, `demo` link, `code` (GitHub) link and `image`.
4. Save → push to GitHub → Vercel updates the live site automatically. The AI chatbot learns it too.

## Demo projects (in /projects)
- **real-estate/** — Aurelia Estates: filters, viewing booking, AI property assistant (listings in `listings.js`)
- **caption-generator/** — CaptionCraft: AI captions + hashtags with phone preview
- **brand-kit/** — BrandKit AI: AI palette, fonts, tagline + live website preview
All AI features use your one Gemini key. Without a key they still work with built-in sample answers.

## Update your website
Edit **site-data.json** only. Add skills, projects or services there — the site and chatbot update automatically.
- Turn on the services section: set `showServices: true`
- Add your Fiverr link: `links.fiverr`

## Put it online (free)
1. Upload this folder to a new GitHub repository.
2. Go to vercel.com → sign in with GitHub → **Add New Project** → pick the repo → Deploy.
3. Get a free Gemini key at https://aistudio.google.com/apikey
4. In Vercel → Project → Settings → **Environment Variables**, add `GEMINI_API_KEY` = your key. Redeploy.

Never put the API key in site-data.json or any file you upload to GitHub.

Without a key (or when previewing locally) the chatbot still works with simple built-in answers.


## 3D intro
`intro3d.js` runs the opening animation (galaxy → your name → particle sphere) with Three.js.
- Change the word: edit `const WORD = "FARHAN";`
- Visitors can click, scroll or press a key to speed it up.
- If 3D isn't supported (or the visitor prefers reduced motion), the site just opens normally.

## Contact form (make messages arrive in your inbox)
1. Go to https://web3forms.com → "Create your Access Key" → enter your email.
2. They email you a key. Paste it into **site-data.json** → `contactFormKey: "your-key"`.
3. Done — every message from the form arrives in your inbox (free, 250/month).
Until a key is added, the form opens a ready-to-send Gmail message, so it always works.

## Case study pages
Each project in `site-data.json` gets its own page automatically: `case.html?p=<slug>`.
Fill in the `case` section (challenge, solution, features, results) for your own projects.
