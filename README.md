# Suvara — prototype

A React + Vite version of the Suvara breathing/meditation app prototype. This replaces the earlier single-file HTML version with a real, editable project — proper component file, real image/audio asset files (not embedded as base64), and a normal build pipeline.

## Run it locally in VS Code

1. Open this folder in VS Code (`File → Open Folder…`).
2. Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``) and run:
   ```
   npm install
   npm run dev
   ```
3. Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser — resize the window narrow, or open your browser's device toolbar, to preview it as a phone.

Any edit you save in `src/App.jsx` or `src/App.css` reloads instantly in the browser.

## Project structure

```
suvara-app/
├── index.html              — page shell, mobile meta tags
├── src/
│   ├── main.jsx             — React entry point
│   ├── App.jsx              — the entire app (all screens/components)
│   ├── App.css              — all styling
│   └── assets/
│       ├── audio/           — temple bell sound
│       └── images/
│           ├── home/         — the 4 Home screen card photos
│           └── practice/     — the 4 practice-flow background photos
```

Everything currently lives in one `App.jsx` file (this matches the original prototype's structure). It's large but organized top-to-bottom by screen — worth splitting into separate component files under `src/components/` once you're past the review stage and into active development.

## Deploying to Vercel (so your boss can open a link on his phone)

**Easiest path — no GitHub required:**
1. In VS Code's terminal, run:
   ```
   npx vercel
   ```
2. It'll ask you to log in (opens a browser) and a few setup questions — accept the defaults (it auto-detects Vite).
3. It deploys and gives you a live URL like `https://suvara-xxxx.vercel.app`. Send that link directly — no download or file-opening confusion, works straight in his phone's browser.
4. For future updates, just run `npx vercel --prod` again after making changes.

**Alternative — via GitHub (better if you'll keep iterating with others):**
1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), "Add New Project," import that repo.
3. Vercel auto-detects the Vite settings — just click Deploy.
4. Every future `git push` automatically redeploys.

## Notes on the current state

- This is still a **prototype for review**, not the final native app. Once your boss approves the direction, the real build is a native Flutter (or React Native) app for the App Store/Play Store — this web version doesn't ship as-is to app stores.
- The mobile-first responsive behavior is already the default (full-bleed on phones, boxed preview only on wide desktop windows).
- Ambient tune, voice guidance, and haptics are all real working features, not mockups — test them on an actual phone, not just desktop, since mobile browsers handle audio permissions differently (see in-app Settings for the "Test" bell button if anything sounds off).

## Latest changes
- Welcome sound replaced with a soft synthesised "Sound of Home" (no audio file); the temple bell no longer plays on the welcome tap.
- Narration loads NENO clips from `src/assets/voice/neno/` (see its README); old Olin clips live in `olin-legacy/` as a stop-gap only.
- Posture selector (Padmasana / Sukhasana / Chair) removed; the nostril-hold explanation now sits on the "Before you begin" page.
- Reference photos go in `src/assets/images/reference/` (see its README).
