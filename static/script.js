/* ══════════════════════════════════════════
   SEO OPTIMIZER AI — Premium Script
   ══════════════════════════════════════════ */

"use strict";

/* ─── STATE ─── */
let scoreChart = null;
let barChart   = null;

/* ─── ANALYZE STEPS (for overlay) ─── */
const STEPS = [
  "Initializing AI engine",
  "Fetching page content",
  "Running content analysis",
  "Auditing SEO signals",
  "Scanning security headers",
  "Evaluating frontend performance",
  "Calculating scores",
  "Generating insights",
  "Compiling report",
  "Finalizing audit"
];

/* ═══════════════════════════════════════
   SCROLL
═══════════════════════════════════════ */
function scrollToAnalyze() {
  document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth" });
}

/* ═══════════════════════════════════════
   ANALYZING OVERLAY
═══════════════════════════════════════ */
function showOverlay() {
  const overlay = document.getElementById("analyzingOverlay");
  const fill    = document.getElementById("progressFill");
  const pct     = document.getElementById("progressPct");
  const step    = document.getElementById("analyzeStep");

  if (!overlay) return;
  overlay.classList.remove("hidden");

  let progress  = 0;
  let stepIndex = 0;

  const interval = setInterval(() => {
    // Step up progress non-linearly (slows near 90)
    const remaining = 90 - progress;
    const increment = Math.max(0.5, remaining * 0.06);
    progress = Math.min(90, progress + increment);

    fill.style.width  = progress + "%";
    pct.innerText     = Math.round(progress) + "%";

    // Cycle through step messages
    const newStep = Math.floor((progress / 90) * (STEPS.length - 1));
    if (newStep !== stepIndex) {
      stepIndex = newStep;
      step.style.opacity = "0";
      setTimeout(() => {
        step.innerText    = STEPS[stepIndex] || STEPS[STEPS.length - 1];
        step.style.opacity = "1";
      }, 200);
    }

    if (progress >= 90) clearInterval(interval);
  }, 60);

  overlay._interval = interval;
}

function completeOverlay(cb) {
  const overlay = document.getElementById("analyzingOverlay");
  const fill    = document.getElementById("progressFill");
  const pct     = document.getElementById("progressPct");
  const step    = document.getElementById("analyzeStep");

  if (!overlay) { cb?.(); return; }

  if (overlay._interval) clearInterval(overlay._interval);

  fill.style.width  = "100%";
  pct.innerText     = "100%";
  step.innerText    = "✅ Audit complete";

  setTimeout(() => {
    overlay.classList.add("hidden");
    cb?.();
  }, 700);
}

function hideOverlay() {
  const overlay = document.getElementById("analyzingOverlay");
  if (!overlay) return;
  if (overlay._interval) clearInterval(overlay._interval);
  overlay.classList.add("hidden");
}

/* ═══════════════════════════════════════
   STATUS
═══════════════════════════════════════ */
function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.innerText = msg;
}

/* ═══════════════════════════════════════
   MAIN ANALYZE
═══════════════════════════════════════ */
async function analyze() {
  const urlInput = document.getElementById("urlInput");
  if (!urlInput) return;
  const url = urlInput.value.trim();

  if (!url) { setStatus("⚠️ Please enter a URL"); return; }

  // Basic URL validation
  try { new URL(url); }
  catch { setStatus("⚠️ Please enter a valid URL (include https://)"); return; }

  // Hide old results
  const results = document.getElementById("results");
  results?.classList.add("hidden");

  showOverlay();
  setStatus("Analyzing…");

  try {
    const res  = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (data.status !== "success") {
      hideOverlay();
      setStatus("❌ " + (data.message || "Server error"));
      return;
    }

    const r = data.data;

    /* ── Extract scores (handle nested + flat) ── */
    const c   = r.content_report?.score_after  ?? r.content_score  ?? 0;
    const s   = r.seo_report?.score_after       ?? r.seo_score      ?? 0;
    const sec = r.security_report?.score_after  ?? r.security_score ?? 0;
    const f   = r.frontend_report?.score_after  ?? r.frontend_score ?? 0;
    const overall = Math.round((c + s + sec + f) / 4);

    completeOverlay(() => {
      results?.classList.remove("hidden");
      results?.scrollIntoView({ behavior: "smooth", block: "start" });

      renderScoreChart(overall);
      renderBarChart(c, s, sec, f);
      animateBars(c, s, sec, f);
      renderInsights(r, overall);
      renderIssues(r);
      renderScoreGrade(overall);

      setStatus("✅ Analysis complete — report ready!");

      // Auto-download after short delay
      setTimeout(() => downloadReport(), 1800);
    });

  } catch (err) {
    console.error(err);
    hideOverlay();
    setStatus("❌ Could not reach server. Please try again.");
  }
}

