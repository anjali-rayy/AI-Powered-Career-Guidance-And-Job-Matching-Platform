const questions = [
  { type:"radio",    text:"What type of work environment energizes you the most?",    options:["Collaborative team environment","Independent remote work","Dynamic startup atmosphere","Structured corporate setting"] },
  { type:"slider",   text:"How much do you enjoy solving complex problems?",           min:1, max:10, default:5, labels:["1 (Low)","10 (High)"] },
  { type:"checkbox", text:"Which activities do you find most engaging?",               hint:"Select all that apply:", options:["Creating and designing","Analyzing data and patterns","Leading and managing teams","Building and coding","Teaching and mentoring","Researching and exploring"] },
  { type:"slider",   text:"Rate your communication and presentation skills",           min:1, max:10, default:5, labels:["1 (Low)","10 (High)"] },
  { type:"checkbox", text:"What aspects of work give you the most satisfaction?",     hint:"Select all that apply:", options:["Making a positive impact","Learning new things","Earning good money","Having flexibility","Being recognized","Working with technology"] },
  { type:"radio",    text:"Which subject area excites you the most?",                  options:["Technology & Engineering","Business & Finance","Arts & Design","Science & Research"] },
  { type:"slider",   text:"How comfortable are you with taking risks and uncertainty?",min:1, max:10, default:5, labels:["1 (Low)","10 (High)"] },
  { type:"radio",    text:"Where do you see yourself in 5 years?",                    options:["Leading a team or company","Deep technical expert","Creative director or designer","Researcher or academic"] }
];

let current = 0;
const answers = new Array(questions.length).fill(null);

// ─────────────────────────────────────────────
// SCORING ENGINE
// Each career has per-question signal rules.
// Points accumulate; final score is normalized
// to a 40–99 range so results always look
// meaningful rather than 0% / 100%.
// ─────────────────────────────────────────────

const CAREER_SIGNALS = {
  "Frontend Engineer": {
    // Q0 radio: startup(2) or remote(1) preferred
    q0: { type:"radio", points:{ 0:1, 1:2, 2:3, 3:0 } },
    // Q1 slider: solving complex problems matters
    q1: { type:"slider", weight: 1.2 },
    // Q2 checkbox: "Building and coding"(idx 3), "Creating and designing"(idx 0)
    q2: { type:"checkbox", bonusIdxs:[3,0], bonusPer:3 },
    // Q3 slider: communication matters less
    q3: { type:"slider", weight: 0.4 },
    // Q4 checkbox: "Working with technology"(idx 5), "Learning new things"(idx 1)
    q4: { type:"checkbox", bonusIdxs:[5,1], bonusPer:3 },
    // Q5 radio: Technology(0) is perfect
    q5: { type:"radio", points:{ 0:5, 1:1, 2:2, 3:0 } },
    // Q6 slider: risk tolerance moderate
    q6: { type:"slider", weight: 0.7 },
    // Q7 radio: deep technical expert(1) or creative(2)
    q7: { type:"radio", points:{ 0:1, 1:5, 2:3, 3:0 } }
  },

  "Product Designer": {
    q0: { type:"radio", points:{ 0:2, 1:1, 2:3, 3:0 } },
    q1: { type:"slider", weight: 0.6 },
    // "Creating and designing"(0), "Leading and managing teams"(2)
    q2: { type:"checkbox", bonusIdxs:[0,2], bonusPer:3 },
    q3: { type:"slider", weight: 1.2 },
    // "Making a positive impact"(0), "Being recognized"(4)
    q4: { type:"checkbox", bonusIdxs:[0,4], bonusPer:3 },
    q5: { type:"radio", points:{ 0:2, 1:1, 2:5, 3:0 } },
    q6: { type:"slider", weight: 0.8 },
    q7: { type:"radio", points:{ 0:2, 1:1, 2:5, 3:0 } }
  },

  "Data Analyst": {
    q0: { type:"radio", points:{ 0:1, 1:3, 2:1, 3:2 } },
    q1: { type:"slider", weight: 1.5 },
    // "Analyzing data and patterns"(1), "Researching and exploring"(5)
    q2: { type:"checkbox", bonusIdxs:[1,5], bonusPer:3 },
    q3: { type:"slider", weight: 0.5 },
    // "Learning new things"(1), "Earning good money"(2)
    q4: { type:"checkbox", bonusIdxs:[1,2], bonusPer:3 },
    q5: { type:"radio", points:{ 0:1, 1:2, 2:0, 3:5 } },
    q6: { type:"slider", weight: 0.6 },
    q7: { type:"radio", points:{ 0:0, 1:3, 2:0, 3:5 } }
  },

  "Backend Developer": {
    q0: { type:"radio", points:{ 0:1, 1:3, 2:2, 3:2 } },
    q1: { type:"slider", weight: 1.4 },
    // "Building and coding"(3), "Analyzing data and patterns"(1)
    q2: { type:"checkbox", bonusIdxs:[3,1], bonusPer:3 },
    q3: { type:"slider", weight: 0.3 },
    // "Working with technology"(5), "Earning good money"(2)
    q4: { type:"checkbox", bonusIdxs:[5,2], bonusPer:3 },
    q5: { type:"radio", points:{ 0:4, 1:1, 2:0, 3:2 } },
    q6: { type:"slider", weight: 0.9 },
    q7: { type:"radio", points:{ 0:2, 1:5, 2:0, 3:1 } }
  }
};

