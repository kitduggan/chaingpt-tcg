# ChainGPT TCG — Full Build Brief

> A complete record of what was built, every major decision, the design thinking, and the current state of the project. Written to give maximum context to anyone (or any AI) picking this up fresh.

---

## What Is This?

**ChainGPT TCG** is a free onchain collectible card game built as a marketing/engagement product for the ChainGPT ecosystem. The concept: every 12 hours, users get a free pack to rip open. Inside are 3 cards pulled from a set of 20. The goal is to complete the full collection.

It's not a game with mechanics — it's a **collection experience**. The entire product is the *feeling* of opening a pack, seeing what you got, and wanting to come back for the next one. That emotional loop is the product.

The aesthetic is **cyberpunk pixel art meets Pokémon TCG energy** — dark neon backgrounds, glowing card borders, holographic effects, pixel fonts, and satisfying animations. Everything is designed to feel premium and tactile despite being a web app.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Animations:** Framer Motion throughout — variants, AnimatePresence, spring physics, custom props
- **Styling:** Tailwind CSS + inline styles for dynamic values (glow colors, clip paths)
- **Fonts:** Press Start 2P (pixel font for headings/labels) + Inter (body/UI text)
- **State:** React `useState` / `useEffect` — no external state library needed yet
- **Wallet:** Mock `useWallet()` hook wired up — ready to swap in wagmi + RainbowKit for real Web3

---

## The Card Set (20 Cards Total)

### Structure
The full set has three tiers:

| Tier | Count | Color | Who |
|------|-------|-------|-----|
| Common | 15 | Cyan `#00f5ff` | Mr. Robotson variants + AI tool cards |
| Rare | 4 | Magenta `#ff00ff` | ChainGPT team members |
| Mythic | 1 | Gold `#f59e0b` | Golden Mr. Robotson |

### Commons (15 cards)
Split into two sub-types:
- **Character Commons (5):** Different versions of Mr. Robotson — the mascot character. Pool toy, startup incubator, launchpad master, AI maximalist, glow in the dark.
- **Product Commons (10):** Cards representing actual ChainGPT AI Hub tools — Smart Contract Generator, Cross-Chain Swap, AI Trading Assistant, Web3 Chatbot, etc. Max 1 per pack to prevent spam.

### Rares (4 cards)
Real ChainGPT team members as cards:
- **Ilan** — Founder
- **Gintare** — CEO, ChainGPT Pad
- **Jay** — CMO, AIVM
- **Ariel** — COO

These get holographic treatment — 3D tilt effect + gloss overlay on hover/drag.

### Mythic (1 card)
- **Golden Mr. Robotson** — "Mythic Rare. One of the rarest cards in existence."
Gets the full aura treatment: pulsing gold glow, floating sparkle particles, maximum drama.

---

## Pack Odds

Normal pack (3 cards):
- Mythic: **5%** per slot
- Rare: **18%** per slot (after mythic check)
- Product Common: conditional ~32% (max 1 per pack)
- Character Common: fallback

**God Pack: 3% chance** — replaces the normal 3-card pack entirely with 5 cards: all 4 Rares + the Mythic. Center slot is always the Mythic. This is the whale moment.

---

## Pages & Routes

### `/` — Landing Page
The main marketing/entry page. Structure top to bottom:
1. **Full-width hero logo** (logo-cropped.png with `mixBlendMode: screen` so the black bg disappears)
2. **RIP → REVEAL → COLLECT** — three-step value prop with animated arrows
3. **Three floating pack images** with subtle vertical float animation (looping, staggered)
4. **"CLICK & RIP!" CTA button** — pixel-art style with inset box-shadow 3D effect, press-down on mousedown
5. **Stats row** — Pack Timer (12 HRS), Total Cards (20), Cards Per Pack (3)
6. **Card rarities showcase** — three cards on display (Common/Mythic/Rare), slightly tilted, hover-liftable, click to lightbox
7. **Objective banner** — "COLLECT ALL 20 CARDS" with gradient background

### `/collection` — Card Collection
Shows the user's collected cards vs locked unknowns.
- **COLLECTED section:** Large grid (5 columns max), real card images with rarity glow, click to lightbox
- **NOT YET COLLECTED section:** Locked "?" placeholders at 40% opacity
- Progress bar at top showing completion %
- Mock data for now (hardcoded owned IDs)

### `/pack` — Legacy Pack Opening (not primary UX)
An older flip-card reveal flow. Still works but the Landing modal is the main experience now.

---

## The Pack Opening Modal — The Core Experience

This is the most complex and most important component. File: `components/PackModal.tsx`

### How It's Triggered
User clicks any of the three floating pack images on the landing page. At click time, we capture the pack's exact screen position via `getBoundingClientRect()` and pass it to the modal as `packOrigin: { x, y, scale }`. The modal uses this as its `initial` animation state, so it appears to fly from the pack's position to the center of the screen.

