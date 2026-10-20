<div align="center">

# ⌨️ Keyboard, Mouse &amp; Gamepad Tester

### Test every key, mouse button, scroll wheel and gamepad — right in your browser.

[![Stars](https://img.shields.io/github/stars/lulabaimanis-cpu/keyboard-mouse-tester-webApp?style=for-the-badge&color=d946ef)](https://github.com/lulabaimanis-cpu/keyboard-mouse-tester-webApp/stargazers)
&nbsp;
[![Forks](https://img.shields.io/github/forks/lulabaimanis-cpu/keyboard-mouse-tester-webApp?style=for-the-badge&color=6366f1)](https://github.com/lulabaimanis-cpu/keyboard-mouse-tester-webApp/network/members)
&nbsp;
[![License: MIT](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)

<br />

![Keyboard, Mouse & Gamepad Tester — main screen](img/screenshot.png)

</div>

---

## 🌟 What's New in v2.3

This enhanced release introduces comprehensive hardware diagnostics, multi-layout support, and UI refinements:

- 🌓 **Dark & Light Mode**: Seamless theme switcher (*Dark Midnight* & *Light Porcelain*) adhering to WCAG AA contrast standards with system preference auto-detection.
- 📐 **Streamlined & Spacious GUI**: Compact statistics and readout cards providing maximum vertical breathing room for keyboard visualization.
- ⌨️ **Multi-Layout Selector**:
  - **ANSI (US)** — Standard 104-key layout.
  - **ISO (UK/EU)** — 105-key layout featuring vertical ISO Enter and left backslash (`IntlBackslash`).
  - **Laptop (75% Compact)** — Space-efficient laptop form factor with tucked arrow clusters and dedicated hardware `Fn` keycap.
- 💻 **Laptop `Fn` Key & Multimedia Combo Detection**: Detects hardware-level Fn combos (`VolumeUp`, `MediaTrackNext`, `Brightness`, etc.) and enables manual on-screen tapping.
- ⚠️ **Key Jam (Macet) & Switch Chatter (Bounce) Detection**:
  - **Jammed Key Detection**: Keys held down continuously for >1.5s or repeating $\ge$10 times pulse amber (`.is-jammed`) with a diagnostic badge.
  - **Switch Chatter Detection**: Keypresses registered within $<35$ms of release flag mechanical switch contact bounce (`.is-chatter`).
- 🧹 **Clear Keys & Unstick Keys**:
  - **Clear Keys**: Instantly clears marked/tested keys to start a fresh test without wiping mouse or gamepad stats.
  - **Unstick Keys (Esc x2)**: Releases visually held keys or clears focus issues.
- 🪟 **Windows Key Auto-Release Safety**: Automatically releases the active press state of `MetaLeft`/`MetaRight` after 180ms so opening the Windows Start Menu never leaves the key stuck glowing.
- 🛡️ **Session & Navigation Protection**:
  - Browser shortcut & function key intercept (`F1`–`F12`, `Ctrl+R`, etc.) with `beforeunload` warning when tests are in progress.
  - Mouse back/forward button navigation interception (`auxclick`) preventing accidental browser back history.
- ⚡ **Built-in Zero-Dependency Server**: Added `node server.js` for instant local testing without needing Python or external npm packages.

---

## ✨ Features

- ⌨️ **Full Keyboard Tester** — Identified by the modern [`KeyboardEvent.code`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code) API so left/right modifiers, numpad, and locale-specific keys are accurately separated.
- 💡 **Dead-Key Detection** — Pressed keys glow; once tested they stay marked, allowing you to quickly spot unresponsive keys.
- 🖱️ **Mouse Tester** — Left / middle / right + back/forward buttons, scroll up/down, live cursor position, movement deltas, and double-click detection.
- 🎮 **Gamepad Tester** — Buttons, triggers, and analog sticks via the [Gamepad API](https://developer.mozilla.org/docs/Web/API/Gamepad_API) with power-saving lifecycle polling.
- 📊 **Live Stats** — Total presses, unique keys, most-pressed key, and dynamic keyboard coverage tracking.
- 🔊 **Sound + 📳 Haptics** — Optional click sound feedback and mobile vibration (remembered in `localStorage`).
- 📱 **Responsive & Touch-Friendly** — Tap on-screen keys on touchscreens; scales dynamically with `ResizeObserver`.
- ⚡ **Zero Dependencies, Offline-Ready** — Pure vanilla HTML/CSS/JS. Installable PWA with offline caching (`sw.js`).
- 🔒 **100% Private** — Runs entirely client-side inside your browser. No telemetry, no trackers, no external analytics.

---

## 🚀 Live demo

**→ (https://keyboardtest.unixkomputer.com/)**

> Tip: some keys (Win/Meta, PrtSc, certain F-keys) may be intercepted by your OS or browser before
> the page can see them — that's expected behavior, not a dead key.

---

## 🛠️ Project Structure

A clean, **zero-build static architecture**:

```
index.html              # Modern, compact UI markup with theme & layout toggles
css/style.css           # CSS design tokens (dark/light themes, compact stats, animations)
js/keymaps.js           # Layout matrices (ANSI 104, ISO 105, Laptop 75%) and key mapping
js/app.js               # Diagnostics (jam, chatter), keyboard, mouse, gamepad, stats & PWA
server.js               # Lightweight zero-dependency Node.js HTTP server
sw.js                   # Service Worker (offline cache kmt-v2.3.0)
manifest.webmanifest    # PWA configuration
favicon.svg             # Vector application icon
```

---

## 💻 Run Locally

Because there is zero build step, you can open `index.html` directly in any web browser.

To test Service Worker caching and PWA installation locally, run the built-in HTTP server:

```bash
# Using Node.js (recommended, zero-install)
node server.js
```

Or using any static HTTP server:

```bash
# Python 3
python -m http.server 8080

# …or npx serve
npx serve .
```

Open `http://localhost:8080` in your browser.

---

## ☁️ Deployment

This project requires **no build step** and can be deployed directly to any static web host:

- **Vercel / Netlify / Cloudflare Pages:** Connect repository, leave build command empty, publish directory `/` (root).
- **GitHub Pages:** Go to **Settings → Pages → Deploy from a branch**, select branch `main`, and folder `/ (root)`.

---

## 💜 Hall of Thanks

Original project created with love by [@shawon9324](https://github.com/shawon9324). Dedicated to everyone who starred and forked the project.

**⭐ Stargazers & Contributors**

[@mt190502](https://github.com/mt190502) · [@kukisama](https://github.com/kukisama) · [@pkl1024](https://github.com/pkl1024) · [@GalaxySnail](https://github.com/GalaxySnail) · [@SleepyBoy29](https://github.com/SleepyBoy29) · [@adinata-id](https://github.com/adinata-id) · [@shishirong](https://github.com/shishirong) · [@Gh0st-0](https://github.com/Gh0st-0) · [@iqiancheng](https://github.com/iqiancheng) · [@its-arthur](https://github.com/its-arthur) · [@VoidDeficit](https://github.com/VoidDeficit) · [@zeta667](https://github.com/zeta667) · [@eed-cn](https://github.com/eed-cn) · [@bartman](https://github.com/bartman) · [@KissuChaudhary](https://github.com/KissuChaudhary) · [@sumn255](https://github.com/sumn255) · [@amanxsyed](https://github.com/amanxsyed) · [@Nubidubi23](https://github.com/Nubidubi23) · [@Suraj-011](https://github.com/Suraj-011) · [@ADeeeee](https://github.com/ADeeeee) · [@Sxifn](https://github.com/Sxifn) · [@hwbest](https://github.com/hwbest) · [@leilatown6](https://github.com/leilatown6) · [@techmech-keeb](https://github.com/techmech-keeb) · [@jk2K](https://github.com/jk2K) · [@binarytree](https://github.com/binarytree) · [@clach04](https://github.com/clach04) · [@ls120](https://github.com/ls120)

---

## 📜 License

[MIT](LICENSE) © [Md. Shahriar Karim Shawon (@shawon9324)](https://github.com/shawon9324) & Contributors.
