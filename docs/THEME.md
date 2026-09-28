# SkillLoop Theme Specification: "Toast Tales" Scrapbook Collage

This document defines the design tokens, visual primitives, typography, and accessibility guidelines for the SkillLoop Scrapbook Theme, adapted from the "Toast Tales" reference collage poster.

---

## 1. Color Palette

All colors are sampled from the reference poster and calibrated for **WCAG AA contrast (≥ 4.5:1)** against their respective surface backgrounds.

| Role | Color Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Page Background** | Crumpled Cream Paper | `#f1e4d3` | Applied globally on `body` with SVG noise texture and crease gradient |
| **Kraft Strips** | Torn Kraft Brown | `#c8a57e` | Top/bottom jagged header & footer banners, section dividers |
| **Kraft Shadow** | Deep Kraft Edge | `#b98f66` | Inner border / shadow accents on kraft banners |
| **Display Text** | Chunky Header Brown | `#7b4630` | Main display headings (`h1`, `h2`), hero titles |
| **Lead-in Text** | Slate Typewriter Gray | `#4b5560` | Spaced typewriter eyebrow titles, subtitles, date stamps |
| **Body Text** | Deep Sepia Ink | `#1e1b18` | Body text, table rows, form inputs (ensures 7:1+ contrast on cream) |
| **Note Card (Learn)** | Pale Sage / Gray-Green | `#e3e5df` | Cards/sections for skills to learn, requests, incoming items |
| **Note Card (Teach)** | Warm Peach Paper | `#f0d4b6` | Cards/sections for skills to teach, offers, outgoing items |
| **Note Card (Neutral)**| Fresh Cream Paper | `#faf6ee` | Neutral info cards, form containers, profile containers |
| **Receipt Paper** | Barcode White Note | `#f8f7f4` | Credit ledger, transaction receipts, balance display |
| **Gingham Patch** | Gingham Blue Accent | `#c6d6e6` | Crossed linear-gradient fabric patch behind hero elements |
| **Halftone Rays** | Sunburst Yellow Dots | `#e9c85c` | Radial gradient dot-matrix rays behind key CTA/hero stickers |
| **Sticker Yellow** | Star / Badge Yellow | `#facc15` | Compatibility % star sticker, highlight badges |
| **Status Emerald** | Stamp Ink Green | `#15803d` | Verified student seal, completed exchange badge |
| **Status Amber** | Stamp Ink Amber | `#b45309` | Pending request badge, in-progress exchange badge |
| **Washi Mauve** | Translucent Mauve Plaid | `rgba(202, 168, 185, 0.8)` | Washi tape pins across note tops |
| **Washi Sage** | Translucent Sage Plaid | `rgba(180, 196, 178, 0.8)` | Alternate washi tape pin |

---

## 2. Typography

Google Fonts loaded via `<link>` in `index.html`:

1. **Big Display Headings (`font-heading`)**:
   - **Font**: `'Bevan', cursive` (or `'Bree Serif', serif`)
   - **Color**: `#7b4630`
   - **Usage**: Hero headers, card titles, section headers (`h1`, `h2`, `h3`).
2. **Small Lead-In & Eyebrows (`font-lead`)**:
   - **Font**: `'Courier Prime', monospace`
   - **Color**: `#4b5560`
   - **Letter-spacing**: `0.08em`, uppercase or spaced lowercase.
3. **Body Text & Form Inputs (`font-mono` / `font-body`)**:
   - **Font**: `'Space Mono', monospace` (fallback: `'Courier Prime', monospace`)
   - **Color**: `#1e1b18`
   - **Size**: **16px minimum** on all body text and form inputs for crisp readability.
   - **Letter-spacing**: `0.015em` to `0.02em` (moderate, readable spacing).

---

## 3. UI Primitives & Scrapbook Components

### A. Background Paper Texture & Creases
- Global CSS on `body` combining:
  1. `background-color: #f1e4d3;`
  2. Data-URI SVG `feTurbulence` noise filter for realistic paper grain.
  3. Layered soft linear gradients simulating folded paper creases.

