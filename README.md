# AcaVise v2 — Cinematic UI (live build)

Production build of the AcaVise academic intelligence platform.
**Source code lives on the `source` branch** (`~/acavise-v2` locally).

- React + Vite + TypeScript + Tailwind CSS + shadcn-style UI + lucide icons
- Fullscreen looping video hero, liquid-glass nav, Instrument Serif + Inter
- All v1 features ported: dashboard, academics, targets simulator, priority
  engine, weekly planner, AI assistant, settings, Supabase cross-device sync
- Same `localStorage` keys + same Supabase project — existing accounts and
  progress carry over untouched

## Develop

```bash
cd ~/acavise-v2
npm install
npm run dev      # local dev
npm run build    # outputs dist/
```

## Deploy

```bash
cd ~/acavise-v2 && npm run build
cd ~/acavise-website
git rm -rq --cached . ; rm -rf index.html assets logo.png
cp -r ~/acavise-v2/dist/* . && touch .nojekyll
git add -A && git commit -m "..." && git push
```

Live: http://deep-end.me/acavise/