/* ═══════════════════════════════════════
   SCORE GRADE
═══════════════════════════════════════ */
function renderScoreGrade(score) {
  const grade   = document.getElementById("scoreGrade");
  const verdict = document.getElementById("scoreVerdict");

  if (!grade || !verdict) return;

  if (score >= 90) {
    grade.innerText   = "A+";
    verdict.innerText = "🚀 Excellent — Your site is highly optimized!";
  } else if (score >= 80) {
    grade.innerText   = "A";
    verdict.innerText = "✅ Great — Minor improvements recommended.";
  } else if (score >= 70) {
    grade.innerText   = "B";
    verdict.innerText = "⚡ Good — A few areas need attention.";
  } else if (score >= 60) {
    grade.innerText   = "C";
    verdict.innerText = "⚠️ Fair — Several issues require fixing.";
  } else {
    grade.innerText   = "D";
    verdict.innerText = "🔴 Poor — Critical issues detected. Act now!";
  }
}

/* ═══════════════════════════════════════
   DOUGHNUT CHART
═══════════════════════════════════════ */
function renderScoreChart(score) {
  const canvas = document.getElementById("scoreChart");
  if (!canvas) return;

  if (scoreChart) { scoreChart.destroy(); scoreChart = null; }

  const ctx = canvas.getContext("2d");

  scoreChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [
          createGradient(ctx, canvas, ["#6366f1", "#22d3ee"]),
          getComputedStyle(document.documentElement).getPropertyValue("--bg2").trim() || "#e8eaf2"
        ],
        borderWidth: 0,
        borderRadius: 4,
        hoverOffset: 4
      }]
    },
    options: {
      cutout: "72%",
      animation: { animateRotate: true, duration: 1200, easing: "easeOutQuart" },
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });

  /* Animate the number */
  animateNumber("scoreText", 0, score, 1200);
}

/* ═══════════════════════════════════════
   BAR CHART
═══════════════════════════════════════ */
function renderBarChart(c, s, sec, f) {
  const canvas = document.getElementById("barChart");
  if (!canvas) return;

  if (barChart) { barChart.destroy(); barChart = null; }

  const ctx = canvas.getContext("2d");
  const grad = createGradient(ctx, canvas, ["#6366f1", "#22d3ee"], "horizontal");

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Content", "SEO", "Security", "Frontend"],
      datasets: [{
        data: [c, s, sec, f],
        backgroundColor: [
          "rgba(99,102,241,0.85)",
          "rgba(52,211,153,0.85)",
          "rgba(251,146,60,0.85)",
          "rgba(34,211,238,0.85)"
        ],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      animation: { duration: 1000, easing: "easeOutQuart" },
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: "rgba(10,15,30,0.9)",
        titleColor: "#e8eaf6",
        bodyColor: "#8892b0",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: ctx => ` Score: ${ctx.parsed.y}/100`
        }
      }},
      scales: {
        y: {
          beginAtZero: true, max: 100,
          grid: { color: "rgba(99,102,241,0.07)" },
          ticks: { color: "#8892aa", font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#8892aa", font: { size: 11 } }
        }
      }
    }
  });
}

/* ═══════════════════════════════════════
   ANIMATED BARS
═══════════════════════════════════════ */
function animateBars(c, s, sec, f) {
  const pairs = [
    ["contentBar",  "contentScore",  c],
    ["seoBar",      "seoScore",      s],
    ["securityBar", "securityScore", sec],
    ["frontendBar", "frontendScore", f]
  ];

  pairs.forEach(([barId, scoreId, val], i) => {
    setTimeout(() => {
      const bar   = document.getElementById(barId);
      const score = document.getElementById(scoreId);
      if (bar)   bar.style.width = val + "%";
      if (score) animateNumber(scoreId, 0, val, 1000);
    }, i * 120);
  });
}

