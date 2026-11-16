---
name: Stars Wonder
description: A living star assembled from glowing particles, seen through an observatory eyepiece.
colors:
  ink: "#070709"
  ink-raised: "#0d0a0b"
  paper: "#efe4d2"
  muted: "#b3a591"
  faint: "#8c7f6c"
  brass: "#c19a69"
  brass-hair: "rgba(193, 154, 105, 0.24)"
  amber: "#ffcf94"
  ember: "#ff8a45"
  champagne: "#ffe3c6"
  particle-core: "#fff4de"
  particle-gold: "#ffdfb2"
  particle-amber: "#ffbb7a"
  brass-deep: "#966c36"
  brass-light: "#f1d5a8"
  brass-edge: "rgba(255, 226, 188, 0.32)"
  brass-edge-hover: "rgba(255, 226, 188, 0.5)"
  vignette: "rgba(0, 0, 0, 0.55)"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.9rem, 4.7vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 300
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.15em"
  readout:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  value:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  aside:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 300
    lineHeight: 1.62
    letterSpacing: "0em"
  hint:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.05em"
  display-mobile:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.35rem, 9.5vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.02em"
  display-compact:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2rem, 8.5vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.02em"
  display-mid:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.4rem, 4vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.02em"
rounded:
  none: "0"
  field: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "44px"
components:
  field:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.field}"
    size: "min(70dvh, 48vw, 46rem)"
  release-button:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "3.35rem"
    width: "100%"
  release-button-active:
    backgroundColor: "transparent"
    textColor: "{colors.ember}"
  range-thumb:
    backgroundColor: "{colors.brass}"
    rounded: "{rounded.field}"
    size: "1rem"
---

# Design System: Stars Wonder

## Overview

**Creative North Star: "The Observatory Eyepiece"**

The page is one turn at a public observatory. The star is not a poster; it is what sits in the eyepiece when the instrument is pointed and the visitor finally holds still. Everything around it belongs to the instrument: a knurled brass bezel, a measured scale, a placard set in two voices, and three controls that a hand would find in the dark.

The scene is a dark room at night, so the ground is near-black rather than slate. The only strong light is the body itself, a champagne-and-gold particle volume with a cream core and an ember edge. Interface ink is warm ivory, never pure white; brass is the metal, amber is attention, and ember appears only when the body is released. Depth comes from one recessed circular field and hairline rules, not from cards, glass, or elevation.

The piece is quiet at rest and authored in motion: the body assembles once, breathes, drifts, notices the cursor, and can be let go and called back. Nothing on the page claims a real observation.

**Key Characteristics:**
- A single circular field is the hero; the UI is its collar.
- Champagne light against near-black ink, with brass as the only metal.
- Bodoni Moda display, Archivo instrument voice, tabular numerals.
- Square controls, hairline rules, one circular exception.
- One authored reform moment; the rest is slow drift.

## Colors

A warm, dark palette: one luminous family (champagne to ember) and one metal (brass), held by tinted ivories on near-black.

### Primary
- **Champagne Light** (`#ffe3c6`): the body's glow and the title's second word. Never used for body copy.
- **Particle Gold** (`#ffdfb2`): the surface particles. Rendered in linear space, so treat the hex as the source tone.
- **Amber** (`#ffcf94`): attention, the focused thumb, the italic word. The only accent that travels across chrome and scene.

### Secondary
- **Ember** (`#ff8a45`): the released state only. The Recollect label and its border. It does not appear in the resting page.

### Neutral
- **Ink** (`#070709`): the page ground.
- **Ink Raised** (`#0d0a0b`): the warm centre of the page's ambient gradient.
- **Ivory Paper** (`#efe4d2`): primary text.
- **Muted Stone** (`#b3a591`): secondary copy and control labels.
- **Faint Brass** (`#8c7f6c`): micro labels, the note, and the instrument meta.
- **Brass Hairline** (`rgba(193,154,105,0.24)`): every rule and button border.

**The One Light Rule.** The brightest element is always the star. Interface text never exceeds the luminance of the body's midtone, and no chrome gets a glow.

**The Ember Exception Rule.** Ember is spent only on the released state. If it appears anywhere else, the state language collapses.

## Typography

**Display Font:** Bodoni Moda (with Georgia, serif)
**Body Font:** Archivo (with system-ui, sans-serif)
**Label Font:** Archivo, tracked caps

**Character:** An engraved celestial atlas meets a laboratory placard. The display face gives the piece a name and a date; the grotesque gives the instrument a voice that can be read at arm's length. Numerals are tabular so the readout never trembles.

