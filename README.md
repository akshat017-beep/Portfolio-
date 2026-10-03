# Akshat Dobhal — glass hero

One full-screen Next.js (App Router) hero: a pale-blue portrait that reveals an aligned liquid-glass anatomical layer through a soft cursor/touch mask.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build && npm start
```

Fonts (Albert Sans, Fragment Mono) are fetched by `next/font/google` at build time, so the first build needs internet access.

## Where to edit

- Copy, links, nav targets: top of `components/glass-hero.tsx`
- Reveal tuning: `DESKTOP_RADIUS`, `MOBILE_RADIUS`, `POSITION_FACTOR`, `RADIUS_FACTOR` in the same file
- Colours, layout, breakpoints, entrance motion: `app/globals.css`
- `Process` and `Experiments` nav links are placeholders (`#process`, `#experiments`)

## Structure

```
app/globals.css   app/layout.tsx   app/page.tsx
components/glass-hero.tsx
public/images/{Base,Reveal}_image_{desktop,mobile}.png
```
