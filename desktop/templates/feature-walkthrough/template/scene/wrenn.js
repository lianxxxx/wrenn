/*
  wrenn.js: small helpers for Wrenn video scenes.

  Plain script (no modules, no build step). Load it right after GSAP:
    <script src="vendor/gsap.min.js"></script>
    <script src="wrenn.js"></script>

  The contract with the Wrenn renderer:
    window.WRENN      = { width, height, fps: 30, duration }   (duration in seconds)
    window.seek(t)    jumps the paused master timeline to t seconds. Returns a Promise
                      (it waits for screen recordings to finish seeking). Always await it.
    window.wrennReady a Promise that resolves once fonts, images and videos are loaded
                      and the first frame is drawn. It rejects if something is missing.

  Everything moves only through the paused GSAP timeline, so the same t always
  gives the same picture.
*/
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Ready promise. Made right away, so the renderer can await it at any time.
  // ---------------------------------------------------------------------------
  let resolveReady;
  let rejectReady;
  window.wrennReady = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // Stop "unhandled rejection" noise; the renderer still sees the rejection.
  window.wrennReady.catch(() => {});

  // ---------------------------------------------------------------------------
  // Determinism guard: CSS animations and transitions would run on the clock,
  // not on the timeline, so they are switched off for the whole page.
  // ---------------------------------------------------------------------------
  const guard = document.createElement("style");
  guard.textContent =
    "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
  document.head.appendChild(guard);

  // Note: GSAP tweens made outside the master timeline (gsap.to, gsap.from)
  // would play in real time. Only use tl.to / tl.from / tl.fromTo / tl.set,
  // and gsap.set for starting positions (it applies right away and never moves).

  // ---------------------------------------------------------------------------
  // Sizes and vibes
  // ---------------------------------------------------------------------------
  const SIZES = {
    reels: { width: 1080, height: 1920 },
    feed: { width: 1080, height: 1350 },
    square: { width: 1080, height: 1080 },
    youtube: { width: 1920, height: 1080 },
  };

  // speed > 1 means faster. Use v.d(seconds) to scale any duration by the vibe.
  const VIBES = {
    playful: { enter: "back.out(2.2)", exit: "back.in(1.6)", move: "power3.inOut", pop: "elastic.out(1, 0.55)", speed: 1.15, stagger: 0.06 },
    clean: { enter: "expo.out", exit: "power3.in", move: "expo.inOut", pop: "back.out(1.5)", speed: 1, stagger: 0.05 },
    bold: { enter: "back.out(1.7)", exit: "power4.in", move: "power4.inOut", pop: "back.out(2.6)", speed: 1.3, stagger: 0.035 },
    calm: { enter: "back.out(1.15)", exit: "sine.in", move: "sine.inOut", pop: "back.out(1.3)", speed: 0.75, stagger: 0.09 },
  };

  function vibe(name) {
    const base = VIBES[name] || VIBES.clean;
    return Object.assign({ name: VIBES[name] ? name : "clean" }, base, {
      d: (seconds) => seconds / base.speed,
    });
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  // ---------------------------------------------------------------------------
  // Canvas: sets the page size and gives back handy numbers for layout.
  //   const C = Wrenn.canvas("reels")  or  Wrenn.canvas({ width: 1080, height: 1920 })
  //   C.u        1% of the shorter side, in px (also CSS var --u)
  //   C.safe     the box everything important must stay inside (6% in from each edge)
  //   C.shape    "portrait", "landscape" or "square" (also a class on <body>)
  // ---------------------------------------------------------------------------
  let canvasInfo = null;

  function canvas(size) {
    const dims = typeof size === "string" ? SIZES[size] : size;
    if (!dims) throw new Error('Unknown size "' + size + '". Use reels, feed, square or youtube.');
    const { width, height } = dims;
    const u = Math.min(width, height) / 100;
    const insetX = Math.round(width * 0.06);
    const insetY = Math.round(height * 0.06);
    const shape = width === height ? "square" : height > width ? "portrait" : "landscape";

    const root = document.documentElement;
    root.style.setProperty("--w", width + "px");
    root.style.setProperty("--h", height + "px");
    root.style.setProperty("--u", u + "px");
    root.style.width = width + "px";
    root.style.height = height + "px";
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.body.classList.add("is-" + shape);

    canvasInfo = {
      width,
      height,
      u,
      shape,
      cx: width / 2,
      cy: height / 2,
      safe: {
        left: insetX,
        top: insetY,
        right: width - insetX,
        bottom: height - insetY,
        width: width - insetX * 2,
        height: height - insetY * 2,
      },
    };
    return canvasInfo;
  }

  // ---------------------------------------------------------------------------
  // Timing: splits the video into Hook, Features, Logo and Ending.
  //   Wrenn.timing(15, 4) -> [{ name: "hook", start, end }, { name: "feature", index: 0, ... }, ...]
  // Each part also has .dur. Feel free to adjust, this is just a fair start.
  // ---------------------------------------------------------------------------
  function timing(duration, featureCount) {
    const n = Math.max(0, featureCount | 0);
    let hook = clamp(duration * 0.13, 1.8, 5);
    let logo = clamp(duration * 0.1, 1.4, 4);
    let ending = clamp(duration * 0.12, 1.6, 5);
    if (n === 0) {
      const extra = duration - hook - logo - ending;
      hook += extra * 0.5;
      logo += extra * 0.25;
      ending += extra * 0.25;
    }
    const each = n ? (duration - hook - logo - ending) / n : 0;

    const parts = [];
    let t = 0;
    const push = (part, dur) => {
      parts.push(Object.assign(part, { start: t, end: t + dur, dur }));
      t += dur;
    };
    push({ name: "hook" }, hook);
    for (let i = 0; i < n; i++) push({ name: "feature", index: i }, each);
    push({ name: "logo" }, logo);
    push({ name: "ending" }, ending);
    return parts;
  }

  // ---------------------------------------------------------------------------
  // Loading assets
  // ---------------------------------------------------------------------------
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "sync";
      img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
      img.onerror = () => reject(new Error("Could not load image: " + src));
      img.src = src;
    });
  }

  function loadImages(srcs) {
    return Promise.all(srcs.map(loadImage));
  }

  // Screen recordings. Never autoplay: frames are picked by seek().
  function loadVideo(src) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.autoplay = false;
      const ok = () => {
        video.pause();
        resolve(video);
      };
      video.addEventListener("loadeddata", ok, { once: true });
      video.addEventListener("error", () => reject(new Error("Could not load video: " + src)), { once: true });
      video.src = src;
      video.load();
    });
  }

  // Waits for every @font-face on the page. Call it before measuring text.
  async function fontsReady() {
    const faces = Array.from(document.fonts);
    await Promise.all(
      faces.map((f) =>
        f.load().catch(() => console.warn("[wrenn] Font did not load: " + f.family))
      )
    );
    await document.fonts.ready;
  }

  // ---------------------------------------------------------------------------
  // Videos synced to the timeline
  //   Wrenn.syncVideo(video, { start: 4.2, from: 0, rate: 1 })
  //   start: timeline second where the clip begins, from: second inside the clip.
  // ---------------------------------------------------------------------------
  const syncedVideos = [];

  function syncVideo(video, opts) {
    const o = Object.assign({ start: 0, from: 0, rate: 1 }, opts);
    syncedVideos.push({ video, start: o.start, from: o.from, rate: o.rate });
    return video;
  }

  function seekVideo(item, t) {
    const v = item.video;
    const end = isFinite(v.duration) ? Math.max(0, v.duration - 0.04) : 0;
    const target = clamp(item.from + (t - item.start) * item.rate, 0, end);
    if (Math.abs(v.currentTime - target) < 0.0005) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn("[wrenn] Video seek timed out at " + target.toFixed(3));
        resolve();
      }, 5000);
      v.addEventListener(
        "seeked",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
      v.currentTime = target;
    });
  }

  // ---------------------------------------------------------------------------
  // Install: hooks the master timeline up to the renderer. Call it last.
  //   Wrenn.install({ timeline: tl, duration: 15 })
  // ---------------------------------------------------------------------------
  let master = null;
  let total = 0;

  function seek(t) {
    if (!master) return Promise.reject(new Error("Wrenn.install() was not called yet."));
    const time = clamp(Number(t) || 0, 0, total);
    master.seek(time, false);
    if (!syncedVideos.length) return Promise.resolve();
    return Promise.all(syncedVideos.map((item) => seekVideo(item, time))).then(() => undefined);
  }

  async function waitForPageAssets() {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? img.decode().catch(() => {})
          : new Promise((resolve, reject) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", () => reject(new Error("Could not load image: " + img.src)), { once: true });
            })
      )
    );
    const videos = Array.from(document.querySelectorAll("video"));
    await Promise.all(
      videos.map((v) =>
        v.readyState >= 2
          ? null
          : new Promise((resolve, reject) => {
              v.addEventListener("loadeddata", resolve, { once: true });
              v.addEventListener("error", () => reject(new Error("Could not load video: " + v.src)), { once: true });
            })
      )
    );
    await fontsReady();
  }

  function install(opts) {
    const timeline = opts && opts.timeline;
    const duration = Number(opts && opts.duration);
    if (!canvasInfo) throw new Error("Call Wrenn.canvas(size) before Wrenn.install().");
    if (!timeline) throw new Error("Wrenn.install() needs { timeline }.");
    if (!(duration > 0)) throw new Error("Wrenn.install() needs { duration } in seconds.");

    if (timeline.duration() > duration + 0.001) {
      console.warn(
        "[wrenn] Timeline is " + timeline.duration().toFixed(2) + "s but the video is " + duration + "s. The end will be cut."
      );
    }
    timeline.pause();
    timeline.set({}, {}, duration); // pad so the timeline is at least the full length

    master = timeline;
    total = duration;
    window.WRENN = Object.freeze({
      width: canvasInfo.width,
      height: canvasInfo.height,
      fps: 30,
      duration: duration,
    });
    window.seek = seek;
    if (soundHits.length) {
      window.WRENN_SOUND = sound();
      console.log("[wrenn] scene/sound.json:\n" + JSON.stringify(window.WRENN_SOUND, null, 2));
    }

    waitForPageAssets()
      .then(() => seek(0))
      .then(() => {
        if (location.hash.indexOf("debug") !== -1) showSafeArea();
        resolveReady(window.WRENN);
      })
      .catch(fail);
  }

  // Use as: (async () => { ... })().catch(Wrenn.fail)
  function fail(err) {
    console.error("[wrenn]", err);
    rejectReady(err instanceof Error ? err : new Error(String(err)));
  }

  // ---------------------------------------------------------------------------
  // Device frames, drawn in CSS
  //   const d = Wrenn.device(img, { maxWidth, maxHeight, kind: "auto" })
  //   parent.appendChild(d.el)
  //   d.focus(tl, { x: 0.7, y: 0.3, zoom: 1.8, at: 3, duration: 1.2, ease })
  // kind "auto" picks a phone for tall screenshots and a browser window otherwise.
  // Pass { aspect } (height / width) when the media is not an image or video.
  // ---------------------------------------------------------------------------
  const deviceCss = `
    .wrenn-device { position: absolute; will-change: transform; }
    .wrenn-screen { position: relative; overflow: hidden; background: #fff; }
    .wrenn-pan { position: absolute; left: 0; top: 0; width: 100%; height: 100%; transform-origin: 0 0; will-change: transform; }
    .wrenn-pan > img, .wrenn-pan > video, .wrenn-pan > .wrenn-fill { display: block; width: 100%; height: 100%; object-fit: cover; }
    .wrenn-browser { background: var(--device-body, #f4f4f2); box-shadow: 0 calc(var(--u) * 2.4) calc(var(--u) * 6) rgba(0,0,0,.28), 0 0 0 1px rgba(0,0,0,.08); }
    .wrenn-browser .wrenn-bar { display: flex; align-items: center; gap: calc(var(--bar) * 0.28); padding: 0 calc(var(--bar) * 0.45); height: var(--bar); }
    .wrenn-browser .wrenn-bar i { width: calc(var(--bar) * 0.26); height: calc(var(--bar) * 0.26); border-radius: 50%; background: var(--device-dots, rgba(0,0,0,.18)); }
    .wrenn-phone { background: var(--device-body, #121214); box-shadow: 0 calc(var(--u) * 3) calc(var(--u) * 7) rgba(0,0,0,.35), inset 0 0 0 2px rgba(255,255,255,.08); }
    .wrenn-phone .wrenn-notch { position: absolute; left: 50%; top: calc(var(--bez) * 1.6); width: 26%; height: calc(var(--bez) * 2.2); transform: translateX(-50%); border-radius: 999px; background: var(--device-body, #121214); z-index: 2; }
  `;
  let deviceCssAdded = false;

  function mediaAspect(media, fallback) {
    if (fallback) return fallback;
    if (media.naturalWidth) return media.naturalHeight / media.naturalWidth;
    if (media.videoWidth) return media.videoHeight / media.videoWidth;
    throw new Error("Wrenn.device: media is not loaded yet, or pass { aspect }.");
  }

  function device(media, opts) {
    if (!deviceCssAdded) {
      const s = document.createElement("style");
      s.textContent = deviceCss;
      document.head.appendChild(s);
      deviceCssAdded = true;
    }
    const C = canvasInfo || { safe: { width: 1000, height: 1000 }, u: 10 };
    const o = Object.assign({ kind: "auto", maxWidth: C.safe.width, maxHeight: C.safe.height }, opts);
    const aspect = mediaAspect(media, o.aspect);
    const kind = o.kind === "auto" ? (aspect > 1.25 ? "phone" : "browser") : o.kind;

    const el = document.createElement("div");
    el.className = "wrenn-device wrenn-" + kind;
    const screen = document.createElement("div");
    screen.className = "wrenn-screen";
    const pan = document.createElement("div");
    pan.className = "wrenn-pan";
    pan.appendChild(media);
    screen.appendChild(pan);

    let width, screenW, screenH;
    if (kind === "phone") {
      // bezel and corner sizes are a share of the phone width
      const fit = (w) => ({ w, sw: w * 0.93, sh: w * 0.93 * aspect, h: w * 0.93 * aspect + w * 0.07 });
      let f = fit(o.maxWidth);
      if (f.h > o.maxHeight) f = fit(o.maxWidth * (o.maxHeight / f.h));
      width = f.w;
      screenW = f.sw;
      screenH = f.sh;
      const bez = width * 0.035;
      el.style.setProperty("--bez", bez + "px");
      el.style.padding = bez + "px";
      el.style.borderRadius = width * 0.15 + "px";
      screen.style.borderRadius = width * 0.12 + "px";
      const notch = document.createElement("div");
      notch.className = "wrenn-notch";
      el.appendChild(notch);
      el.appendChild(screen);
      el.style.height = screenH + bez * 2 + "px";
    } else {
      const barFor = (w) => Math.max(18, w * 0.045);
      let w = o.maxWidth;
      let h = barFor(w) + w * aspect;
      if (h > o.maxHeight) {
        w = w * (o.maxHeight / h);
        h = barFor(w) + w * aspect;
      }
      width = w;
      screenW = w;
      screenH = w * aspect;
      const bar = barFor(w);
      el.style.setProperty("--bar", bar + "px");
      el.style.borderRadius = Math.max(10, w * 0.018) + "px";
      el.style.overflow = "hidden";
      const barEl = document.createElement("div");
      barEl.className = "wrenn-bar";
      barEl.innerHTML = "<i></i><i></i><i></i>";
      el.appendChild(barEl);
      el.appendChild(screen);
      el.style.height = bar + screenH + "px";
    }
    el.style.width = width + "px";
    screen.style.width = screenW + "px";
    screen.style.height = screenH + "px";

    const d = {
      el,
      screen,
      pan,
      media,
      kind,
      width,
      height: parseFloat(el.style.height),
      screenWidth: screenW,
      screenHeight: screenH,
      // Center the frame on a point (left and top in px).
      place(cx, cy) {
        el.style.left = cx - d.width / 2 + "px";
        el.style.top = cy - d.height / 2 + "px";
        return d;
      },
      // Zoom and pan the screen to a spot. x and y are 0..1 of the screenshot.
      focus(tl, f) {
        const z = Math.max(1, f.zoom || 1);
        const x = clamp(f.x == null ? 0.5 : f.x, 0, 1);
        const y = clamp(f.y == null ? 0.5 : f.y, 0, 1);
        const tx = clamp(screenW / 2 - x * screenW * z, screenW - screenW * z, 0);
        const ty = clamp(screenH / 2 - y * screenH * z, screenH - screenH * z, 0);
        tl.to(pan, { x: tx, y: ty, scale: z, duration: f.duration || 1, ease: f.ease || "power3.inOut" }, f.at);
        return d;
      },
    };
    return d;
  }

  // ---------------------------------------------------------------------------
  // Text reveal
  //   Wrenn.reveal(tl, el, { by: "words" | "lines", at: 0.4, vibe: v })  -> end time
  //   Wrenn.hide(tl, el, { at: 3.2, vibe: v })
  // Each word sits in a mask and rises in with the vibe's overshoot.
  // Hidden words sit 160% away (not 115%), so no thin slice of them peeks out of the mask padding.
  // ---------------------------------------------------------------------------
  const textCss = `
    .wrenn-w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0.12em 0.04em 0.16em; margin: -0.12em -0.04em -0.16em; }
    .wrenn-wi { display: inline-block; will-change: transform; }
  `;
  let textCssAdded = false;

  function split(el) {
    if (el.__wrennWords) return el.__wrennWords;
    if (!textCssAdded) {
      const s = document.createElement("style");
      s.textContent = textCss;
      document.head.appendChild(s);
      textCssAdded = true;
    }
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const inners = [];
    words.forEach((word, i) => {
      const outer = document.createElement("span");
      outer.className = "wrenn-w";
      const inner = document.createElement("span");
      inner.className = "wrenn-wi";
      inner.textContent = word;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      inners.push(inner);
    });
    el.__wrennWords = inners;
    return inners;
  }

  // Groups word spans by line (needs fonts loaded and the element in the page).
  function lineIndexes(inners) {
    let line = -1;
    let lastTop = null;
    return inners.map((w) => {
      const top = w.parentNode.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        line++;
        lastTop = top;
      }
      return line;
    });
  }

  function reveal(tl, el, opts) {
    const o = Object.assign({ by: "words", at: 0 }, opts);
    const v = o.vibe || vibe("clean");
    const inners = split(el);
    const dur = o.duration || v.d(0.7);
    const stagger = o.stagger != null ? o.stagger : o.by === "lines" ? v.stagger * 2.5 : v.stagger;
    const order = o.by === "lines" ? lineIndexes(inners) : inners.map((_, i) => i);
    inners.forEach((w, i) => {
      tl.fromTo(
        w,
        { yPercent: 160, rotation: o.tilt == null ? 5 : o.tilt },
        { yPercent: 0, rotation: 0, duration: dur, ease: o.ease || v.enter },
        o.at + order[i] * stagger
      );
    });
    return o.at + order[order.length - 1] * stagger + dur;
  }

  function hide(tl, el, opts) {
    const o = Object.assign({ at: 0 }, opts);
    const v = o.vibe || vibe("clean");
    const inners = split(el);
    const dur = o.duration || v.d(0.4);
    tl.to(inners, { yPercent: -160, duration: dur, ease: o.ease || v.exit, stagger: v.stagger * 0.5 }, o.at);
    return o.at + dur + v.stagger * 0.5 * (inners.length - 1);
  }

  // ---------------------------------------------------------------------------
  // Colors
  // ---------------------------------------------------------------------------
  function hexToRgb(hex) {
    let h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(c) {
    const p = (x) => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, "0");
    return "#" + p(c.r) + p(c.g) + p(c.b);
  }

  // mix("#ff0000", "#0000ff", 0.5) -> halfway between
  function mix(a, b, t) {
    const x = hexToRgb(a);
    const y = hexToRgb(b);
    return rgbToHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
  }

  // amount > 0 lightens toward white, < 0 darkens toward black
  function shade(hex, amount) {
    return amount >= 0 ? mix(hex, "#ffffff", amount) : mix(hex, "#000000", -amount);
  }

  function luminance(hex) {
    const c = hexToRgb(hex);
    const ch = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }

  function contrast(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  // Picks whichever of the two text colors reads better on bg.
  function readableOn(bg, dark, light) {
    const d = dark || "#111111";
    const l = light || "#ffffff";
    return contrast(bg, d) >= contrast(bg, l) ? d : l;
  }

  function alpha(hex, a) {
    const c = hexToRgb(hex);
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
  }

  // ---------------------------------------------------------------------------
  // Sound hits (for scene/sound.json)
  //   Wrenn.hit(2.0, "whoosh")  -> notes a sound at timeline second 2.0, returns 2.0
  //   Wrenn.sound()             -> { hits: [...] }, sorted, ready for scene/sound.json
  // Types: pop, whoosh, click, impact, riser. After Wrenn.install() the list is also
  // on window.WRENN_SOUND and printed in the console. The page can't write files:
  // you still write scene/sound.json yourself.
  // ---------------------------------------------------------------------------
  const SOUND_TYPES = ["pop", "whoosh", "click", "impact", "riser"];
  const soundHits = [];

  function hit(t, type) {
    const time = Number(t);
    if (!(time >= 0) || SOUND_TYPES.indexOf(type) === -1) {
      console.warn("[wrenn] Wrenn.hit() skipped: needs a time in seconds and one of " + SOUND_TYPES.join(", ") + ".");
      return time;
    }
    soundHits.push({ t: Math.round(time * 1000) / 1000, type: type });
    return time;
  }

  function sound() {
    const hits = soundHits
      .filter((h) => !total || h.t <= total)
      .sort((a, b) => a.t - b.t)
      .slice(0, 60);
    return { hits: hits.map((h) => ({ t: h.t, type: h.type })) };
  }

  // ---------------------------------------------------------------------------
  // Seeded random (Math.random would change every render)
  //   const rand = Wrenn.random(7); rand() -> 0..1, same list every time
  // ---------------------------------------------------------------------------
  function random(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------------------
  // Safe area check
  //   await Wrenn.checkSafeArea()  -> list of problems, empty when all is well
  // Nothing visible may touch a corner zone (6% of width by 6% of height at each
  // corner). Text must also stay inside the safe box. A device frame may slide in
  // or out through an edge, as long as it misses the corners.
  // Checks text, images, videos, device frames and anything with [data-safe].
  // Open the page with #debug in the URL to see the safe box and corner zones.
  // ---------------------------------------------------------------------------
  function isVisible(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentNode) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.02) return false;
    }
    return true;
  }

  function describe(el) {
    if (el.id) return "#" + el.id;
    const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).join(".") : "";
    const text = (el.textContent || "").trim().slice(0, 24);
    return el.tagName.toLowerCase() + cls + (text ? ' "' + text + '"' : "");
  }

  async function checkSafeArea(opts) {
    if (!master || !canvasInfo) throw new Error("Call Wrenn.install() first.");
    const step = (opts && opts.step) || 0.25;
    const s = canvasInfo.safe;
    const found = new Map();
    const W = canvasInfo.width;
    const H = canvasInfo.height;
    const corners = [
      [0, 0, s.left, s.top],
      [s.right, 0, W, s.top],
      [0, s.bottom, s.left, H],
      [s.right, s.bottom, W, H],
    ];
    const hitsCorner = (r) => corners.some(([x1, y1, x2, y2]) => r.left < x2 && r.right > x1 && r.top < y2 && r.bottom > y1);
    // Text: split words, or text blocks that were not split. Things inside a device frame are skipped.
    const isText = (el) => el.classList.contains("wrenn-w") || /^(H1|H2|H3|P)$/.test(el.tagName) || el.hasAttribute("data-safe");
    const targets = () =>
      Array.from(document.querySelectorAll(".wrenn-w, h1, h2, h3, p, img, video, .wrenn-device, [data-safe]")).filter(
        (el) =>
          (!el.closest(".wrenn-device") || el.classList.contains("wrenn-device")) &&
          !(/^(H1|H2|H3|P)$/.test(el.tagName) && el.querySelector(".wrenn-w"))
      );
    for (let t = 0; t <= total + 1e-6; t += step) {
      await seek(t);
      for (const el of targets()) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const onCanvas = r.right > 0 && r.bottom > 0 && r.left < W && r.top < H;
        if (!onCanvas || found.has(el) || !isVisible(el)) continue;
        const outOfSafe = r.left < s.left - 0.5 || r.top < s.top - 0.5 || r.right > s.right + 0.5 || r.bottom > s.bottom + 0.5;
        if (hitsCorner(r)) found.set(el, { at: +t.toFixed(2), what: describe(el), problem: "in a corner zone" });
        else if (isText(el) && outOfSafe) found.set(el, { at: +t.toFixed(2), what: describe(el), problem: "text outside the safe box" });
      }
    }
    await seek(0);
    return Array.from(found.values());
  }

  function showSafeArea() {
    if (!canvasInfo) return;
    const s = canvasInfo.safe;
    const box = document.createElement("div");
    box.style.cssText =
      "position:absolute;left:" + s.left + "px;top:" + s.top + "px;width:" + s.width + "px;height:" + s.height +
      "px;outline:3px dashed #ff2d55;pointer-events:none;z-index:99999";
    document.body.appendChild(box);
    [
      [0, 0],
      [canvasInfo.width - s.left, 0],
      [0, canvasInfo.height - s.top],
      [canvasInfo.width - s.left, canvasInfo.height - s.top],
    ].forEach(([x, y]) => {
      const c = document.createElement("div");
      c.style.cssText =
        "position:absolute;left:" + x + "px;top:" + y + "px;width:" + s.left + "px;height:" + s.top +
        "px;background:rgba(255,45,85,.35);pointer-events:none;z-index:99999";
      document.body.appendChild(c);
    });
  }

  window.Wrenn = {
    SIZES,
    VIBES,
    vibe,
    clamp,
    canvas,
    timing,
    loadImage,
    loadImages,
    loadVideo,
    fontsReady,
    syncVideo,
    install,
    fail,
    device,
    split,
    reveal,
    hide,
    hexToRgb,
    rgbToHex,
    mix,
    shade,
    luminance,
    contrast,
    readableOn,
    alpha,
    random,
    hit,
    sound,
    checkSafeArea,
    showSafeArea,
  };
})();
