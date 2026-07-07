/* ALDO ORTIZ — terminal portfolio */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- kill any old service worker + caches ---------- */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    if (window.caches) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
  }

  /* ---------- boot sequence ---------- */
  const boot = document.getElementById("boot");
  const bootText = document.getElementById("boot-text");
  const seen = sessionStorage.getItem("ao-boot");
  const killBoot = () => {
    boot.classList.add("done");
    setTimeout(() => { boot.style.display = "none"; }, 500);
  };
  if (boot && (reduced || seen)) {
    boot.style.display = "none";
  } else if (boot && bootText) {
    const lines = [
      "AO TERMINAL v3.0",
      "auth ......... OK",
      "market feed .. LIVE",
      "loading portfolio_",
    ];
    let li = 0, ci = 0, out = "";
    const type = () => {
      if (li >= lines.length) {
        sessionStorage.setItem("ao-boot", "1");
        setTimeout(killBoot, 220);
        return;
      }
      out += lines[li][ci++];
      bootText.textContent = out;
      if (ci >= lines[li].length) { li++; ci = 0; out += "\n"; }
      setTimeout(type, li >= lines.length ? 0 : 9 + Math.random() * 14);
    };
    setTimeout(type, 120);
    setTimeout(killBoot, 2600); // hard failsafe
  }

  /* ---------- clock (Calgary) ---------- */
  const clock = document.getElementById("clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false, timeZone: "America/Edmonton",
    });
    const tick = () => { clock.textContent = fmt.format(new Date()) + " MT"; };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- hero chart ---------- */
  const canvas = document.getElementById("chart");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const N = 160;
    let pts = [];
    let v = 100;
    let drift = 0.35;
    const step = () => {
      v += drift + (Math.random() - 0.5) * 4.6;
      if (v < 60) v = 60 + Math.random() * 4;
      return v;
    };
    for (let i = 0; i < N; i++) pts.push(step());
    // secondary series
    let pts2 = [];
    let v2 = 90;
    const step2 = () => {
      v2 += 0.22 + (Math.random() - 0.5) * 3.4;
      if (v2 < 50) v2 = 50 + Math.random() * 4;
      return v2;
    };
    for (let i = 0; i < N; i++) pts2.push(step2());

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const lastPriceEl = document.getElementById("last-price");

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const all = pts.concat(pts2);
      const min = Math.min(...all) - 12;
      const max = Math.max(...all) + 12;
      const y = (val) => H - ((val - min) / (max - min)) * H * 0.72 - H * 0.1;
      const x = (i) => (i / (N - 1)) * (W + 40) - 20;

      // horizontal price levels
      ctx.strokeStyle = "rgba(140,165,210,0.07)";
      ctx.lineWidth = 1;
      ctx.font = "10px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(138,150,173,0.5)";
      for (let g = 0; g < 5; g++) {
        const gy = (H / 5) * g + H / 10;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
        const price = (max - ((gy - H * 0.1) / (H * 0.72)) * (max - min)).toFixed(2);
        ctx.fillText(price, W - 46, gy - 5);
      }

      // cyan secondary line
      ctx.beginPath();
      pts2.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p)) : ctx.moveTo(x(i), y(p))));
      ctx.strokeStyle = "rgba(83,216,240,0.35)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // amber main line + area fill
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p)) : ctx.moveTo(x(i), y(p))));
      ctx.strokeStyle = "rgba(255,176,32,0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(255,176,32,0.5)";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(255,176,32,0.16)");
      grad.addColorStop(1, "rgba(255,176,32,0)");
      ctx.lineTo(x(N - 1), H);
      ctx.lineTo(x(0), H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // live tip
      const tipX = x(N - 1), tipY = y(pts[N - 1]);
      ctx.beginPath();
      ctx.arc(Math.min(tipX, W - 8), tipY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFB020";
      ctx.fill();
    };

    if (reduced) {
      draw();
    } else {
      let frame = 0;
      let running = true;
      const loop = () => {
        if (running) {
          if (++frame % 5 === 0) {
            pts.push(step());
            pts.shift();
            pts2.push(step2());
            pts2.shift();
            if (lastPriceEl && frame % 15 === 0) {
              lastPriceEl.textContent = pts[N - 1].toFixed(2);
            }
          }
          draw();
        }
        requestAnimationFrame(loop);
      };
      loop();
      new IntersectionObserver(([e]) => { running = e.isIntersecting; }).observe(canvas);
    }
  }

  /* ---------- crosshair cursor ---------- */
  const xv = document.getElementById("xh-v");
  const xhH = document.getElementById("xh-h");
  const tag = document.getElementById("xh-tag");
  if (finePointer && !reduced && xv && xhH && tag) {
    let raf = null;
    document.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        document.body.classList.add("xh-on");
        xv.style.left = e.clientX + "px";
        xhH.style.top = e.clientY + "px";
        tag.style.left = e.clientX + 14 + "px";
        tag.style.top = e.clientY + 14 + "px";
        const price = (200 - (e.clientY / window.innerHeight) * 100).toFixed(2);
        tag.textContent = "AO " + price;
      });
    });
    document.addEventListener("mouseleave", () => document.body.classList.remove("xh-on"));
  }

  /* ---------- scroll progress ---------- */
  const prog = document.getElementById("progress");
  if (prog) {
    const onScroll = () => {
      const d = document.documentElement;
      const p = d.scrollTop / (d.scrollHeight - d.clientHeight || 1);
      prog.style.width = p * 100 + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- scroll reveals ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduced) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    let stagger = 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = (stagger++ % 4) * 80;
        setTimeout(() => e.target.classList.add("in"), delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      runCount(e.target);
      cio.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => cio.observe(el));

  /* ---------- watchlist: bars + sparklines ---------- */
  const rows = document.querySelectorAll(".wl-row[data-level]");
  rows.forEach((row) => {
    // sparkline
    const spark = row.querySelector(".wl-spark");
    if (spark) {
      const w = 84, h = 26, n = 22;
      let val = 40 + Math.random() * 20;
      const ptsArr = [];
      for (let i = 0; i < n; i++) {
        val += 1.1 + (Math.random() - 0.5) * 9;
        ptsArr.push(val);
      }
      const mn = Math.min(...ptsArr), mx = Math.max(...ptsArr);
      const coords = ptsArr
        .map((p, i) => `${((i / (n - 1)) * w).toFixed(1)},${(h - 3 - ((p - mn) / (mx - mn || 1)) * (h - 6)).toFixed(1)}`)
        .join(" ");
      spark.innerHTML =
        `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
        `<polyline points="${coords}" fill="none" stroke="#34E8A4" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    }
  });
  const bio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const bar = e.target.querySelector(".wl-bar i");
      if (bar) bar.style.width = e.target.dataset.level + "%";
      bio.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  rows.forEach((r) => bio.observe(r));

  /* ---------- project modals ---------- */
  document.querySelectorAll("[data-modal]").forEach((card) => {
    card.addEventListener("click", () => {
      const dlg = document.getElementById(card.dataset.modal);
      if (dlg) dlg.showModal();
    });
  });
  document.querySelectorAll(".modal").forEach((dlg) => {
    dlg.querySelectorAll("[data-close]").forEach((b) =>
      b.addEventListener("click", () => dlg.close())
    );
    dlg.addEventListener("click", (e) => {
      const r = dlg.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dlg.close();
    });
  });

  /* ---------- mobile nav ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- project cards: spotlight + background sparkline ---------- */
  document.querySelectorAll(".proj-card").forEach((card, idx) => {
    if (finePointer && !reduced) {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    }
    const spark = card.querySelector(".proj-spark");
    if (!spark) return;
    const w = 400, h = 80, n = 34;
    let val = 30 + ((idx * 13) % 20);
    const arr = [];
    for (let i = 0; i < n; i++) {
      val += 0.9 + (Math.random() - 0.5) * 10;
      arr.push(val);
    }
    const mn = Math.min(...arr), mx = Math.max(...arr);
    const pt = (p, i) =>
      `${((i / (n - 1)) * w).toFixed(1)},${(h - 4 - ((p - mn) / (mx - mn || 1)) * (h - 14)).toFixed(1)}`;
    const line = arr.map(pt).join(" ");
    spark.innerHTML =
      `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">` +
      `<polyline points="${line}" fill="none" stroke="rgba(255,176,32,0.5)" stroke-width="1.5"/>` +
      `<polygon points="0,${h} ${line} ${w},${h}" fill="rgba(255,176,32,0.07)"/></svg>`;
  });

  /* ---------- interactive profile terminal ---------- */
  const termBody = document.getElementById("term-body");
  const termForm = document.getElementById("term-form");
  const termInput = document.getElementById("term-input");
  if (termBody && termForm && termInput) {
    const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const print = (html, cls) => {
      const div = document.createElement("div");
      div.className = cls || "t-out";
      div.innerHTML = html;
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    };
    const printCmd = (cmd) => print(`<span class="t-dim">$</span> <span class="t-cmd">${esc(cmd)}</span>`);

    const AO_ASCII =
`   ▄▄▄   ▄▄▄▄
  ██▀██ ██▀▀██
  ██▄██ ██  ██
  ██ ██ ██▄▄██
  ▀▀ ▀▀  ▀▀▀▀   aldo@calgary`;

    const termCmds = {
      help: () =>
        `<span class="t-dim">available commands:</span>
whoami      about       skills      projects
languages   education   contact     resume
neofetch    sudo        clear       hire`,
      whoami: () => `aldo.ortiz — developer &amp; analyst <span class="t-dim">(fintech × data × product)</span>`,
      about: () =>
        `B.C.I.S. grad, Mount Royal University — Class of 2025, minor in
Finance &amp; Economics. Currently leading a distributed ML team at
DEFEND building classification systems for a youth-safety platform.
Previously: Fresh Prep (field marketing lead), QuadReal (enterprise
IT), Neo Financial (fintech ops).

<span class="t-dim">edge:</span> writes the code <span class="t-ok">AND</span> speaks the business.`,
      skills: () => `PY ▲  JS ▲  BA ▲  SQL ▲  ML ▲  CLD ▲   <span class="t-dim">— full watchlist in section [02]</span>`,
      projects: () => `MRUH  RIO  AMRN  CNRP  SENT  ALPH  M2M  TLO   <span class="t-dim">— 8 holdings in section [03]</span>`,
      languages: () => `EN ████████ ADVANCED
ES ████████ FLUENT
FR █████░░░ INTERMEDIATE`,
      education: () => `2020-2025  B.C.I.S. — Mount Royal University <span class="t-dim">(minor: Fin &amp; Econ)</span>
2024       European Innovation Academy — U. Porto <span class="t-dim">(CTO, Amarna)</span>`,
      contact: () => { document.querySelector("#contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); return `<span class="t-ok">→ opening contact…</span>`; },
      resume: () => { window.open("assets/resume.pdf", "_blank"); return `<span class="t-ok">→ opening resume.pdf…</span>`; },
      neofetch: () => `<span class="t-cmd">${esc(AO_ASCII)}</span>
<span class="t-dim">OS:</span>      OrtizOS 25.04 LTS
<span class="t-dim">Uptime:</span>  since 2001
<span class="t-dim">Shell:</span>   fintech/bash
<span class="t-dim">Stack:</span>   python · js · sql · tensorflow
<span class="t-dim">Status:</span>  <span class="t-ok">OPEN TO WORK ●</span>`,
      hire: () => { document.querySelector("#contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); return `<span class="t-ok">✓ ORDER FILLED — settle via contact form</span>`; },
      sudo: (arg) =>
        arg.includes("hire")
          ? `<span class="t-ok">[sudo] permission granted — you clearly have good judgment.
✓ routing you to the contact form…</span>`
          : `<span class="t-err">aldo is not in the sudoers file. this incident will be reported.</span>`,
      clear: () => { termBody.innerHTML = ""; return null; },
    };
    const runTermCmd = (raw) => {
      const input = raw.trim();
      if (!input) return;
      printCmd(input);
      const [cmd, ...rest] = input.toLowerCase().split(/\s+/);
      const fn = termCmds[cmd];
      if (fn) {
        const out = fn(rest.join(" "));
        if (out) print(out);
        if (cmd === "sudo" && rest.join(" ").includes("hire"))
          setTimeout(() => document.querySelector("#contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), 900);
      } else {
        print(`<span class="t-err">command not found: ${esc(cmd)}</span> <span class="t-dim">— try “help”</span>`);
      }
    };
    termForm.addEventListener("submit", (e) => {
      e.preventDefault();
      runTermCmd(termInput.value);
      termInput.value = "";
    });
    // clicking anywhere in the terminal focuses the input
    termBody.addEventListener("click", () => termInput.focus());

    // autoplay session on first scroll into view
    const session = [
      { cmd: "whoami", out: termCmds.whoami() },
      { cmd: "cat about.txt", out: termCmds.about() },
      { cmd: "languages --list", out: termCmds.languages() },
    ];
    const playSession = () => {
      if (reduced) {
        session.forEach((s) => { printCmd(s.cmd); print(s.out); });
        print(`<span class="t-dim">— interactive: type “help” below —</span>`);
        return;
      }
      let si = 0;
      const nextCmd = () => {
        if (si >= session.length) {
          print(`<span class="t-dim">— interactive: type “help” below —</span>`);
          return;
        }
        const s = session[si++];
        let ci = 0;
        const line = document.createElement("div");
        line.innerHTML = `<span class="t-dim">$</span> <span class="t-cmd"></span>`;
        termBody.appendChild(line);
        const span = line.querySelector(".t-cmd");
        const typer = setInterval(() => {
          span.textContent = s.cmd.slice(0, ++ci);
          termBody.scrollTop = termBody.scrollHeight;
          if (ci >= s.cmd.length) {
            clearInterval(typer);
            setTimeout(() => { print(s.out); setTimeout(nextCmd, 650); }, 260);
          }
        }, 42);
      };
      nextCmd();
    };
    const tio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      tio.disconnect();
      setTimeout(playSession, 300);
    }, { threshold: 0.35 });
    tio.observe(termBody);
  }

  /* ---------- toast ---------- */
  const toast = document.getElementById("toast");
  let toastTimer = null;
  const showToast = (msg, warn) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.toggle("warn", !!warn);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  };

  /* ---------- newswire ---------- */
  const nw = document.getElementById("nw-text");
  if (nw) {
    const headlines = [
      "ORTIZ GRADUATES MRU WITH FINANCE & ECONOMICS MINOR — ANALYSTS BULLISH",
      "DEFEND ML TEAM SHIPS CLASSIFICATION PIPELINE — LEAD 'CONFIDENT IN ROADMAP'",
      "FRESH PREP ALBERTA ACTIVATIONS OUTPERFORM — TEAM LEAD CREDITS CRM DATA",
      "RIOALTO.CA DEPLOYED TO PRODUCTION — FREELANCE CONTRACT SETTLED IN FULL",
      "MRU HACKS PLATFORM SERVES 400+ STUDENTS FOR SECOND CONSECUTIVE YEAR",
      "RATING AGENCIES MOVE ORTIZ TO 'STRONG HIRE' — PRICE TARGET RAISED",
    ];
    if (reduced) {
      nw.textContent = headlines[0];
    } else {
      let hi = 0;
      const typeLine = () => {
        const line = headlines[hi % headlines.length];
        hi++;
        let i = 0;
        const t = setInterval(() => {
          nw.textContent = line.slice(0, ++i);
          if (i >= line.length) {
            clearInterval(t);
            setTimeout(typeLine, 4200);
          }
        }, 18);
      };
      typeLine();
    }
  }

  /* ---------- command palette ---------- */
  const palette = document.getElementById("palette");
  const field = document.getElementById("palette-field");
  const list = document.getElementById("palette-list");
  const paletteBtn = document.getElementById("palette-btn");
  if (palette && field && list) {
    const go = (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    const commands = [
      { key: "about", desc: "company profile", run: () => go("#about") },
      { key: "skills", desc: "the watchlist", run: () => go("#skills") },
      { key: "projects", desc: "current holdings", run: () => go("#projects") },
      { key: "experience", desc: "order history", run: () => go("#experience") },
      { key: "contact", desc: "place an order", run: () => go("#contact") },
      { key: "resume", desc: "open resume.pdf", run: () => window.open("assets/resume.pdf", "_blank") },
      { key: "github", desc: "github.com/Aldo140", run: () => window.open("https://github.com/Aldo140", "_blank") },
      { key: "linkedin", desc: "aldo-ortiz14", run: () => window.open("https://www.linkedin.com/in/aldo-ortiz14/", "_blank") },
      { key: "email", desc: "aldoortiz14@gmail.com", run: () => { location.href = "mailto:aldoortiz14@gmail.com"; } },
      { key: "top", desc: "back to the chart", run: () => go("#top") },
      { key: "hire", desc: "market order · fills instantly", run: () => { showToast("✓ ORDER FILLED — SETTLE VIA CONTACT FORM"); go("#contact"); } },
      { key: "buy", desc: "alias of hire", run: () => { showToast("✓ ORDER FILLED — SETTLE VIA CONTACT FORM"); go("#contact"); } },
      { key: "sell", desc: "try it", run: () => showToast("✕ ORDER REJECTED — ALDO IS NOT FOR SALE", true) },
      { key: "reboot", desc: "replay boot sequence", run: () => { sessionStorage.removeItem("ao-boot"); location.reload(); } },
    ];
    let filtered = commands;
    let sel = 0;
    const render = () => {
      list.innerHTML = filtered
        .map((c, i) =>
          `<li role="option" class="${i === sel ? "sel" : ""}" data-i="${i}">` +
          `<span class="pl-key">${c.key}</span><span class="pl-desc">${c.desc}</span></li>`)
        .join("");
    };
    const openPal = () => {
      palette.hidden = false;
      field.value = "";
      filtered = commands;
      sel = 0;
      render();
      field.focus();
    };
    const closePal = () => { palette.hidden = true; };
    const exec = () => {
      const c = filtered[sel];
      if (!c) return;
      closePal();
      c.run();
    };
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        palette.hidden ? openPal() : closePal();
      } else if (e.key === "/" && palette.hidden && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        openPal();
      } else if (!palette.hidden) {
        if (e.key === "Escape") closePal();
        else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
        else if (e.key === "Enter") { e.preventDefault(); exec(); }
      }
    });
    field.addEventListener("input", () => {
      const q = field.value.trim().toLowerCase();
      filtered = commands.filter((c) => c.key.includes(q) || c.desc.includes(q));
      sel = 0;
      render();
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-i]");
      if (!li) return;
      sel = +li.dataset.i;
      exec();
    });
    palette.addEventListener("click", (e) => { if (e.target === palette) closePal(); });
    if (paletteBtn) paletteBtn.addEventListener("click", openPal);
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-magnet]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.18;
        const dy = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }
})();
