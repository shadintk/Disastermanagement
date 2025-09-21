// DisasterPrep demo client-side JS
// Handles small data persistence in localStorage and UI bootstrapping

function escapeHtml(s){ return s ? s.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }) : ''; }

function initDemoUI(){
  // ensure demo seed data exists
  if(!localStorage.getItem('dp_students')){
    const seedStudents = [
      {id: 1, name:'Asha P.', cls:'10A', score:78},
      {id: 2, name:'Rohit K.', cls:'10A', score:92},
      {id: 3, name:'Meera S.', cls:'10B', score:65},
      {id: 4, name:'Vikram L.', cls:'10B', score:54}
    ];
    localStorage.setItem('dp_students', JSON.stringify(seedStudents));
  }
  if(!localStorage.getItem('dp_modules')){
    const modules = [
      {id:'m1', title:'Earthquake Basics', minutes:5, type:'earthquake'},
      {id:'m2', title:'Flood Safety', minutes:6, type:'flood'},
      {id:'m3', title:'Fire Safety', minutes:4, type:'fire'}
    ];
    localStorage.setItem('dp_modules', JSON.stringify(modules));
  }

  // render header user badge if logged in
  const user = JSON.parse(localStorage.getItem('dp_user') || 'null');
  const badge = document.getElementById('user-badge');
  if(badge){
    badge.innerText = user ? `${user.name} (${user.role})` : 'Not logged in';
  }
  // render quick stats
  const students = JSON.parse(localStorage.getItem('dp_students') || '[]');
  const results = JSON.parse(localStorage.getItem('dp_results') || '[]');
  const avgEl = document.getElementById('avg-preparedness');
  const scEl = document.getElementById('students-count');
  if(avgEl){
    const avg = results.length ? Math.round(results.reduce((s,r)=>s+r.score,0)/results.length) : Math.round(students.reduce((s,n)=>s+(n.score||0),0)/ (students.length||1));
    avgEl.innerText = avg + '%';
  }
  if(scEl) scEl.innerText = students.length;

  // populate modules list on students page
  const modulesList = document.getElementById('modules-list');
  if(modulesList){
    const modules = JSON.parse(localStorage.getItem('dp_modules')||'[]');
    modulesList.innerHTML = '';
    modules.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(m.title)}</strong> — ${m.minutes} min • ${escapeHtml(m.type)} <button class="small" onclick="openModule('${m.id}')">Open</button>`;
      modulesList.appendChild(li);
    });
  }

  // Initialize drill functionality
  const startDrillBtn = document.getElementById('start-drill');
  if (startDrillBtn) {
    startDrillBtn.addEventListener('click', () => {
      const type = document.getElementById('drill-type').value;
      
      // Store the selected drill type in localStorage
      localStorage.setItem('selectedDrillType', type);
      
      // Redirect to drill page
      window.location.href = 'drill.html';
    });
  }

  // populate leaderboard on students page
  const lb = document.getElementById('leaderboard');
  if(lb){
    loadLeaderboard();
  }

  // populate admin results list
  const adminResults = document.getElementById('admin-results');
  if(adminResults){
    const results = JSON.parse(localStorage.getItem('dp_results')||'[]');
    adminResults.innerHTML = '';
    if(results.length===0) adminResults.innerHTML = '<li class="muted">No results yet</li>';
    else results.slice(0,50).forEach(r=>{
      const li = document.createElement('li');
      li.innerText = `${r.template} — ${r.score}% — ${new Date(r.timestamp).toLocaleString()}`;
      adminResults.appendChild(li);
    });
  }

  // render admin widgets counts
  const adminAvg = document.getElementById('admin-avg');
  const adminStudents = document.getElementById('admin-students');
  const adminDrills = document.getElementById('admin-drills');
  if(adminAvg || adminStudents || adminDrills){
    const results = JSON.parse(localStorage.getItem('dp_results')||'[]');
    const students = JSON.parse(localStorage.getItem('dp_students')||'[]');
    const scheduled = JSON.parse(localStorage.getItem('dp_scheduled')||'[]');
    if(adminAvg) adminAvg.innerText = (results.length ? Math.round(results.reduce((s,r)=>s+r.score,0)/results.length) : Math.round(students.reduce((s,n)=>s+(n.score||0),0)/(students.length||1))) + '%';
    if(adminStudents) adminStudents.innerText = students.length;
    if(adminDrills) adminDrills.innerText = scheduled.length;
  }
}

// helper used by teacher planner
function escapeForHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// small helper to open module (demo)
function openModule(id){
  const modules = JSON.parse(localStorage.getItem('dp_modules')||'[]');
  const mod = modules.find(m=>m.id===id);
  if(!mod) return alert('Module not found');
  alert(mod.title + '\\n\\nThis is a demo module. Read the short article and attempt the quick quiz in the full app.');
}
// utility to render admin after actions
function renderAdmin(){
  initDemoUI();
}

// initialise UI on load
document.addEventListener('DOMContentLoaded', ()=>{
  initDemoUI();

  // global keyboard shortcut: press E to go to emergency page (demo)
  document.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase()==='e' && !e.metaKey && !e.ctrlKey){
      window.location.href = 'emergency.html';
    }
  });
});
document.getElementById("year").innerText = new Date().getFullYear();

// Load leaderboard
function loadLeaderboard() {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students.sort((a, b) => b.score - a.score);

  let tbody = document.querySelector("#leaderboard tbody");
  if (tbody) {
    tbody.innerHTML = "";

  students.forEach((s, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.score}</td>
      <td>${s.drills}</td>
      `;
      tbody.appendChild(row);
  });
  }

  // If logged in user exists, show personal score
  let username = localStorage.getItem("currentUser");
  if (username) {
    let me = students.find(s => s.name === username);
    if (me) {
      const scoreElement = document.getElementById("my-score");
      if (scoreElement) {
        scoreElement.innerText = Math.min(100, me.score) + "%";
      }
    }
  }
}
loadLeaderboard();