### B. Jagged Torn Kraft Strips (`TornBanner` / `TornEdge`)
Predefined SVG / CSS `clip-path` polygons applied to top and bottom kraft banners:
```css
/* Jagged top tear */
clip-path: polygon(0% 12px, 4% 0px, 9% 14px, 15% 3px, 21% 12px, 27% 1px, 33% 15px, 39% 4px, 45% 12px, 52% 0px, 58% 14px, 64% 2px, 70% 13px, 76% 1px, 82% 15px, 88% 4px, 94% 12px, 100% 0px, 100% 100%, 0% 100%);

/* Jagged bottom tear */
clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 12px), 95% 100%, 89% calc(100% - 14px), 83% calc(100% - 3px), 77% 100%, 71% calc(100% - 15px), 65% calc(100% - 2px), 59% 100%, 53% calc(100% - 13px), 47% 100%, 41% calc(100% - 14px), 35% calc(100% - 3px), 29% 100%, 23% calc(100% - 15px), 17% calc(100% - 2px), 11% 100%, 5% calc(100% - 13px), 0% 100%);
```

### C. Note Cards (`TornNoteCard`)
- **Variant Peach (`#f0d4b6`)**: Used for "Teaching / Offering" skills and requests.
- **Variant Sage (`#e3e5df`)**: Used for "Learning / Wanting" skills and requests.
- **Variant Neutral (`#faf6ee`)**: General cards and info blocks.
- **Paper Shadow**: `box-shadow: 2px 4px 12px rgba(90, 70, 50, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);`

### D. Washi Tape (`WashiTape`)
- Semi-transparent strips with jagged edges at 15° and repeating linear-gradient plaid patterns.
- Positioned across the top/corners of cards.

### E. Binder Clip (`BinderClip`)
- Inline SVG vintage bronze/metal binder clip placed at the top edge of cards.

### F. Receipt Paper with Barcode (`ReceiptCard`)
- Textured `#f8f7f4` paper note with zigzag perforated bottom edge (`repeating-linear-gradient` triangles or serrated clip-path) and CSS/SVG barcode stripe for credit balance and transaction logs.

### G. Avatar Polaroid Frame (`PolaroidFrame`)
- White photo frame with thick bottom margin, soft drop shadow, subtle tilt (`rotate-1` or `-rotate-1`), and washi tape sticker at the top.

### H. Sticker Badges & Hand-Drawn Doodles (Inline SVG)
All with white cut-out border (`filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15))`) and dark ink outlines:
1. **Smiley Sticker**: Two dots, wide grin, circular paper cutout.
2. **Star Match Sticker**: 5-point yellow star with compatibility % in center.
3. **Speech Bubble Sticker**: Torn-note speech bubble for match reason text.
4. **Lightbulb Sticker**: Hand-drawn bulb for ideas/skills.
5. **Pencil & Book Stickers**: For learning/teaching.
6. **Laptop Sticker**: For coding and tech exchanges.
7. **Bunny / Cat Doodle**: Playful corner doodle accent (matching the bunny in the reference poster).

---

## 4. Hard Constraints & Safety Rules

1. **Aria & Interaction Safety**:
   - Every tape, sticker, clip, doodle, halftone ray, and decorative overlay MUST have `aria-hidden="true"` and `pointer-events-none`.
   - Decorative elements MUST never obscure buttons, links, inputs, or interactive labels.
2. **Deterministic Layout (No Render Jitter)**:
   - All rotations use fixed Tailwind utility classes: `-rotate-2`, `-rotate-1`, `rotate-1`, `rotate-2`.
   - Never use `Math.random()` or dynamic rotation inline styles.
3. **Zero Component Logic Changes**:
   - Component logic, state, props, API calls, routes, hooks, `AuthContext`, and backend models remain 100% untouched.
4. **Performance**:
   - Zero external raster images; SVG noise is loaded once on `body`.
   - Reusable clip-paths and pure CSS gradients.
