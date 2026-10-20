/*
 * app.js — Keyboard, Mouse & Gamepad Tester v2.0
 * Plain, dependency-free vanilla JS. Depends only on keymaps.js (loaded first).
 */
'use strict';

(function () {
  /* ---------------- tiny DOM helpers ---------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k === 'style') node.style.cssText = v;
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
  }

  /* People who starred / forked, captured from the GitHub API at build time. */
  const STARGAZERS = [
    'mt190502', 'kukisama', 'pkl1024', 'GalaxySnail', 'SleepyBoy29', 'adinata-id',
    'shishirong', 'Gh0st-0', 'iqiancheng', 'its-arthur', 'VoidDeficit', 'zeta667',
    'eed-cn', 'bartman', 'KissuChaudhary', 'sumn255', 'amanxsyed', 'Nubidubi23',
    'Suraj-011', 'ADeeeee', 'Sxifn', 'hwbest', 'leilatown6', 'techmech-keeb',
    'jk2K', 'binarytree', 'clach04', 'ls120',
  ];
  const FORKERS = [
    'ls120', 'Sxifn', 'Suraj-011', 'HGRgamer', 'gwjwin', 'SnakeBonD',
    'its-arthur', 'panreyes', 'iqiancheng', 'Bestlaptop', 'pkl1024',
  ];

  /* ---------------- friendly key names ---------------- */
  function keyName(code, key) {
    if (KEY_NAMES[code]) return KEY_NAMES[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit\d$/.test(code)) return code.slice(5);
    if (/^Numpad\d$/.test(code)) return 'Numpad ' + code.slice(6);
    if (/^F\d{1,2}$/.test(code)) return code;
    return key || code || 'Unknown';
  }

  /* =================================================================
     Feedback — optional click sound + vibration, persisted to storage.
     ================================================================= */
  const Feedback = {
    sound: localStorage.getItem('kmt.sound') !== 'off',
    haptics: localStorage.getItem('kmt.haptics') !== 'off',
    ctx: null,

    _audio() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    click() {
      if (this.sound) {
        const ac = this._audio();
        if (ac) {
          const t = ac.currentTime;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520 + Math.random() * 220, t);
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.16, t + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
          osc.connect(gain).connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.08);
        }
      }
      if (this.haptics && navigator.vibrate) navigator.vibrate(12);
    },

    setSound(on) { this.sound = on; localStorage.setItem('kmt.sound', on ? 'on' : 'off'); },
    setHaptics(on) { this.haptics = on; localStorage.setItem('kmt.haptics', on ? 'on' : 'off'); },
  };

  /* =================================================================
     Stats — counts every input, tracks keyboard coverage.
     ================================================================= */
  const Stats = {
    total: 0,
    counts: new Map(),   // id -> count
    names: new Map(),    // id -> display name
    testedKb: new Set(), // keyboard codes that exist in the layout & were hit
    kbTotal: 0,          // number of testable keyboard keys

    els: {},
    init() {
      this.els = {
        last: $('#stat-last'), total: $('#stat-total'), unique: $('#stat-unique'),
        most: $('#stat-most'), coverage: $('#stat-coverage'), fill: $('#coverage-fill'),
      };
    },

    record(id, name, isKbCode) {
      this.total++;
      this.counts.set(id, (this.counts.get(id) || 0) + 1);
      this.names.set(id, name);
      if (isKbCode) this.testedKb.add(id.replace(/^kb:/, ''));
      this.render(name);
    },

    render(lastName) {
      const e = this.els;
      if (lastName != null) e.last.textContent = lastName;
      e.total.textContent = this.total;
      e.unique.textContent = this.counts.size;

      let topId = null, topN = 0;
      for (const [id, n] of this.counts) if (n > topN) { topN = n; topId = id; }
      e.most.textContent = topId ? `${this.names.get(topId)} ×${topN}` : '—';

      const pct = this.kbTotal ? Math.round((this.testedKb.size / this.kbTotal) * 100) : 0;
      e.coverage.textContent = pct + '%';
      e.fill.style.width = pct + '%';
    },

    reset() {
      this.total = 0;
      this.counts.clear();
      this.names.clear();
      this.testedKb.clear();
      this.els.last.textContent = '—';
      this.render(null);
      this.els.last.textContent = '—';
    },
  };

  /* =================================================================
     Keyboard tester
     ================================================================= */
  const Keyboard = {
    pressed: new Set(),
    layout: localStorage.getItem('kmt.layout') || 'ansi',
    holdTimers: new Map(),
    repeatCounts: new Map(),
    pressTimes: new Map(),
    lastReleaseTimes: new Map(),
    chattered: new Set(),
    jammed: new Set(),
    lastEscPress: 0,
    ro: null,

    PREVENT: new Set([
      'Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', 'Backspace', 'Quote', 'Slash',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'ContextMenu',
    ]),

    SHORTCUT_CODES: new Set([
      'KeyR', 'KeyS', 'KeyP', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyO', 'KeyU',
    ]),

    build() {
      this.buildMainRows();

      // ----- nav cluster rows -----
      const navRows = $('#kb-nav-rows');
      navRows.innerHTML = '';
      NAV_ROWS.forEach((row, i) => {
        const rowEl = el('div', { class: 'kb-nav-row' });
        row.forEach((def) => rowEl.append(this.cap(def, i === 0)));
        navRows.append(rowEl);
      });

      // ----- arrows -----
      const arrows = $('#kb-arrows');
      arrows.innerHTML = '';
      arrows.append(
        this.cap({ ...ARROW_KEYS.up, cls: 'arrow-up' }),
        this.cap({ ...ARROW_KEYS.left, cls: 'arrow-left' }),
        this.cap({ ...ARROW_KEYS.down, cls: 'arrow-down' }),
        this.cap({ ...ARROW_KEYS.right, cls: 'arrow-right' }),
      );

      // ----- numpad grid -----
      const numpad = $('#kb-numpad');
      numpad.innerHTML = '';
      NUMPAD_KEYS.forEach((def) => {
        const cap = this.cap(def);
        cap.style.gridColumn = def.gc;
        cap.style.gridRow = def.gr;
        numpad.append(cap);
      });

      this.updateLayoutUI();
      Stats.kbTotal = getLayoutKeyCount(this.layout);
      this.wire();
      this.fit();
    },

    buildMainRows() {
      const main = $('#kb-main');
      main.innerHTML = '';
      const rows = KEY_LAYOUTS[this.layout] || MAIN_ROWS_ANSI;
      rows.forEach((row, i) => {
        const rowEl = el('div', { class: 'kb-row' + (i === 0 ? ' fn-row' : '') });
        row.forEach((def) => rowEl.append(this.cap(def, i === 0)));
        main.append(rowEl);
      });
    },

    setLayout(layoutName) {
      if (!KEY_LAYOUTS[layoutName]) return;
      this.layout = layoutName;
      localStorage.setItem('kmt.layout', layoutName);
      this.buildMainRows();
      this.updateLayoutUI();

      // Restore tested state for keys in current layout
      Stats.testedKb.forEach((code) => {
        this.caps(code).forEach((n) => n.classList.add('is-tested'));
      });
      // Restore pressed/jammed state
      this.pressed.forEach((code) => {
        this.caps(code).forEach((n) => n.classList.add('is-press'));
      });
      this.jammed.forEach((code) => {
        this.caps(code).forEach((n) => n.classList.add('is-jammed'));
      });

      Stats.kbTotal = getLayoutKeyCount(layoutName);
      Stats.render();
      this.fit();
    },

    updateLayoutUI() {
      const isLaptop = this.layout === 'laptop';
      const extras = $('.kb-extras');
      if (extras) extras.style.display = isLaptop ? 'none' : 'flex';
      const kb = $('#keyboard');
      if (kb) kb.classList.toggle('is-laptop', isLaptop);

      const ansiBtn = $('#layout-ansi');
      const isoBtn = $('#layout-iso');
      const laptopBtn = $('#layout-laptop');
      if (ansiBtn) ansiBtn.classList.toggle('is-active', this.layout === 'ansi');
      if (isoBtn) isoBtn.classList.toggle('is-active', this.layout === 'iso');
      if (laptopBtn) laptopBtn.classList.toggle('is-active', this.layout === 'laptop');
    },

    unstick() {
      this.holdTimers.forEach((t) => clearTimeout(t));
      this.holdTimers.clear();
      this.repeatCounts.clear();
      this.pressed.clear();
      this.jammed.clear();
      this.chattered.clear();
      $$('#keyboard .key').forEach((n) => n.classList.remove('is-press', 'is-jammed', 'is-chatter'));
      this.updateStatusBadge('ok', 'All Keys Released');
    },

    // Scale the fixed-size board down to fit its container — never a scrollbar.
    fit() {
      const scroll = $('.kb-scroll');
      const kb = $('#keyboard');
      if (!scroll || !kb) return;
      const avail = scroll.clientWidth;
      const natW = kb.offsetWidth; // offsetWidth ignores the transform
      if (!avail || !natW) return;
      const scale = Math.min(1, avail / natW);
      kb.style.transform = scale < 1 ? `scale(${scale})` : 'none';
      scroll.style.height = Math.ceil(kb.offsetHeight * scale) + 'px';
    },

    cap(def, isFn) {
      if (def.spacer) {
        const s = el('div', { class: 'key key-spacer' });
        s.style.setProperty('--w', def.w || 1);
        return s;
      }
      const classes = ['key'];
      if (isFn) classes.push('fn');
      if (def.cls) classes.push(def.cls);
      const k = el('div', { class: classes.join(' '), 'data-code': def.code });
      k.style.setProperty('--w', def.w || 1);
      if (def.sub) k.append(el('span', { class: 'k-sub' }, def.sub));
      k.append(el('span', { class: 'k-label' }, def.label));
      return k;
    },

    caps(code) { return $$(`#keyboard .key[data-code="${CSS.escape(code)}"]`); },

    press(code, name) {
      if (this.pressed.has(code)) return;
      this.pressed.add(code);
      const nodes = this.caps(code);
      nodes.forEach((n) => { n.classList.add('is-press', 'is-tested'); });
      const inLayout = nodes.length > 0;
      Stats.record('kb:' + code, name, inLayout);
      Feedback.click();
    },

    release(code) {
      this.pressed.delete(code);
      this.jammed.delete(code);
      this.caps(code).forEach((n) => n.classList.remove('is-press', 'is-jammed'));
      if (this.pressed.size === 0) {
        this.updateStatusBadge('ok', 'Released');
      }
    },

    flagJammed(code, name, repeats) {
      this.jammed.add(code);
      this.caps(code).forEach((n) => n.classList.add('is-jammed'));
      this.setReadout(name, code, null, 'jammed', `⚠️ Held / Jammed (${repeats} repeats)`);
    },

    flagChatter(code, name, keyVal, gapMs) {
      this.chattered.add(code);
      this.caps(code).forEach((n) => n.classList.add('is-chatter'));
      this.setReadout(name, code, keyVal, 'chatter', `⚡ Chatter / Bounce (${gapMs}ms)`);
    },

    setReadout(name, code, keyVal, statusType = 'ok', statusText = 'Active Press') {
      const r = $('#readout');
      $('#readout-key').textContent = name;
      $('#readout-code').textContent = keyVal
        ? `code: ${code}  ·  key: ${keyVal}`
        : `code: ${code}`;
      this.updateStatusBadge(statusType, statusText);
      r.classList.remove('flash');
      void r.offsetWidth; // restart animation
      r.classList.add('flash');
    },

    updateStatusBadge(type, text) {
      const badge = $('#readout-status');
      if (!badge) return;
      badge.className = 'readout-status-badge ' + (
        type === 'jammed' ? 'status-jammed' :
        type === 'chatter' ? 'status-chatter' : 'status-ok'
      );
      badge.textContent = text;
    },

    wire() {
      document.addEventListener('keydown', (e) => {
        // Intercept navigation & F-keys to protect the test session
        if (this.PREVENT.has(e.code)) e.preventDefault();
        if ((e.ctrlKey || e.metaKey) && this.SHORTCUT_CODES.has(e.code)) e.preventDefault();
        if (e.altKey && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) e.preventDefault();

        // Check if this is a laptop Fn multimedia combo (Volume, Media, Brightness)
        const isMediaCombo = e.key && (
          e.key.startsWith('AudioVolume') ||
          e.key.startsWith('Media') ||
          e.key.startsWith('Brightness') ||
          e.key.startsWith('MonBrightness')
        );

        if (isMediaCombo) {
          e.preventDefault();
          // Illuminate Fn key to acknowledge that physical Fn combination worked!
          this.caps('Fn').forEach((n) => n.classList.add('is-tested', 'is-press'));
          setTimeout(() => {
            this.caps('Fn').forEach((n) => n.classList.remove('is-press'));
          }, 250);

          const mediaName = keyName(e.code, e.key);
          Stats.record('kb:' + (e.code || e.key), mediaName, true);
          this.setReadout(mediaName, e.code || 'FnCombo', e.key, 'ok', 'Fn Media Combo ✓');
          Feedback.click();
          return;
        }

        // Double Escape triggers unstick
        if (e.code === 'Escape') {
          const now = performance.now();
          if (this.lastEscPress && (now - this.lastEscPress) < 400) {
            this.unstick();
            return;
          }
          this.lastEscPress = now;
        }

        const now = performance.now();
        const isRepeat = e.repeat;
        const code = e.code;
        const name = keyName(code, e.key);

        // Chatter detection (switch bounce: keydown within 35ms of last keyup)
        const lastRel = this.lastReleaseTimes.get(code);
        let isChatter = false;
        if (!isRepeat && lastRel && (now - lastRel) > 0 && (now - lastRel) < 35) {
          isChatter = true;
          this.flagChatter(code, name, e.key, Math.round(now - lastRel));
        }

        if (isRepeat) {
          const count = (this.repeatCounts.get(code) || 0) + 1;
          this.repeatCounts.set(code, count);
          if (count >= 10) {
            this.flagJammed(code, name, count);
          }
          return;
        }

        this.repeatCounts.set(code, 0);
        this.pressTimes.set(code, now);

        // Flag jammed if key is held down > 1.5 seconds continuously
        clearTimeout(this.holdTimers.get(code));
        const timer = setTimeout(() => {
          if (this.pressed.has(code)) {
            this.flagJammed(code, name, this.repeatCounts.get(code) || 1);
          }
        }, 1500);
        this.holdTimers.set(code, timer);

        this.press(code, name);
        if (!isChatter) {
          this.setReadout(name, code, e.key, 'ok', 'Active Press');
        }

        // Windows key handling: Windows OS intercepts the Win key to open the Start menu,
        // which triggers window.blur and often drops the keyup event.
        // Auto-release the active press state after 180ms so the key registers as tested
        // without getting stuck glowing when the Start menu opens.
        if (code === 'MetaLeft' || code === 'MetaRight') {
          setTimeout(() => {
            if (this.pressed.has(code)) {
              this.release(code);
            }
          }, 180);
        }
      });

      document.addEventListener('keyup', (e) => {
        const now = performance.now();
        clearTimeout(this.holdTimers.get(e.code));
        this.holdTimers.delete(e.code);
        this.repeatCounts.delete(e.code);
        this.lastReleaseTimes.set(e.code, now);
        this.release(e.code);
      });

      window.addEventListener('blur', () => {
        this.pressed.forEach((c) => this.caps(c).forEach((n) => n.classList.remove('is-press', 'is-jammed')));
        this.pressed.clear();
        this.jammed.clear();
        this.holdTimers.forEach((t) => clearTimeout(t));
        this.holdTimers.clear();
      });

      // Prevent accidental page reload / tab close when keys have been tested
      window.addEventListener('beforeunload', (e) => {
        if (Stats.total > 0) {
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      });

      // Touch / click support — tap the on-screen keys.
      const kb = $('#keyboard');
      const codeFrom = (t) => { const k = t.closest('.key[data-code]'); return k && k.dataset.code; };
      kb.addEventListener('pointerdown', (e) => {
        const code = codeFrom(e.target);
        if (!code) return;
        e.preventDefault();
        if (code === 'Fn') {
          this.caps('Fn').forEach((n) => n.classList.toggle('is-tested'));
          Stats.record('kb:Fn', 'Fn (Hardware/Laptop)', true);
          this.setReadout('Fn (Hardware Key)', 'Fn', 'Embedded Controller', 'ok', 'Laptop Fn Verified');
          Feedback.click();
          return;
        }
        this.press(code, keyName(code));
        this.setReadout(keyName(code), code, null, 'ok', 'Tapped');
      });
      const lift = (e) => {
        const code = codeFrom(e.target);
        if (code && code !== 'Fn') this.release(code);
      };
      kb.addEventListener('pointerup', lift);
      kb.addEventListener('pointerleave', lift);
      kb.addEventListener('pointercancel', lift);

      // Layout toggle buttons
      const ansiBtn = $('#layout-ansi');
      const isoBtn = $('#layout-iso');
      const laptopBtn = $('#layout-laptop');
      if (ansiBtn) ansiBtn.addEventListener('click', () => this.setLayout('ansi'));
      if (isoBtn) isoBtn.addEventListener('click', () => this.setLayout('iso'));
      if (laptopBtn) laptopBtn.addEventListener('click', () => this.setLayout('laptop'));

      // Clear Tested Keys button (clears marked keys on keyboard)
      const clearBtn = $('#clear-tested');
      if (clearBtn) clearBtn.addEventListener('click', () => this.clearTested());

      // Unstick button
      const unstickBtn = $('#unstick-keys');
      if (unstickBtn) unstickBtn.addEventListener('click', () => this.unstick());

      // Modern ResizeObserver on .kb-scroll to keep board fitted
      const scroll = $('.kb-scroll');
      if (window.ResizeObserver && scroll) {
        this.ro = new ResizeObserver(() => this.fit());
        this.ro.observe(scroll);
      } else {
        let rT;
        window.addEventListener('resize', () => { cancelAnimationFrame(rT); rT = requestAnimationFrame(() => this.fit()); });
      }
      window.addEventListener('load', () => this.fit());
    },

    clearTested() {
      this.holdTimers.forEach((t) => clearTimeout(t));
      this.holdTimers.clear();
      this.repeatCounts.clear();
      this.pressed.clear();
      this.jammed.clear();
      this.chattered.clear();
      Stats.testedKb.clear();
      $$('#keyboard .key').forEach((n) => n.classList.remove('is-press', 'is-tested', 'is-jammed', 'is-chatter'));
      Stats.render();
      this.setReadout('Keys Cleared', 'Ready', null, 'ok', 'Board Cleaned');
      Feedback.click();
    },

    reset() {
      this.holdTimers.forEach((t) => clearTimeout(t));
      this.holdTimers.clear();
      this.repeatCounts.clear();
      this.pressTimes.clear();
      this.lastReleaseTimes.clear();
      this.chattered.clear();
      this.jammed.clear();
      this.pressed.clear();
      $$('#keyboard .key').forEach((n) => n.classList.remove('is-press', 'is-tested', 'is-jammed', 'is-chatter'));
      $('#readout-key').textContent = 'Press any key';
      $('#readout-code').textContent = 'your physical keyboard, or tap keys below';
      this.updateStatusBadge('ok', 'Ready');
    },
  };

  /* =================================================================
     Mouse tester
     ================================================================= */
  const Mouse = {
    wheelTimer: null,
    init() {
      const panel = $('#panel-mouse');
      const mouse = $('#mouse');
      const last = $('#mouse-last'), pos = $('#mouse-pos'),
        delta = $('#mouse-delta'), scroll = $('#mouse-scroll'), dbl = $('#mouse-dbl');

      const region = (b) => mouse.querySelector(`[data-button="${b}"]`);

      // Prevent browser history navigation on mouse Back/Forward clicks
      panel.addEventListener('auxclick', (e) => e.preventDefault());
      window.addEventListener('auxclick', (e) => {
        if (e.target.closest('#panel-mouse')) e.preventDefault();
      });

      panel.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const r = region(e.button);
        if (r) r.classList.add('is-press');
        const name = MOUSE_BUTTONS[e.button] || `Button ${e.button}`;
        last.textContent = name;
        Stats.record('mouse:' + e.button, name, false);
        Feedback.click();
      });
      panel.addEventListener('mouseup', (e) => {
        e.preventDefault();
        const r = region(e.button);
        if (r) r.classList.remove('is-press');
      });
      panel.addEventListener('contextmenu', (e) => e.preventDefault());

      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        pos.textContent = `${Math.round(e.clientX - rect.left)}, ${Math.round(e.clientY - rect.top)}`;
        delta.textContent = `${e.movementX}, ${e.movementY}`;
      });

      panel.addEventListener('wheel', (e) => {
        e.preventDefault();
        const up = e.deltaY < 0;
        scroll.textContent = up ? 'Up ▲' : 'Down ▼';
        const wheelEl = mouse.querySelector(up ? '.wheel-up' : '.wheel-down');
        if (wheelEl) {
          wheelEl.classList.add('is-press');
          clearTimeout(this.wheelTimer);
          this.wheelTimer = setTimeout(
            () => mouse.querySelectorAll('.wheel-up,.wheel-down').forEach((w) => w.classList.remove('is-press')),
            160,
          );
        }
        Stats.record('scroll:' + (up ? 'up' : 'down'), up ? 'Scroll Up' : 'Scroll Down', false);
      }, { passive: false });

      panel.addEventListener('dblclick', () => { dbl.textContent = 'Detected ✓'; });
    },
    reset() {
      ['#mouse-last', '#mouse-scroll', '#mouse-dbl'].forEach((s) => ($(s).textContent = '—'));
      $('#mouse-pos').textContent = '0, 0';
      $('#mouse-delta').textContent = '0, 0';
      $$('#mouse .is-press').forEach((n) => n.classList.remove('is-press'));
    },
  };

  /* =================================================================
     Gamepad tester (Gamepad API)
     ================================================================= */
  const Gamepad = {
    BTN: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start',
      'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right', 'Home'],
    raf: null,
    active: false,
    pads: {}, // index -> { btnEls:[], stickDots:{}, stickVals:{} }

    init() {
      window.addEventListener('gamepadconnected', () => this.refresh());
      window.addEventListener('gamepaddisconnected', () => this.refresh());
      this.refresh();
    },

    setActive(isActive) {
      this.active = isActive;
      if (isActive) {
        if (!this.raf && this.connectedList().length && !document.hidden) {
          this.loop();
        }
      } else {
        if (this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }
      }
    },

    connectedList() {
      return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean);
    },

    refresh() {
      const stage = $('#gp-stage');
      const list = this.connectedList();
      const status = $('#gp-status');
      const text = $('#gp-status-text');

      if (!list.length) {
        status.classList.remove('connected');
        text.textContent = 'No controller detected — connect one and press any button.';
        stage.innerHTML = '';
        this.pads = {};
        if (this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }
        return;
      }

      status.classList.add('connected');
      text.textContent = `${list.length} controller${list.length > 1 ? 's' : ''} connected`;
      stage.innerHTML = '';
      this.pads = {};

      list.forEach((pad) => {
        const wrap = el('div', { class: 'gp-pad' });
        wrap.append(el('div', { class: 'gp-pad-name' }, `🎮 ${pad.id}`));

        // Buttons
        const btnGrid = el('div', { class: 'gp-buttons' });
        const btnEls = pad.buttons.map((_, i) => {
          const name = (pad.mapping === 'standard' && this.BTN[i]) ? this.BTN[i] : 'B' + i;
          const b = el('div', { class: 'gp-btn' },
            el('span', { class: 'gp-btn-name' }, name),
            el('span', { class: 'gp-btn-val' }, '0.00'));
          btnGrid.append(b);
          return b;
        });
        wrap.append(btnGrid);

        // Axes / sticks
        const stickDots = {}, stickVals = {};
        if (pad.axes.length >= 2) {
          const axesWrap = el('div', { class: 'gp-axes' });
          const sticks = [{ label: 'Left Stick', x: 0, y: 1 }];
          if (pad.axes.length >= 4) sticks.push({ label: 'Right Stick', x: 2, y: 3 });
          sticks.forEach((s, idx) => {
            const dot = el('span', { class: 'gp-stick-dot' });
            const val = el('div', { class: 'gp-stick-val' }, 'x 0.00, y 0.00');
            stickDots[idx] = { dot, ax: s.x, ay: s.y };
            stickVals[idx] = val;
            axesWrap.append(el('div', { class: 'gp-stick' },
              el('div', { class: 'gp-stick-label' }, s.label),
              el('div', { class: 'gp-stick-pad' }, dot),
              val));
          });
          wrap.append(axesWrap);
        }

        stage.append(wrap);
        this.pads[pad.index] = { btnEls, stickDots, stickVals, lastPressed: new Set() };
      });

      if (this.active && !document.hidden && !this.raf) this.loop();
    },

    loop() {
      const list = this.connectedList();
      if (!list.length || !this.active || document.hidden) {
        this.raf = null;
        return;
      }

      list.forEach((pad) => {
        const ui = this.pads[pad.index];
        if (!ui) return;
        pad.buttons.forEach((btn, i) => {
          const e = ui.btnEls[i];
          if (!e) return;
          e.classList.toggle('pressed', btn.pressed);
          e.querySelector('.gp-btn-val').textContent = btn.value.toFixed(2);
          // count a press once on the rising edge
          const wasPressed = ui.lastPressed.has(i);
          if (btn.pressed && !wasPressed) {
            ui.lastPressed.add(i);
            const name = (pad.mapping === 'standard' && this.BTN[i]) ? this.BTN[i] : 'B' + i;
            Stats.record(`gp${pad.index}:${i}`, `🎮 ${name}`, false);
            Feedback.click();
          } else if (!btn.pressed && wasPressed) {
            ui.lastPressed.delete(i);
          }
        });
        Object.values(ui.stickDots).forEach(({ dot, ax, ay }, idx) => {
          const x = pad.axes[ax] || 0, y = pad.axes[ay] || 0;
          dot.style.transform = `translate(${x * 42}px, ${y * 42}px)`;
          ui.stickVals[idx].textContent = `x ${x.toFixed(2)}, y ${y.toFixed(2)}`;
        });
      });

      this.raf = requestAnimationFrame(() => this.loop());
    },
  };

  /* =================================================================
     App shell — tabs, toolbar, dialog, splash, service worker
     ================================================================= */
  const App = {
    init() {
      Stats.init();
      Keyboard.build();
      Mouse.init();
      Gamepad.init();
      this.tabs();
      this.toolbar();
      this.about();
      this.splash();
      this.registerSW();
    },

    tabs() {
      $$('.tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          $$('.tab').forEach((t) => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          const name = tab.dataset.tab;
          $$('.panel').forEach((p) => p.classList.toggle('is-active', p.id === 'panel-' + name));
          if (name === 'keyboard') Keyboard.fit();
          Gamepad.setActive(name === 'gamepad');
        });
      });

      // Pause Gamepad polling when page/tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (Gamepad.raf) {
            cancelAnimationFrame(Gamepad.raf);
            Gamepad.raf = null;
          }
        } else {
          const isGpTab = $('#panel-gamepad') && $('#panel-gamepad').classList.contains('is-active');
          if (isGpTab) {
            Gamepad.setActive(true);
          }
        }
      });
    },

    toolbar() {
      // Theme toggle (Dark / Light)
      const themeBtn = $('#toggle-theme');
      const themeIco = $('#theme-ico');
      let currentTheme = localStorage.getItem('kmt.theme') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

      const applyTheme = (theme) => {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('kmt.theme', theme);
        if (themeIco) themeIco.textContent = theme === 'light' ? '☀️' : '🌙';
        if (themeBtn) themeBtn.title = theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
      };
      applyTheme(currentTheme);

      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
      }

      const sound = $('#toggle-sound');
      const hap = $('#toggle-haptics');
      const sync = (btn, on) => { btn.classList.toggle('is-on', on); btn.setAttribute('aria-pressed', String(on)); };
      sync(sound, Feedback.sound);
      sync(hap, Feedback.haptics);
      sound.addEventListener('click', () => { Feedback.setSound(!Feedback.sound); sync(sound, Feedback.sound); if (Feedback.sound) Feedback.click(); });
      hap.addEventListener('click', () => { Feedback.setHaptics(!Feedback.haptics); sync(hap, Feedback.haptics); if (Feedback.haptics) Feedback.click(); });

      $('#reset-stats').addEventListener('click', () => {
        Stats.reset();
        Keyboard.reset();
        Mouse.reset();
      });
    },

    about() {
      const dlg = $('#about');
      const fill = (ul, names) => {
        names.forEach((n) => {
          const li = el('li');
          li.append(el('a', { href: `https://github.com/${n}`, target: '_blank', rel: 'noopener' }, n));
          ul.append(li);
        });
      };
      fill($('#stargazers'), STARGAZERS);
      fill($('#forkers'), FORKERS);
      const open = () => (dlg.showModal ? dlg.showModal() : (dlg.open = true));
      $('#about-btn').addEventListener('click', open);
      $('#footer-thanks').addEventListener('click', open);
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // click backdrop to close
    },

    splash() {
      const s = $('#splash');
      const hide = () => { s.classList.add('hidden'); setTimeout(() => s.remove(), 500); };
      // scripts are deferred, so the DOM is ready; give the splash a brief beat.
      setTimeout(hide, 550);
    },

    registerSW() {
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is best-effort */ });
        });
      }
    },
  };

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
