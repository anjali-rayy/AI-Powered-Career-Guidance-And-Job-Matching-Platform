const questions = [
  { type:"radio", text:"What type of work environment energizes you the most?", options:["Collaborative team environment","Independent remote work","Dynamic startup atmosphere","Structured corporate setting"] },
  { type:"slider", text:"How much do you enjoy solving complex problems?", min:1, max:10, default:5, labels:["1 (Low)","10 (High)"] },
  { type:"checkbox", text:"Which activities do you find most engaging?", hint:"Select all that apply:", options:["Creating and designing","Analyzing data and patterns","Leading and managing teams","Building and coding","Teaching and mentoring","Researching and exploring"] },
  { type:"slider", text:"Rate your communication and presentation skills", min:1, max:10, default:5, labels:["1 (Low)","10 (High)"] },
  { type:"checkbox", text:"What aspects of work give you the most satisfaction?", hint:"Select all that apply:", options:["Making a positive impact","Learning new things","Earning good money","Having flexibility","Being recognized","Working with technology"] },
  { type:"radio", text:"Which subject area excites you the most?", options:["Technology & Engineering","Business & Finance","Arts & Design","Science & Research"] },
  { type:"slider", text:"How comfortable are you with taking risks and uncertainty?", min:1, max:10, default:5, labels:["1 (Low)","10 (High)"] },
  { type:"radio", text:"Where do you see yourself in 5 years?", options:["Leading a team or company","Deep technical expert","Creative director or designer","Researcher or academic"] }
];

let current = 0;
const answers = new Array(questions.length).fill(null);

function render() {
  if (current >= questions.length) { showResult(); return; }
  const q = questions[current];
  const displayPct = Math.max(13, Math.round(((current+1)/questions.length)*100));
  document.getElementById("q-counter").textContent = "Question "+(current+1)+" of "+questions.length;
  document.getElementById("q-percent").textContent = displayPct+"% Complete";
  document.getElementById("progress-fill").style.width = displayPct+"%";
  let html = "<div class='q-text'>"+q.text+"</div>";
  if (q.hint) html += "<div class='q-hint'>"+q.hint+"</div>";
  if (q.type === "radio") {
    html += "<div class='options-grid'>";
    q.options.forEach((opt,i) => {
      const sel = answers[current]===i?"selected":"";
      html += "<label class='opt-label "+sel+"' onclick='selectRadio("+i+",this)'><div class='opt-circle'><div class='opt-circle-inner'></div></div>"+opt+"</label>";
    });
    html += "</div>";
  } else if (q.type === "checkbox") {
    const saved = Array.isArray(answers[current])?answers[current]:[];
    html += "<div class='options-grid'>";
    q.options.forEach((opt,i) => {
      const sel = saved.includes(i)?"selected":"";
      html += "<label class='opt-label "+sel+"' onclick='toggleCheck("+i+",this)'><div class='opt-square'><svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg></div>"+opt+"</label>";
    });
    html += "</div>";
  } else if (q.type === "slider") {
    const val = answers[current]!==null?answers[current]:q.default;
    html += "<div class='slider-wrap'><input type='range' class='quiz-slider' id='quiz-slider' min='"+q.min+"' max='"+q.max+"' value='"+val+"' oninput='updateSlider(this.value)'/><div class='slider-labels'><span>"+q.labels[0]+"</span><span>"+q.labels[1]+"</span></div><div class='slider-val' id='slider-display'>"+val+"</div></div>";
  }
  document.getElementById("quiz-body").innerHTML = "<div class='q-card'>"+html+"</div><div class='quiz-nav'><button class='quiz-back-btn' onclick='goBack()' "+(current===0?"disabled":"")+">← Previous</button><button class='quiz-next-btn' onclick='goNext()'>"+(current===questions.length-1?"See Results":"Next")+" →</button></div><div class='quiz-hub-link'>← <a href='quiz.html'>Back to Quiz Hub</a></div>";
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
  else { answers[current].splice(idx, 1); el.classList.remove("selected"); }
}

function updateSlider(val) {
  answers[current] = parseInt(val);
  document.getElementById("slider-display").textContent = val;
}

function goNext() {
  const q = questions[current];
  if (q.type === "slider" && answers[current] === null) answers[current] = q.default;
  if (q.type === "radio" && answers[current] === null) { showToast("Please select an option to continue"); return; }
  current++;
  render();
}

function goBack() {
  if (current > 0) { current--; render(); }
}

function showResult() {
  document.getElementById("quiz-topbar").style.display = "none";
  document.getElementById("progress-wrap").style.display = "none";
  const careers = [
    {icon:"💻", name:"Frontend Engineer",  score:91},
    {icon:"🎨", name:"Product Designer",   score:78},
    {icon:"📊", name:"Data Analyst",       score:63},
    {icon:"⚙️", name:"Backend Developer",  score:54}
  ];
  let rows = "";
  careers.forEach(c => {
    rows += "<div class='result-career-row'><div class='result-career-icon'>"+c.icon+"</div><div class='result-career-name'>"+c.name+"</div><div class='result-career-bar-wrap'><div class='result-career-bar-bg'><div class='result-career-bar-fill' style='width:"+c.score+"%'></div></div><div class='result-career-pct'>"+c.score+"% match</div></div></div>";
  });
  const isLoggedIn = !!localStorage.getItem("userEmail");
  const dashBtn = isLoggedIn
    ? "<a href='dashboard.html'><button class='btn-primary' style='padding:12px 24px;font-size:14px'>View Full Dashboard →</button></a>"
    : "<a href='login.html'><button class='btn-primary' style='padding:12px 24px;font-size:14px'>Sign in to save results →</button></a>";
  document.getElementById("quiz-body").innerHTML = "<div class='result-card'><div class='result-trophy'>🎯</div><div class='result-title'>Your Best <em>Career Matches</em></div><div class='result-sub'>Based on your answers — here are your top career paths</div><div class='result-careers'>"+rows+"</div><div class='result-btns'>"+dashBtn+"<a href='quiz.html'><button class='btn-outline' style='padding:11px 22px;font-size:14px'>Retake Quiz</button></a></div></div><div class='quiz-hub-link' style='margin-top:20px'>← <a href='quiz.html'>Back to Quiz Hub</a></div>";
}

render();