// Quiz System
const quizData = {
  earthquake: {
    title: "Earthquake Safety Quiz",
    questions: [
      {
        question: "What is the first thing you should do when you feel an earthquake?",
        options: ["Run outside immediately", "Drop, Cover, and Hold On", "Stand in a doorway", "Call 911"],
        correct: 1
      },
      {
        question: "Where is the safest place to be during an earthquake?",
        options: ["Under a sturdy table", "Near windows", "In the basement", "Outside in an open area"],
        correct: 0
      },
      {
        question: "What should you do if you're outside during an earthquake?",
        options: ["Run to the nearest building", "Stay in an open area away from buildings", "Stand under a tree", "Lie flat on the ground"],
        correct: 1
      },
      {
        question: "How long should you stay in your safe position after an earthquake?",
        options: ["Until the shaking stops", "5 minutes", "10 minutes", "Until help arrives"],
        correct: 0
      },
      {
        question: "What should you do after the earthquake stops?",
        options: ["Check for injuries", "Turn on all lights", "Use elevators", "Stay inside only"],
        correct: 0
      }
    ]
  },
  flood: {
    title: "Flood Preparedness Quiz",
    questions: [
      {
        question: "What is the most important thing to do before a flood?",
        options: ["Buy sandbags", "Create an emergency kit", "Move to higher ground", "All of the above"],
        correct: 3
      },
      {
        question: "How much water can sweep away a car?",
        options: ["6 inches", "12 inches", "18 inches", "24 inches"],
        correct: 1
      },
      {
        question: "What should you do if you're caught in rapidly rising water?",
        options: ["Stay in your car", "Move to higher ground immediately", "Wait for rescue", "Swim to safety"],
        correct: 1
      },
      {
        question: "What should you avoid during a flood?",
        options: ["Walking through floodwater", "Driving through floodwater", "Both A and B", "Neither A nor B"],
        correct: 2
      },
      {
        question: "When should you evacuate during a flood?",
        options: ["When water reaches your ankles", "When authorities tell you to", "When your car won't start", "Never"],
        correct: 1
      }
    ]
  },
  fire: {
    title: "Fire Safety Quiz",
    questions: [
      {
        question: "What should you do if you see smoke?",
        options: ["Stay low and crawl", "Run as fast as possible", "Hide under furniture", "Open all windows"],
        correct: 0
      },
      {
        question: "What should you do if a door is hot to touch?",
        options: ["Open it quickly", "Use an alternate exit", "Wait for help", "Break it down"],
        correct: 1
      },
      {
        question: "How often should you test smoke alarms?",
        options: ["Once a year", "Once a month", "Once a week", "Never"],
        correct: 1
      },
      {
        question: "What should you do if your clothes catch fire?",
        options: ["Run around", "Stop, Drop, and Roll", "Jump up and down", "Take them off quickly"],
        correct: 1
      },
      {
        question: "What is the most common cause of house fires?",
        options: ["Cooking", "Electrical problems", "Smoking", "Candles"],
        correct: 0
      }
    ]
  },
  landslide: {
    title: "Landslide Safety Quiz",
    questions: [
      {
        question: "What are warning signs of an impending landslide?",
        options: ["Cracks in the ground", "Tilting trees or fences", "New springs or seeps", "All of the above"],
        correct: 3
      },
      {
        question: "What should you do if you're in a landslide?",
        options: ["Run uphill", "Run downhill", "Stay in your car", "Curl into a ball"],
        correct: 3
      },
      {
        question: "When is the risk of landslides highest?",
        options: ["During heavy rain", "After heavy rain", "During earthquakes", "All of the above"],
        correct: 3
      },
      {
        question: "What should you do if you're driving and see a landslide?",
        options: ["Speed up to get through", "Stop and turn around", "Drive slowly through", "Honk your horn"],
        correct: 1
      },
      {
        question: "How can you prepare for landslides?",
        options: ["Plant trees on slopes", "Avoid building on steep slopes", "Install drainage systems", "All of the above"],
        correct: 3
      }
    ]
  }
};