### Animation Stages
The modal moves through a state machine:

```
idle → ripping → [god-reveal] → revealed
```

- **idle:** Pack is centered, floating gently (y: 0 → -10 → 0, looping). "TAP TO OPEN" pulses below.
- **ripping:** User clicks the pack. Top piece flies off (translate + rotate + fade). Cards are being selected.
- **god-reveal:** (God Pack only, 2.3s) Full-screen dramatic overlay before cards appear.
- **revealed:** Three (or five) cards fan out from center.

### Pack Animation Details

**Lift-off (opening):**
The pack image appears to fly from its position on the landing page to the modal center. This works by:
1. Recording the pack's screen coordinates at click time
2. Passing them as `packOrigin` to the modal
3. Modal's `initial` variant sets `x, y, scale` to match the pack's position relative to viewport center
4. `animate` variant goes to `x:0, y:0, scale:1`
5. This creates the illusion of the landing pack flying up to the user

**Float animation:**
Once the pack arrives (`onAnimationComplete`), a `y: [0, -10, 0]` looping animation activates. Only runs while stage is `idle` — stops as soon as the user clicks.

**Rip:**
Two layered images of the same pack PNG, clipped:
- Bottom piece: `polygon(0% 7%, 100% 16%, 100% 100%, 0% 100%)` — stays in place
- Top piece: `polygon(0% 0%, 100% 0%, 100% 16%, 0% 7%)` — animates to `x:260, y:-90, rotate:28, opacity:0` with `transformOrigin: bottom right`
The diagonal cut gives a clean slice-rip feel. The top piece flies to the upper right as if torn away.

**Exit/dismiss:**
When user closes the modal (click backdrop or ESC), the pack exits toward roughly where it came from (55% of the original offset, scaled down, fades) giving a directional sense of return.

### Card Reveal

Three cards spring out from center:
```
positions: [-300x/-60y/-18°], [0/-90y/0°], [+300x/-60y/+18°]
```
Staggered by 120ms each, spring physics (`stiffness:160, damping:18`).

**Holographic effect on Rare/Mythic cards:**
- 3D tilt tracking mouse position (`rotateX`, `rotateY` up to ±11°)
- Radial gradient gloss overlay that follows the cursor
- Shine strip that moves with mouse angle
- Initial sheen sweep animation on reveal (CSS keyframe)

**Mythic card extras:**
Wrapped in `<MythicAura>` component:
- Pulsing box-shadow glow (`mythicPulse` keyframe)
- 10 flying sparkle particles radiating outward (CSS animation with `--tx`/`--ty` variables)

**God Pack card layout:**
5 cards, wider fan:
```
positions: [-360/-38/-22°], [-182/-62/-11°], [0/-78/0°], [+182/-62/+11°], [+360/-38/+22°]
```
Cards slightly smaller (`min(26vw, 158px)` vs `min(36vw, 220px)`) to fit all 5.

### God Pack Overlay
Full-screen dramatic moment between rip and reveal:
- Dark base layer
- Gold radial burst (scales up from center)
- Horizontal gold shimmer sweep (travels left to right)
- 16 gold/white sparkles radiating outward from screen center (looping)
- "GOD PACK!" in large pixel font with pulsing gold glow (`godGlow` keyframe)
- "LEGENDARY PULL" in gold shimmer gradient text
- "4 RARES + 1 MYTHIC" pill badge
- Overlay fades out as cards fan in simultaneously (z-index layered so they coexist briefly)

Key implementation note: sparkles are positioned as siblings to the text block (not inside it) so absolute positioning doesn't misalign the centered text.

---

## Navbar

Fixed top bar, dark background with cyan border bottom.
- Left: Logo (clickable, goes to `/`)
- Right: "View Cards" solid teal button → `/collection`, "Connect Wallet" button (mock)

Both buttons use the same solid teal style (`bg-[#00f5ff] text-black font-semibold`). When wallet is connected, Connect Wallet becomes a bordered cyan button showing the truncated address.

---

## Design System

### Color Palette
- Background: `#0a0a0f` (near-black with blue tint)
- Cyan: `#00f5ff` — primary, Common cards
- Magenta: `#ff00ff` — Rare cards, accents
- Gold: `#f59e0b` — Mythic, God Pack
- Green: `#00ff85` — success states, completion %
- Text: `#e2e8f0` body, `#9ca3af` muted

### Fonts
- `Press Start 2P` — all headings, labels, pixel UI elements
- `Inter` — body text, descriptions, subtitles

### Global Effects
- **CRT rainbow wash:** Moving diagonal gradient overlay covering the entire page at very low opacity — gives a subtle color-shift shimmer to everything
- **Grid background:** Canvas-based animated grid (separate component)
- **Neon text utilities:** `.neon-cyan`, `.neon-magenta`, `.neon-green` classes
- **Legendary shimmer:** `.legendary-shimmer` — animated gradient text for gold/mythic text
- **Card sheen:** `.card-sheen` — one-shot shine sweep on card reveal