/* ═══════════════════════════════════════
   AI INSIGHTS
═══════════════════════════════════════ */
function renderInsights(r, overall) {
  const list = document.getElementById("insightsList");
  if (!list) return;

  list.innerHTML = "";

  const insights = [];

  if (overall >= 90) insights.push("🏆 Exceptional performance — your site is in the top tier.");
  else if (overall >= 75) insights.push("✅ Strong overall performance with room to grow.");
  else if (overall >= 60) insights.push("⚡ Moderate score — focused fixes will make a big difference.");
  else insights.push("🔴 Significant improvements needed across multiple categories.");

  // Per-category advice
  const sc = r.content_report?.score_after  ?? 0;
  const ss = r.seo_report?.score_after       ?? 0;
  const se = r.security_report?.score_after  ?? 0;
  const sf = r.frontend_report?.score_after  ?? 0;

  if (sc < 70)  insights.push("📝 Content quality needs improvement — add depth, keywords & structure.");
  if (ss < 70)  insights.push("🔍 SEO gaps detected — focus on meta tags, headings & link profile.");
  if (se < 70)  insights.push("🛡️ Security vulnerabilities found — review headers & HTTPS config.");
  if (sf < 70)  insights.push("⚡ Frontend performance issues — optimize assets & reduce render-blocking.");

  if (insights.length === 0) insights.push("✨ Everything looks great — keep monitoring!");

  insights.forEach((text, i) => {
    const li = document.createElement("li");
    li.textContent = text;
    li.style.animationDelay = (i * 80) + "ms";
    list.appendChild(li);
  });
}

/* ═══════════════════════════════════════
   ISSUE CARDS
═══════════════════════════════════════ */
function renderIssues(r) {
  const box     = document.getElementById("issuesContainer");
  const summary = document.getElementById("issueSummaryBadges");
  if (!box) return;

  box.innerHTML = "";

  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  let found = false;

  const CATEGORIES = ["content", "seo", "security", "frontend"];

  CATEGORIES.forEach(cat => {
    const issues = r[cat + "_report"]?.issues ?? [];

    issues.forEach((issue, idx) => {
      found = true;

      const sev = (issue.severity || "LOW").toUpperCase();
      if (counts[sev] !== undefined) counts[sev]++;

      const card = document.createElement("div");
      card.className = `issue-card severity-${sev.toLowerCase()}`;
      card.style.animationDelay = (idx * 60) + "ms";

      card.innerHTML = `
        <div class="issue-card-top">
          <span class="issue-title">${escHtml(issue.title || "Untitled Issue")}</span>
          <span class="sev-badge ${sev}">${sev}</span>
          <span class="cat-badge">${cat.toUpperCase()}</span>
        </div>
        <p class="issue-desc">${escHtml(issue.suggestion || issue.description || "")}</p>
      `;

      box.appendChild(card);
    });
  });

  if (!found) {
    box.innerHTML = `<p class="issue-placeholder">✅ No issues detected — your site is clean!</p>`;
  }

  /* ── Summary badges ── */
  if (summary) {
    summary.innerHTML = "";
    Object.entries(counts).forEach(([sev, count]) => {
      if (count > 0) {
        const badge = document.createElement("span");
        badge.className = `issue-count-badge ${sev.toLowerCase()}`;
        badge.textContent = `${count} ${sev}`;
        summary.appendChild(badge);
      }
    });
  }
}

/* ═══════════════════════════════════════
   DOWNLOAD REPORT
═══════════════════════════════════════ */
function downloadReport() {
  // Trigger Flask /download endpoint
  const link = document.createElement("a");
  link.href  = "/download";
  link.setAttribute("download", "seo_audit_report.pdf");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ═══════════════════════════════════════
   DARK MODE
═══════════════════════════════════════ */
document.getElementById("themeToggle")?.addEventListener("change", e => {
  document.body.classList.toggle("dark", e.target.checked);
  // Persist preference
  localStorage.setItem("theme", e.target.checked ? "dark" : "light");

  // Redraw charts for dark bg
  const scoreText = document.getElementById("scoreText");
  if (scoreText && scoreText.innerText !== "0") {
    setTimeout(() => {
      const score = parseInt(scoreText.innerText) || 0;
      renderScoreChart(score);
    }, 100);
  }
});

// Apply saved theme on load
(function applyTheme() {
  const saved  = localStorage.getItem("theme");
  const toggle = document.getElementById("themeToggle");
  if (saved === "dark") {
    document.body.classList.add("dark");
    if (toggle) toggle.checked = true;
  }
})();

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */

/** Animate a number from start → end */
function animateNumber(elId, start, end, duration) {
  const el = document.getElementById(elId);
  if (!el) return;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const val = Math.round(start + (end - start) * easeOutQuart(t));
    el.innerText = val;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

/** Create a canvas gradient */
function createGradient(ctx, canvas, colors, direction = "vertical") {
  const w = canvas.width  || 300;
  const h = canvas.height || 300;
  const grad = direction === "horizontal"
    ? ctx.createLinearGradient(0, 0, w, 0)
    : ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  return grad;
}

/** Escape HTML for safe innerHTML injection */
function escHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}