let currentQuiz = null;
let currentQuestion = 0;
let userAnswers = [];
let quizScore = 0;

function startQuiz(moduleType) {
  currentQuiz = quizData[moduleType];
  currentQuestion = 0;
  userAnswers = [];
  quizScore = 0;
  
  document.getElementById('quiz-title').textContent = currentQuiz.title;
  document.getElementById('quiz-modal').style.display = 'block';
  
  showQuestion();
}

function showQuestion() {
  const question = currentQuiz.questions[currentQuestion];
  document.getElementById('question-text').textContent = question.question;
  document.getElementById('question-counter').textContent = `Question ${currentQuestion + 1} of 5`;
  
  // Update progress bar
  const progress = ((currentQuestion + 1) / 5) * 100;
  document.getElementById('progress-fill').style.width = progress + '%';
  
  // Clear previous options
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';
  
  // Add options
  question.options.forEach((option, index) => {
    const optionElement = document.createElement('button');
    optionElement.className = 'quiz-option';
    optionElement.textContent = option;
    optionElement.onclick = () => selectAnswer(index);
    optionsContainer.appendChild(optionElement);
  });
  
  // Hide feedback and buttons
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('next-question').style.display = 'none';
  document.getElementById('finish-quiz').style.display = 'none';
}

function selectAnswer(answerIndex) {
  // Remove previous selections
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Select current answer
  document.querySelectorAll('.quiz-option')[answerIndex].classList.add('selected');
  
  // Store answer
  userAnswers[currentQuestion] = answerIndex;
  
  // Show feedback
  const question = currentQuiz.questions[currentQuestion];
  const isCorrect = answerIndex === question.correct;
  const feedback = document.getElementById('quiz-feedback');
  
  if (isCorrect) {
    feedback.textContent = 'Correct! Well done!';
    feedback.className = 'quiz-feedback correct';
    quizScore++;
  } else {
    feedback.textContent = `Incorrect. The correct answer is: ${question.options[question.correct]}`;
    feedback.className = 'quiz-feedback incorrect';
  }
  
  feedback.style.display = 'block';
  
  // Show appropriate button
  if (currentQuestion < 4) {
    document.getElementById('next-question').style.display = 'inline-block';
  } else {
    document.getElementById('finish-quiz').style.display = 'inline-block';
  }
}

function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

