const slides = [...document.querySelectorAll(".slide")];
const agendaLinks = [...document.querySelectorAll(".agenda a")];
const notesPanel = document.getElementById("notes");
const notesBody = document.getElementById("notes-body");
const progress = document.getElementById("progress-bar");
const counter = document.getElementById("counter");
const clockEl = document.getElementById("clock");

let index = 0;
let startedAt = null;
let clockTimer = null;

function go(to) {
  index = Math.max(0, Math.min(slides.length - 1, to));
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  const current = slides[index];
  const segment = current.dataset.segment;
  agendaLinks.forEach((link) => link.classList.toggle("current", link.dataset.segment === segment));
  progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  counter.textContent = `${index + 1} / ${slides.length}`;
  notesBody.innerHTML = current.querySelector(".speaker-notes")?.innerHTML ?? "<p>No notes on this slide.</p>";
  location.hash = `slide-${index + 1}`;
}

function fromHash() {
  const match = location.hash.match(/slide-(\d+)/);
  go(match ? Number(match[1]) - 1 : 0);
}

document.getElementById("prev").addEventListener("click", () => go(index - 1));
document.getElementById("next").addEventListener("click", () => go(index + 1));
document.getElementById("toggle-notes").addEventListener("click", () => notesPanel.classList.toggle("open"));

document.getElementById("toggle-clock").addEventListener("click", () => {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
    return;
  }
  startedAt = startedAt ?? Date.now();
  clockTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    clockEl.textContent = `${m}:${s} / 90:00`;
  }, 500);
});

window.addEventListener("keydown", (event) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    go(index + 1);
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    go(index - 1);
  } else if (event.key.toLowerCase() === "n") {
    notesPanel.classList.toggle("open");
  } else if (event.key === "Home") go(0);
  else if (event.key === "End") go(slides.length - 1);
});

agendaLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = slides.findIndex((slide) => slide.dataset.segment === link.dataset.segment);
    go(target);
  });
});

document.querySelectorAll(".flip").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("is-flipped"));
});

function bindLab(rootId, storageKey, expertHtml) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const list = root.querySelector(".findings");
  const state = JSON.parse(localStorage.getItem(storageKey) ?? '{"findings":[],"score":null}');

  const render = () => {
    list.innerHTML = state.findings
      .map(
        (finding, i) =>
          `<div class="finding"><span class="pill ${finding.severity}">${finding.severity}</span>
           <span class="pill ${finding.theme}">${finding.theme}</span>
           ${finding.text}
           <button class="btn" data-del="${i}" style="margin-left:.5rem">remove</button></div>`
      )
      .join("") || `<p class="muted">Click a highlighted line to log a finding.</p>`;
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  root.querySelectorAll(".diff-line[data-issue]").forEach((line) => {
    line.addEventListener("click", () => {
      const text = prompt("What's wrong on this line, and why does it matter?");
      if (!text) return;
      line.classList.add("flagged");
      state.findings.push({
        text,
        theme: line.dataset.theme,
        severity: line.dataset.severity,
      });
      render();
    });
  });

  list.addEventListener("click", (event) => {
    if (event.target.dataset.del !== undefined) {
      state.findings.splice(Number(event.target.dataset.del), 1);
      render();
    }
  });

  root.querySelectorAll("[data-score]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.score = Number(btn.dataset.score);
      root.querySelector(".score-readout").textContent = `Your score: ${state.score}/5`;
      localStorage.setItem(storageKey, JSON.stringify(state));
    });
  });

  root.querySelector("[data-reveal]")?.addEventListener("click", () => {
    const panel = root.querySelector(".expert");
    panel.classList.remove("hidden");
    panel.innerHTML = expertHtml;
  });

  render();
}

bindLab(
  "lab-a",
  "lab-a",
  `<h3>Expert review — score 2</h3>
   <p>Looks like a complete promo feature. The description is calm. The bugs are in the arithmetic, the catch-all, the missing unique constraint, and tests that never fail.</p>
   <ol>
     <li><strong>Money via double</strong> — blocker, merge. 15% of 249.50 is not 212.08 in this code.</li>
     <li><strong>Usage counter race</strong> — major, release. Two Friday-night requests both pass the max-uses check.</li>
     <li><strong>Tests assert almost nothing</strong> — major, merge. Coverage rose; confidence did not.</li>
   </ol>
   <p class="muted">Also: swallowed Exception, no UNIQUE on code, N+1 in the summary endpoint, BigDecimal.equals on scale.</p>`
);

bindLab(
  "lab-b",
  "lab-b",
  `<h3>Expert review — score 2</h3>
   <p>The template says “pure refactor, low risk”. The deleted lines held the safeguards.</p>
   <ol>
     <li><strong>NOT NULL migration / pending bookings</strong> — blocker, release.</li>
     <li><strong>Retry without idempotency key</strong> — blocker, release. Customers can be charged twice.</li>
     <li><strong>GET dropped the ownership check</strong> — blocker, merge. IDOR.</li>
   </ol>
   <p class="muted">Also: @Transactional on a private method, lost pessimistic lock, PII in INFO logs, renamed JSON field, mock-only tests.</p>`
);

window.addEventListener("hashchange", fromHash);
fromHash();