function calcCareerScore(careerKey) {
  const signals = CAREER_SIGNALS[careerKey];
  let total = 0;
  let maxPossible = 0;

  answers.forEach((ans, i) => {
    const key = "q" + i;
    const sig = signals[key];
    if (!sig) return;
    const q = questions[i];

    if (sig.type === "slider") {
      const val = (ans !== null ? ans : q.default);
      total      += val * sig.weight;
      maxPossible += 10 * sig.weight;

    } else if (sig.type === "radio") {
      if (ans !== null) {
        total      += sig.points[ans] || 0;
        maxPossible += Math.max(...Object.values(sig.points));
      } else {
        maxPossible += Math.max(...Object.values(sig.points));
      }

    } else if (sig.type === "checkbox") {
      const selected = Array.isArray(ans) ? ans : [];
      const matches  = selected.filter(idx => sig.bonusIdxs.includes(idx)).length;
      total      += matches * sig.bonusPer;
      maxPossible += sig.bonusIdxs.length * sig.bonusPer;
    }
  });

  if (maxPossible === 0) return 50;

  // Normalize to 40–99 range so it always looks meaningful
  const raw = total / maxPossible;        // 0.0 → 1.0
  return Math.round(40 + raw * 59);       // 40 → 99
}

function showResult() {
  document.getElementById("quiz-topbar").style.display  = "none";
  document.getElementById("progress-wrap").style.display = "none";

  // Calculate real scores for each career
  const careerScores = Object.keys(CAREER_SIGNALS)
    .map(name => ({ name, score: calcCareerScore(name) }))
    .sort((a, b) => b.score - a.score);   // highest first

  // Persist for quiz-results.html to read
  localStorage.setItem("quizCareerScores", JSON.stringify(careerScores));
  localStorage.setItem("quizAnswers",       JSON.stringify(answers));

  // Navigate to results page (same folder as quiz-assessment.html)
  window.location.href = "quiz-results.html";
}

// ─────────────────────────────────────────────
// RENDER ENGINE  (unchanged from original)
// ─────────────────────────────────────────────
function render() {
  if (current >= questions.length) { showResult(); return; }
  const q = questions[current];
  const displayPct = Math.max(13, Math.round(((current + 1) / questions.length) * 100));

  document.getElementById("q-counter").textContent        = "Question " + (current + 1) + " of " + questions.length;
  document.getElementById("q-percent").textContent        = displayPct + "% Complete";
  document.getElementById("progress-fill").style.width    = displayPct + "%";

  let html = "<div class='q-text'>" + q.text + "</div>";
  if (q.hint) html += "<div class='q-hint'>" + q.hint + "</div>";

  if (q.type === "radio") {
    html += "<div class='options-grid'>";
    q.options.forEach((opt, i) => {
      const sel = answers[current] === i ? "selected" : "";
      html += "<label class='opt-label " + sel + "' onclick='selectRadio(" + i + ",this)'><div class='opt-circle'><div class='opt-circle-inner'></div></div>" + opt + "</label>";
    });
    html += "</div>";

  } else if (q.type === "checkbox") {
    const saved = Array.isArray(answers[current]) ? answers[current] : [];
    html += "<div class='options-grid'>";
    q.options.forEach((opt, i) => {
      const sel = saved.includes(i) ? "selected" : "";
      html += "<label class='opt-label " + sel + "' onclick='toggleCheck(" + i + ",this)'><div class='opt-square'><svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg></div>" + opt + "</label>";
    });
    html += "</div>";

  } else if (q.type === "slider") {
    const val = answers[current] !== null ? answers[current] : q.default;
    html += "<div class='slider-wrap'><input type='range' class='quiz-slider' id='quiz-slider' min='" + q.min + "' max='" + q.max + "' value='" + val + "' oninput='updateSlider(this.value)'/><div class='slider-labels'><span>" + q.labels[0] + "</span><span>" + q.labels[1] + "</span></div><div class='slider-val' id='slider-display'>" + val + "</div></div>";
  }

  document.getElementById("quiz-body").innerHTML =
    "<div class='q-card'>" + html + "</div>" +
    "<div class='quiz-nav'>" +
      "<button class='quiz-back-btn' onclick='goBack()' " + (current === 0 ? "disabled" : "") + ">← Previous</button>" +
      "<button class='quiz-next-btn' onclick='goNext()'>" + (current === questions.length - 1 ? "See Results" : "Next") + " →</button>" +
    "</div>" +
    "<div class='quiz-hub-link'>← <a href='quiz.html'>Back to Quiz Hub</a></div>";
}

function selectRadio(i, el) {
  answers[current] = i;
  document.querySelectorAll(".opt-label").forEach(l => l.classList.remove("selected"));
  el.classList.add("selected");
}

function toggleCheck(i, el) {
  if (!Array.isArray(answers[current])) answers[current] = [];
  const idx = answers[current].indexOf(i);
  if (idx === -1) { answers[current].push(i); el.classList.add("selected"); }
  else            { answers[current].splice(idx, 1); el.classList.remove("selected"); }
}

function updateSlider(val) {
  answers[current] = parseInt(val);
  document.getElementById("slider-display").textContent = val;
}

function goNext() {
  const q = questions[current];
  if (q.type === "slider" && answers[current] === null) answers[current] = q.default;
  if (q.type === "radio" && answers[current] === null) { showToast("Please select an option to continue"); return; }
  if (q.type === "checkbox" && (!Array.isArray(answers[current]) || answers[current].length === 0)) { showToast("Please select at least one option"); return; }
  current++;
  render();
}

function goBack() {
  if (current > 0) { current--; render(); }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

document.addEventListener("DOMContentLoaded", render);