### Card Visual System
Every card has a rarity-matched color applied to:
- Border color (at 60% opacity normally, 100% for Mythic)
- Box shadow glow
- Rarity label text + glow
- Holographic overlay tint (Rare/Mythic only)

---

## Key Problems Solved During Build

### Pack Lift-off Animation
**Problem:** Needed the modal pack to visually originate from whichever landing pack was clicked, not just appear in the center.
**Solution:** Capture `getBoundingClientRect()` at click time, compute offset from viewport center, pass as `packOrigin` to modal. Modal's Framer Motion `initial` variant uses these coordinates, `animate` goes to `0,0,1`. Net effect: pack appears to fly from landing position to center.

**Why not layoutId?** Tried first — caused a feedback loop where the landing pack becoming visible while the modal pack was exiting made both fight over the same shared layout element, oscillating back and forth. Real coordinates were simpler and more reliable.

### Hover Responsiveness
**Problem:** `whileHover` was slow to activate and slow to release, creating a sluggish feel.
**Root cause:** The outer motion.div handling entrance animations had its own `transition` config that was overriding the hover transition.
**Solution:** Wrap hover-able content in a dedicated inner `motion.div` with only `whileHover` and `transition={{ duration: 0.1, ease: 'easeOut' }}`. Separation of concerns — entrance animation on outer, hover on inner. Both directions (in + out) inherit the 100ms duration.

### God Pack Text Misalignment
**Problem:** "GOD PACK!" text was pushed off-center because sparkle particles were `position: absolute` inside the same `relative` container as the text, causing width calculation issues in some browsers.
**Solution:** Sparkles moved to be direct children of the full-screen overlay div, anchored via `top: 50%, left: 50%` to screen center. Text block is a completely separate sibling div centered by the flex parent.

---

## Current State (as of build)

### Working
- Full landing page with pack opening modal
- Pack rip animation (diagonal slice, top piece flies off)
- Card fan reveal with spring physics
- Holographic effect on Rare/Mythic cards
- Mythic aura (pulsing glow + sparkles)
- God Pack system (3% chance, 5 cards, full overlay)
- Collection page (mock owned cards, locked placeholders, lightbox)
- Navbar with wallet button (mock)
- Card lightbox on both landing and collection pages
- All 20 card images loaded

### Mock / Not Yet Wired
- Wallet connection (mock hook, ready for wagmi/RainbowKit)
- Pack cooldown timer (12hr logic not implemented — UI exists as static "12 HRS")
- Owned cards (hardcoded in Collection.tsx — needs real persistence/blockchain)
- Pack claiming (no backend — clicking always opens, no cooldown enforced)
- Onchain minting of pulled cards

### What Would Come Next
1. Real wallet integration (wagmi + RainbowKit)
2. Backend/smart contract for pack cooldown and card ownership
3. Actual owned state synced to wallet
4. Sound effects (hook comments already left in pack rip code: `// TODO: hook audio rip sound here`)
5. More card variants / future sets
6. Trading between wallets
7. Completion rewards (all 20 = special achievement)

---

## File Map

```
/app
  layout.tsx          — root layout, fonts, global providers
  page.tsx            — renders Landing
  globals.css         — design tokens, keyframe animations, utility classes
  /collection
    page.tsx          — renders Collection

/components
  Landing.tsx         — homepage: hero, packs, RIP/REVEAL/COLLECT, rarity showcase
  PackModal.tsx       — THE core experience: pack lift-off, rip, card reveal, God Pack
  Collection.tsx      — owned vs locked card grid
  Navbar.tsx          — fixed top nav
  WalletButton.tsx    — connect/disconnect wallet (mock)
  PackOpening.tsx     — legacy flip-card reveal (secondary route)
  Card.tsx            — reusable card component
  GridBackground.tsx  — animated canvas grid background

/lib
  cards.ts            — card data, rarity system, pack generation logic, God Pack
  wallet.ts           — mock wallet hook
```

---

## The Content Angle

The interesting story here isn't just "we built a card game." It's:

- **AI-assisted development at speed** — the entire UI, animation system, and game logic was built collaboratively with Claude Code, iterating in real-time
- **Every animation decision has a reason** — the lift-off uses real screen coordinates, the hover uses a dedicated inner wrapper, the God Pack text is separated from sparkles — there's engineering thinking behind every effect
- **The gap between "working" and "feeling good"** — a huge part of the work was refinement: hover too slow → 100ms, pack return looked weird → directional exit, text misaligned → DOM separation. The delta between functional and delightful
- **Designing for emotion** — the whole product is engineered around the 3 seconds between clicking a pack and seeing your cards. That moment has to feel earned and exciting

---

*Generated from the live codebase. Last updated during active development session.*