### Hierarchy
- **Display** (400, `clamp(2.9rem, 4.7vw, 4.6rem)`, 0.94): The piece's name only. Roman, with one italic word.
- **Body** (300, 0.95rem, 1.55): The one-line promise and the quiet aside. Maximum 38ch.
- **Readout** (400, 0.82rem, 1): Live values, tabular numerals, aligned right in controls.
- **Label** (500, 0.7rem, 0.15–0.22em, uppercase): Section names, control names, button verbs, states. Never below 0.7rem.

**The Two Voices Rule.** Bodoni never sets a control label and Archivo never sets the title. The only crossing is the italic display word, which is a name, not a label.

## Layout

A two-column grid on desktop: a placard column of up to 30rem on the left, the field on the right, with the instrument anchored to the bottom left and one instruction line under the field. The field is a square capped at `min(70dvh, 48vw, 46rem)` and clipped to a circle. A page padding of 1.5–4.5rem and a 2–5.5rem column gap keep the air generous.

Below 56rem the grid becomes a single column: masthead, field, hint, instrument. At 40–56rem the column is capped at 34rem and centred; the field is 80% of that column up to 42dvh. At 390px the field is 80vw / 36dvh. On short screens (max 44rem) the lede, aside, and note step out so the field and all three controls stay above the fold. The desktop page never scrolls; the phone page fits its viewport exactly at 1440×900, 390×844, 390×667, 768×1024, and 820×1180.

The vertical rhythm is: name, one line, a wide quiet gap, a small aside with a rule, then the instrument. The gap is intentional; the eye should cross it to the star.

## Elevation & Depth

No elevation system. Depth is one recessed circle: a hairline brass edge, a 7px faint outer ring, a deep inner shadow that darkens the last 74px, and a soft black drop shadow. There are no raised cards, no glass, no blurred panels. The only light is emissive, not a shadow.

### Shadow Vocabulary
- **Field recess** (`inset 0 0 74px 28px rgba(0,0,0,0.94), inset 0 0 16px 3px rgba(0,0,0,0.8)`): the eyepiece wall.
- **Page lift** (`0 2rem 5rem -3rem rgba(0,0,0,0.9)`): separates the dark circle from the dark page without a glow.
- **Thumb seat** (`0 1px 2px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.45)`): keeps the brass knob grounded on its track.

**The No Glow Chrome Rule.** Emissive bloom belongs to the particles. Chrome gets hairlines and neutral shadows only; a colored halo on a control is a bug.

## Shapes

Squares and full circles, nothing in between. The field and the range thumb are the only circles; every panel, button, and rule is square. Borders are 1px and brass-tinted at 24% opacity. The bezel scale is a repeat of 0.5° ticks at 6° intervals, drawn as a conic gradient and masked to a 4px ring.

**The One Circle Rule.** A second circle anywhere in the chrome competes with the eyepiece. Do not round buttons, inputs, or panels.

## Components

### The Field
- **Shape:** a 1:1 circle clipped from a square, with a 1px brass edge, a 4px tick bezel, and a deep inner recess.
- **Contents:** the WebGL canvas; a warm radial haze; no caption inside.
- **States:** grab cursor at rest, grabbing while dragging, 1px amber outline at 8px offset on keyboard focus.
- **Behavior:** drag and arrow keys orbit; wheel and plus/minus approach.

### Instrument
- **Shape:** a left-aligned stack, max 27rem, square.
- **Header:** “Instrument” in brass tracked caps, “No. 01” in faint brass, divided by a hairline.
- **Readout:** three equal columns; label above value; tabular numerals; no boxes. The field value is the camera's true 36° field.
- **Controls:** a 3-column row (label, 1px brass track with a knurled brass thumb, value). The track fills amber to the left of the thumb. Values are `68` and `1.020°/s`, always tabular.

### Release Button
- **Shape:** full width, 3.35rem tall, 1px brass-hair border, square.
- **Rest:** transparent, ivory label left, faint state right.
- **Hover:** border rises to 50% brass, 5% brass wash inside.
- **Active / released:** ember label and state, ember-tinted border at 38%.
- **Focus:** 1px amber outline at 3px offset.

**The Named State Rule.** The button always names the next action (Release / Recollect) and the right side always names the current body (assembled / dispersed). No icon, no ellipsis, no spinner.

## Do's and Don'ts

### Do:
- **Do** keep the star the brightest thing; interface luminance stays below its midtone.
- **Do** use tabular numerals for every live value.
- **Do** keep functional text at 0.7rem (11.2px) or larger.
- **Do** keep the field's bezel scale and the instrument's readout honest to real state.
- **Do** respect `prefers-reduced-motion`: no intro assembly, no auto-orbit, a quarter of the twinkle.

### Don't:
- **Don't** put the controls in a card, a glass panel, or a rounded container.
- **Don't** add a colored glow to a control, a border, or text.
- **Don't** use ember outside the released state.
- **Don't** use a second circular container or pill; the eyepiece is the only circle.
- **Don't** claim a real object, coordinates, or data; the note says the field is composed.
