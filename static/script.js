let scoreChart;
let barChart;

// SCROLL
function scrollToAnalyze() {
  document.getElementById("analyze").scrollIntoView({ behavior: "smooth" });
}

// ANALYZE
async function analyze() {
  const url = document.getElementById("urlInput").value;
  const loader = document.getElementById("loader");
  const status = document.getElementById("status");

  if (!url) {
    status.innerText = "⚠️ Please enter URL";
    return;
  }

  loader.classList.remove("hidden");
  status.innerText = "Analyzing...";

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    loader.classList.add("hidden");

    if (data.status !== "success") {
      status.innerText = "❌ " + data.message;
      return;
    }

    const r = data.data;

    const c = r.content_report?.score_after || 0;
    const s = r.seo_report?.score_after || 0;
    const sec = r.security_report?.score_after || 0;
    const f = r.frontend_report?.score_after || 0;

    const overall = Math.round((c + s + sec + f) / 4);

    document.getElementById("results").classList.remove("hidden");

    document.getElementById("scoreText").innerText = overall + "%";

    renderCharts(c, s, sec, f, overall);
    updateBars(c, s, sec, f);
    showIssues(r);

    status.innerText = "✅ Analysis Complete";

  } catch (err) {
    console.error(err);
    loader.classList.add("hidden");
    status.innerText = "❌ Server error";
  }
}

// CHARTS
function renderCharts(c, s, sec, f, o) {

  const scoreCanvas = document.getElementById("scoreChart");
  const barCanvas = document.getElementById("barChart");

  if (!scoreCanvas || !barCanvas) return;

  if (scoreChart) scoreChart.destroy();
  if (barChart) barChart.destroy();

  const ctx1 = scoreCanvas.getContext("2d");

  scoreChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [o, 100 - o],
        backgroundColor: ["#6366f1", "#e5e7eb"],
        borderWidth: 0
      }]
    },
    options: {
      cutout: "70%",
      plugins: { legend: { display: false } }
    }
  });

  const ctx2 = barCanvas.getContext("2d");

  barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Content", "SEO", "Security", "Frontend"],
      datasets: [{
        data: [c, s, sec, f],
        backgroundColor: "#6366f1",
        borderRadius: 8
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// PROGRESS BARS
function updateBars(c, s, sec, f) {
  document.getElementById("contentBar").style.width = c + "%";
  document.getElementById("seoBar").style.width = s + "%";
  document.getElementById("securityBar").style.width = sec + "%";
  document.getElementById("frontendBar").style.width = f + "%";

  document.getElementById("contentScore").innerText = c;
  document.getElementById("seoScore").innerText = s;
  document.getElementById("securityScore").innerText = sec;
  document.getElementById("frontendScore").innerText = f;
}

// ISSUES
function showIssues(r) {
  const box = document.getElementById("issuesContainer");
  if (!box) return;

  box.innerHTML = "";

  let found = false;

  ["content", "seo", "security", "frontend"].forEach(k => {
    const issues = r[k + "_report"]?.issues || [];

    if (issues.length > 0) {
      found = true;

      issues.forEach(i => {
        box.innerHTML += `
          <div class="issue-card">
            <strong>${i.title || "Issue"}</strong>
            <p>Severity: ${i.severity || "N/A"}</p>
            <p>${i.suggestion || ""}</p>
          </div>
        `;
      });
    }
  });

  if (!found) {
    box.innerHTML = "<p>✅ No issues found</p>";
  }
}

// THEME
document.getElementById("themeToggle")?.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});