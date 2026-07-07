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