function finishQuiz() {
  const percentage = Math.round((quizScore / 5) * 100);
  
  // Show results
  document.getElementById('question-text').textContent = `Quiz Complete!`;
  document.getElementById('quiz-options').innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3>Your Score: ${quizScore}/5 (${percentage}%)</h3>
      <p>${percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep studying!'}</p>
    </div>
  `;
  
  // Update user's preparedness score
  updatePreparednessScore(percentage);
  
  // Hide buttons
  document.getElementById('next-question').style.display = 'none';
  document.getElementById('finish-quiz').style.display = 'none';
  document.getElementById('quiz-feedback').style.display = 'none';
  
  // Show close button
  setTimeout(() => {
    document.getElementById('finish-quiz').style.display = 'inline-block';
    document.getElementById('finish-quiz').textContent = 'Close Quiz';
    document.getElementById('finish-quiz').onclick = closeQuiz;
  }, 2000);
}

function closeQuiz() {
  document.getElementById('quiz-modal').style.display = 'none';
  loadLeaderboard(); // Refresh the leaderboard
}

function updatePreparednessScore(quizPercentage) {
  // Get current user
  const username = localStorage.getItem("currentUser");
  if (!username) return;
  
  // Get students data
  let students = JSON.parse(localStorage.getItem("students")) || [];
  let user = students.find(s => s.name === username);
  
  if (user) {
    // Add quiz score to user's total score
    user.score = (user.score || 0) + Math.round(quizPercentage / 4); // Divide by 4 to balance with other activities
    user.quizzes = (user.quizzes || 0) + 1;
  } else {
    // Create new user if doesn't exist
    user = {
      name: username,
      score: Math.round(quizPercentage / 4),
      drills: 0,
      quizzes: 1
    };
    students.push(user);
  }
  
  localStorage.setItem("students", JSON.stringify(students));
}

// Home page leaderboard functionality
function loadHomeLeaderboard() {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const leaderboardContainer = document.getElementById('home-leaderboard');
  
  if (!leaderboardContainer) return;
  
  // Sort students by score
  const sortedStudents = students.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Clear existing content
  leaderboardContainer.innerHTML = '';
  
  // Show top 5 students
  const topStudents = sortedStudents.slice(0, 5);
  
  if (topStudents.length === 0) {
    leaderboardContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No students yet. Be the first to start learning!</div>';
    return;
  }
  
  topStudents.forEach((student, index) => {
    const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
    const progress = Math.min(100, (student.score || 0));
    
    const studentElement = document.createElement('div');
    studentElement.className = 'leaderboard-item';
    studentElement.innerHTML = `
      <div class="rank ${rankClass}">${index + 1}</div>
      <div class="student-name">${student.name}</div>
      <div class="score">${student.score || 0}</div>
      <div class="progress-bar-mini">
        <div class="progress-fill-mini" style="width: ${progress}%"></div>
      </div>
    `;
    
    leaderboardContainer.appendChild(studentElement);
  });
}

// Update home page stats with animation
function updateHomeStats() {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const results = JSON.parse(localStorage.getItem("dp_results")) || [];
  
  // Calculate average preparedness
  const avgEl = document.getElementById('avg-preparedness');
  const heroAvgEl = document.getElementById('hero-preparedness');
  if (avgEl || heroAvgEl) {
    const avg = results.length ? 
      Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 
      Math.round(students.reduce((s, n) => s + (n.score || 0), 0) / (students.length || 1));
    
    if (avgEl) avgEl.textContent = avg + '%';
    if (heroAvgEl) animateNumber(heroAvgEl, 0, avg, 2000, '%');
  }
  
  // Update student count
  const studentsEl = document.getElementById('students-count');
  const heroStudentsEl = document.getElementById('hero-students');
  if (studentsEl || heroStudentsEl) {
    if (studentsEl) studentsEl.textContent = students.length;
    if (heroStudentsEl) animateNumber(heroStudentsEl, 0, students.length, 2000);
  }
  
  // Calculate modules completed
  const modulesEl = document.getElementById('modules-completed');
  const heroModulesEl = document.getElementById('hero-modules');
  if (modulesEl || heroModulesEl) {
    const totalModules = students.reduce((sum, student) => sum + (student.quizzes || 0), 0);
    if (modulesEl) modulesEl.textContent = totalModules;
    if (heroModulesEl) animateNumber(heroModulesEl, 0, totalModules, 2000);
  }
}

// Animate number counting
function animateNumber(element, start, end, duration, suffix = '') {
  const startTime = performance.now();
  const range = end - start;
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (range * easeOutCubic));
    
    element.textContent = current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Initialize home page
function initHomePage() {
  loadHomeLeaderboard();
  updateHomeStats();
}

// Call initHomePage when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initDemoUI();
  initHomePage();
  initAuth();
});

// Authentication Management
function initAuth() {
  const user = JSON.parse(localStorage.getItem('dp_user') || 'null');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const reportedBtn = document.getElementById('reported-btn');

  if (user) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (reportedBtn) reportedBtn.style.display = 'inline-flex';
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (reportedBtn) reportedBtn.style.display = 'inline-flex';
  }

  // Add logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('dp_user');
      alert('Logged out successfully!');
      window.location.href = 'index.html';
    });
  }
}
