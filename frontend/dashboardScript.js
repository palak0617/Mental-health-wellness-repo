/* ------------------ API ENDPOINTS ------------------ */
const BASE_URL = "http://localhost:5000";  // <-- your backend port

const API = {
  user: BASE_URL + "/auth/user",
  mood: BASE_URL + "/api/mood",
  goals: (id) => BASE_URL + `/api/goals/${id}`,
  addGoal: BASE_URL + "/api/goals",
  updateGoal: (id) => BASE_URL + `/api/goals/${id}`,
  gameRecords: (id) => BASE_URL + `/api/game-records/${id}`,
  journal: BASE_URL + "/api/journal",
  dashboard: BASE_URL + "/api/dashboard"
};

const moodScoreMap = {
  excellent: 5,
  good: 4,
  okay: 3,
  poor: 2
};

// ------------------ LOAD USER ------------------

async function loadUser() {
  try {
    const data = await GET("http://localhost:5000/auth/user");

    if (!data || !data.user) {
      console.error("User object missing:", data);
      return null;
    }

    const user = data.user;
    CURRENT_USER = user; 

    // Update UI
    document.getElementById("nav-username").textContent = user.username;
    document.getElementById("user-name-display").textContent = user.username;

    const initials = user.username
      .split(" ")
      .map(w => w[0])
      .join("")
      .toUpperCase();

    document.getElementById("user-avatar").textContent = initials;
    document.getElementById("dashboard-avatar").textContent = initials;

    return user;

  } catch (err) {
    console.error("Failed loading user:", err);
    return null;
  }
}

// ------------------ LOAD DASHBOARD ------------------

async function loadDashboard() {
  const user = await loadUser();
  if (!user) {
    console.error("Dashboard failed: user not loaded.");
    return;
  }

  console.log("Dashboard loading for:", user.username);

  // You can load:
  // - goals
  // - moods
  // - recent activities
  // - game scores
  // - journal entries
  // etc.
}


/* ------------------ FETCH HELPERS ------------------ */

async function GET(url) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) throw new Error(`GET failed: ${url}`);
  return res.json();
}

async function POST(url, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return res.json();
}

async function PATCH(url, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return res.json();
}

function getWellnessMessage(score) {
  if (score >= 80)
    return "You're doing great! Keep maintaining your healthy routine 🌟";
  if (score >= 60)
    return "You're on track, but a short mindfulness break could help 💙";
  if (score >= 40)
    return "You might be feeling a bit low — try a breathing exercise 🌿";
  return "It's okay to have tough days. Let's start small together 🤍";
}

function getMoodSuggestion(mood) {
  const suggestions = {
    excellent: "Boost your focus with a productivity challenge 🚀",
    good: "Try a 5-minute breathing exercise 🌬️",
    okay: "A short mindfulness session can help 🧘",
    poor: "Guided calm breathing may help you relax 🤍"
  };
  return suggestions[mood] || "Take a short wellness break 🌱";
}

function updateStreakMotivation(streak) {
  if (streak >= 7) return "🔥 Amazing! You're building a strong habit!";
  if (streak >= 3) return "👏 Great consistency! Keep going.";
  if (streak > 0) return "🌱 A fresh start today makes a difference.";
  return "Start today — even one step matters 🤍";
}

async function loadPersonalizedWellness() {
  // const data = await GET(`${BASE_URL}/api/dashboard`);


  const dashboard = await GET(API.dashboard);

const score = dashboard.wellnessScore;
const streak = dashboard.streak;
const engagement = dashboard.sessions;
const goalPercent = dashboard.goalCompletion;


  // ----- SCORE TEXT -----
  const scoreEl = document.getElementById("wellness-score");
  if (scoreEl) scoreEl.textContent = score + "%";

  // ----- PROGRESS BAR -----
  const progressEl = document.getElementById("wellness-progress");
  if (progressEl) {
    const visibleScore = score === 0 ? 5 : score;
progressEl.style.width = visibleScore + "%";}


  // ----- STREAK -----
  const streakEl = document.getElementById("streak-count");
  if (streakEl) streakEl.textContent = dashboard.streak || 0;

  // ----- MOTIVATION TEXT (LEFT BOX) -----=
  const sessionEl = document.getElementById("sessions-count");
if (sessionEl)
  sessionEl.textContent = dashboard.sessions || 0;

const streakMsg = document.getElementById("streak-message");
if (streakMsg)
  streakMsg.textContent = updateStreakMotivation(dashboard.streak || 0);


  // ----- GOALS -----
  const goalText = document.getElementById("goal-progress-text");
if (goalText)
  goalText.textContent = `${dashboard.goalCompletion || 0}% done`;

const goalBar = document.getElementById("goal-progress-bar");
if (goalBar)
  goalBar.style.width = (dashboard.goalCompletion || 0) + "%";

const mood = dashboard.todayMood?.mood || "okay";


  // ----- PERSONALIZED MESSAGE -----
  const msgEl = document.getElementById("wellness-message");
  if (msgEl)
    msgEl.textContent = getWellnessMessage(score);

  // ----- SUGGESTION -----
  // const mood = data.todayMood?.mood || "okay";
  const sugEl = document.getElementById("wellness-suggestion");
  if (sugEl)
    sugEl.textContent =
      "Suggested for you today: " + getMoodSuggestion(mood);
}


// function generatePersonalizedReport(data, goals, moods) {
//   const username = CURRENT_USER.username;
//   const generatedOn = new Date().toLocaleString();

//   const score = data.wellnessScore || 0;
//   const streak = data.streak || 0;
//   const mood = data.todayMood?.mood || "okay";

//   const moodMap = {
//     excellent: "😄 Excellent",
//     good: "😊 Good",
//     okay: "😐 Okay",
//     poor: "😔 Needs Attention"
//   };

//   const completedGoals = goals.filter(g => g.completed).length;
//   const totalGoals = goals.length;

//   // ---- PERSONALIZED INSIGHT ----
//   let weeklyInsight = "";
//   if (score >= 75) {
//     weeklyInsight = "You maintained a positive emotional balance this week 🌟";
//   } else if (score >= 50) {
//     weeklyInsight = "Your week was mixed — consistency will help 👍";
//   } else {
//     weeklyInsight = "This week felt heavy — be kind to yourself 💙";
//   }

//   return `
//   <div class="report-print space-y-8">

//     <!-- REPORT HEADER -->
//     <div class="text-center">
//       <h1 class="text-3xl font-bold gradient-text">
//         Mental Wellness Report
//       </h1>
//       <p class="mt-2">Prepared for <b>${username}</b></p>
//       <p class="text-sm opacity-60 mt-1">
//         Generated by <b>Mental Wellness AI</b> • ${generatedOn}
//       </p>
//     </div>

//     <!-- OVERALL SUMMARY -->
//     <div class="glassmorphism p-6 rounded-xl">
//       <h2 class="text-xl font-bold mb-3">Overall Summary</h2>
//       <p><b>Wellness Score:</b> ${score}%</p>
//       <p><b>Day Streak:</b> ${streak} days</p>
//       <p><b>Today's Mood:</b> ${moodMap[mood]}</p>
//     </div>

//     <!-- WEEKLY INSIGHT -->
//     <div class="glassmorphism p-6 rounded-xl">
//       <h2 class="text-xl font-bold mb-3">Weekly Insight</h2>
//       <p>${weeklyInsight}</p>
//     </div>

//     <!-- GOALS SUMMARY -->
//     <div class="glassmorphism p-6 rounded-xl">
//       <h2 class="text-xl font-bold mb-3">Goals Overview</h2>
//       <p>${completedGoals} of ${totalGoals} goals completed</p>
//     </div>

//     <!-- STATIC PROGRESS OVERVIEW -->
//     <div class="glassmorphism p-6 rounded-xl">
//       <h2 class="text-xl font-bold mb-3">Progress Overview</h2>

//       <div class="progress-bar-3d mt-3">
//         <div class="progress-fill-3d bg-gradient-to-r from-lavender to-teal"
//              style="width:70%"></div>
//       </div>

//       <div class="progress-bar-3d mt-3">
//         <div class="progress-fill-3d bg-gradient-to-r from-peach to-lavender"
//              style="width:55%"></div>
//       </div>

//       <p class="text-sm opacity-60 mt-3">
//         This overview is a general wellness structure and is not user-specific.
//       </p>
//     </div>

//   </div>
//   `;
// }


function progressBar(title, value, gradient) {
  return `
    <div class="mb-5">
      <div class="flex justify-between mb-2">
        <span class="font-medium">${title}</span>
        <span class="font-bold">${value}%</span>
      </div>
      <div class="progress-bar-3d">
        <div class="progress-fill-3d bg-gradient-to-r ${gradient}" style="width:${value}%"></div>
      </div>
    </div>
  `;
}


// async function generateReportContent() {

//   const reportContent = document.getElementById("report-content");

//   try {
//     const dashboard = await GET(API.dashboard);
//     const goals = await GET(`${BASE_URL}/api/goals`);
//     const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=7`);

//     const score = dashboard.wellnessScore || 0;
//     const streak = dashboard.streak || 0;

//     const completedGoals = goals.filter(g => g.completed).length;
//     const totalGoals = goals.length;
//     const goalPercent =
//       totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

//     const sessions = moods.length;

//     // reportContent.innerHTML = `
//     // <!-- HEADER -->
//     // <div class="report-header gradient-bg">
//     //   <h2>WellnessAI Personal Report</h2>
//     //   <p>Generated on: ${new Date().toLocaleString()}</p>
//     // </div>

//     // <!-- WELLNESS METRICS -->
//     // <section>
//     //   <h3>Wellness Metrics</h3>

//     //   <div class="metrics-grid">
//     //     <!-- Mental Wellness -->
//     //     <div class="metric-card">
//     //       <h4>Mental Wellness</h4>
//     //       <div class="progress-bar">
//     //         <div style="width:${score}%"></div>
//     //       </div>
//     //       <p>${score}%</p>
//     //     </div>

//     //     <!-- Goal Completion -->
//     //     <div class="metric-card">
//     //       <h4>Goal Completion</h4>
//     //       <div class="progress-bar">
//     //         <div style="width:${goalPercent}%"></div>
//     //       </div>
//     //       <p>${completedGoals}/${totalGoals} (${goalPercent}%)</p>
//     //     </div>

//     //     <!-- Consistency -->
//     //     <div class="metric-card">
//     //       <h4>Consistency</h4>
//     //       <p class="big-number">${streak} days</p>
//     //       <span>Current streak</span>
//     //     </div>
//     //   </div>

//     //   <!-- Engagement -->
//     //   <div class="engagement">
//     //     <h4>Engagement</h4>
//     //     <p class="big-number">${sessions}</p>
//     //     <span>Total sessions this week</span>
//     //   </div>
//     // </section>

//     // <!-- PROGRESS BREAKDOWN (STATIC BY CHOICE) -->
//     // <section>
//     //   <h3>Progress Breakdown</h3>

//     //   <div class="breakdown">
//     //     <div><span>Stress Management</span><span>65%</span></div>
//     //     <div><span>Focus & Concentration</span><span>72%</span></div>
//     //     <div><span>Emotional Balance</span><span>58%</span></div>
//     //     <div><span>Sleep Quality</span><span>81%</span></div>
//     //   </div>
//     // </section>

//     // <!-- RECENT ACTIVITY -->
//     // <section>
//     //   <h3>Recent Activity Timeline</h3>
//     //   ${
//     //     moods.length === 0
//     //       ? "<p>No activity recorded</p>"
//     //       : moods
//     //           .slice(0, 3)
//     //           .map(
//     //             m => `
//     //           <div class="timeline-item">
//     //             <strong>Mood logged:</strong> ${m.mood}
//     //             <span>${new Date(m.createdAt).toLocaleString()}</span>
//     //           </div>
//     //         `
//     //           )
//     //           .join("")
//     //   }
//     // </section>

//     // <!-- PERSONALIZED RECOMMENDATIONS -->
//     // <section>
//     //   <h3>Personalized Recommendations</h3>
//     //   <ul>
//     //     ${score >= 70 ? "<li>Continue daily meditation practice</li>" : ""}
//     //     ${score < 70 ? "<li>Try short breathing exercises</li>" : ""}
//     //     ${streak < 5 ? "<li>Build consistency with daily check-ins</li>" : ""}
//     //   </ul>
//     // </section>

//     // <!-- WEEKLY ACTIVITY PATTERN -->
//     // <section>
//     //   <h3>Weekly Activity Pattern</h3>
//     //   <div class="weekly-bars">
//     //     ${
//     //       moods.reverse().map(
//     //         m => `
//     //       <div class="day-bar">
//     //         <div style="height:${(moodScoreMap[m.mood] || 3) * 20}px"></div>
//     //         <span>${new Date(m.createdAt).toLocaleDateString("en-US",{weekday:"short"})}</span>
//     //       </div>
//     //     `
//     //       ).join("")
//     //     }
//     //   </div>
//     // </section>

//     // <footer class="report-footer">
//     //   Generated by <b>Mental Wellness AI</b>
//     // </footer>
//     // `;

//   } catch (err) {
//     console.error(err);
//     reportContent.innerHTML = "<p>Failed to load report</p>";
//   }
// }


// async function populateReportContent() {
//   const dashboard = await GET(API.dashboard);
//   const goals = await GET(`${BASE_URL}/api/goals`);
//   const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=7`);

//   // -------- VALUES --------
//   const score = dashboard.wellnessScore || 0;
//   const streak = dashboard.streak || 0;

//   const completedGoals = goals.filter(g => g.completed).length;
//   const totalGoals = goals.length;
//   const goalPercent =
//     totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

//   const engagement = moods.length;

//   // -------- WELLNESS METRICS --------
//   document.getElementById("report-wellness-score").textContent = score + "%";
//   document.getElementById("report-wellness-bar").style.width = score + "%";

//   document.getElementById("report-goal-text").textContent =
//     `${completedGoals}/${totalGoals} (${goalPercent}%)`;
//   document.getElementById("report-goal-bar").style.width = goalPercent + "%";

//   document.getElementById("report-streak").textContent = `${streak} days`;
//   document.getElementById("report-engagement").textContent = engagement;

//   // -------- RECOMMENDATIONS --------
//   const recList = document.getElementById("report-recommendations");
//   recList.innerHTML = "";

//   if (score >= 75)
//   recList.innerHTML += `<li>🌟 Your consistency is strong — continue daily meditation</li>`;

// if (score < 75)
//   recList.innerHTML += `<li>🌿 Try short breathing sessions to improve balance</li>`;

// if (streak < 7)
//   recList.innerHTML += `<li>🔥 Aim for a 7-day wellness streak</li>`;

// if (goalPercent < 60)
//   recList.innerHTML += `<li>🎯 Focus on completing pending goals</li>`;

//   // -------- GENERATED DATE --------
//   document.getElementById("report-date").textContent =
//     "Generated on: " + new Date().toLocaleString();
// }

// async function populateReportContent() {
//   // 1️⃣ Get dashboard data (SAME as dashboard cards)
//   const dashboard = await GET(API.dashboard);

//   // 2️⃣ Use dashboard values directly
//   const score = dashboard.wellnessScore || 0;
//   const streak = dashboard.streak || 0;
//   const engagement = dashboard.sessions || 0;
//   const goalPercent = dashboard.goalCompletion || 0;

//   // 3️⃣ Update REPORT UI (THIS IS WHAT YOU ASKED "WHERE?")
//   document.getElementById("report-wellness-score").textContent = score + "%";
//   document.getElementById("report-wellness-bar").style.width = score + "%";

//   document.getElementById("report-streak").textContent = streak + " days";
//   document.getElementById("report-engagement").textContent = engagement;

//   document.getElementById("report-goal-text").textContent =
//     goalPercent + "% completed";
//   document.getElementById("report-goal-bar").style.width =
//     goalPercent + "%";

//   // 4️⃣ Recommendations (keep this)
//   const recList = document.getElementById("report-recommendations");
//   recList.innerHTML = "";

//   if (score >= 75)
//     recList.innerHTML += `<li>🌟 Your consistency is strong — continue daily meditation</li>`;
//   if (score < 75)
//     recList.innerHTML += `<li>🌿 Try short breathing sessions to improve balance</li>`;
//   if (streak < 7)
//     recList.innerHTML += `<li>🔥 Aim for a 7-day wellness streak</li>`;
//   if (goalPercent < 60)
//     recList.innerHTML += `<li>🎯 Focus on completing pending goals</li>`;
// }


// async function loadReportWeeklyChart() {
//   const ctx = document.getElementById("reportWeeklyChart");
//   if (!ctx) return;

//   const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=7`);

//   const labels = [];
//   const data = [];

//   moods.reverse().forEach(m => {
//     labels.push(
//       new Date(m.createdAt).toLocaleDateString("en-US", { weekday: "short" })
//     );
//     data.push(moodScoreMap[m.mood] || 3);
//   });

//   new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels,
//       datasets: [{
//         data,
//         backgroundColor: "#C8B6FF"
//       }]
//     },
//     options: {
//       plugins: { legend: { display: false } },
//       scales: { y: { min: 1, max: 5 } }
//     }
//   });
// }


// async function loadReportTimeline() {
//   const container = document.getElementById("report-timeline");
//   if (!container) return;

//   const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=5`);
//   container.innerHTML = "";

//   if (moods.length === 0) {
//     container.innerHTML = "<p>No recent activity</p>";
//     return;
//   }

//   moods.forEach(m => {
//     container.innerHTML += `
//       <div class="timeline-item">
//         <strong>Mood logged:</strong> ${m.mood}
//         <div class="text-xs opacity-70">
//           ${new Date(m.createdAt).toLocaleString()}
//         </div>
//       </div>
//     `;
//   });
// }

// async function generateAndShowReport() {
//   try {
//     // Ensure user is loaded
//     if (!CURRENT_USER) {
//       await loadUser();
//     }

//     // Fill header info
//     document.getElementById("report-username").textContent =
//       CURRENT_USER.username;

//     document.getElementById("report-date").textContent =
//       "Generated on: " + new Date().toLocaleString();

//     // Load data
//     const dashboard = await GET(`${BASE_URL}/api/dashboard`);
//     const goals = await GET(`${BASE_URL}/api/goals`);
//     const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=7`);

//     // Fill metrics
//     fillReportMetrics(dashboard, goals);
//     fillReportTimeline(moods);
//     fillReportRecommendations(dashboard);
//     drawReportWeeklyChart(moods);

//     // Show modal
//     document.getElementById("report-modal").classList.add("active");

//   } catch (err) {
//     console.error("Report generation failed:", err);
//   }
// }

// function fillReportMetrics(dashboard, goals) {
//   const completed = goals.filter(g => g.completed).length;
//   const total = goals.length;
//   const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

//   // Mental wellness
//   document.getElementById("report-wellness-score").textContent =
//     dashboard.wellnessScore + "%";

//   document.getElementById("report-wellness-bar").style.width =
//     dashboard.wellnessScore + "%";

//   // Goals
//   document.getElementById("report-goal-text").textContent =
//     `${completed}/${total} (${percent}%)`;

//   document.getElementById("report-goal-bar").style.width =
//     percent + "%";

//   // Streak
//   document.getElementById("report-streak").textContent =
//     dashboard.streak + " days";

//   // Engagement
//   document.getElementById("report-engagement").textContent =
//     dashboard.sessions || 0;
// }


// function fillReportTimeline(moods) {
//   const container = document.getElementById("report-timeline");
//   container.innerHTML = "";

//   if (moods.length === 0) {
//     container.innerHTML = "<p>No recent activity</p>";
//     return;
//   }

//   moods.slice(0, 5).forEach(m => {
//     const div = document.createElement("div");
//     div.className = "timeline-item";
//     div.innerHTML = `
//       <h4 class="font-semibold">Mood logged: ${m.mood}</h4>
//       <p class="text-sm opacity-70">
//         ${new Date(m.createdAt).toLocaleString()}
//       </p>
//     `;
//     container.appendChild(div);
//   });
// }


// function fillReportRecommendations(dashboard) {
//   const list = document.getElementById("report-recommendations");
//   list.innerHTML = "";

//   const score = dashboard.wellnessScore;
//   const streak = dashboard.streak;

//   if (streak >= 5)
//     list.innerHTML += `<li>🔥 Great consistency! Maintain your streak</li>`;

//   if (score < 70)
//     list.innerHTML += `<li>🧘 Try mindfulness or breathing exercises</li>`;

//   if (score >= 80)
//     list.innerHTML += `<li>🌟 You're doing amazing! Keep it up</li>`;

//   if (list.innerHTML === "")
//     list.innerHTML = `<li>✨ Keep building healthy habits</li>`;
// }


// function drawReportWeeklyChart(moods) {
//   const ctx = document.getElementById("reportWeeklyChart");
//   if (!ctx) return;

//   const moodMap = { excellent: 5, good: 4, okay: 3, poor: 2 };

//   const labels = moods.map(m =>
//     new Date(m.createdAt).toLocaleDateString("en-US", { weekday: "short" })
//   );

//   const data = moods.map(m => moodMap[m.mood] || 3);

//   new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels,
//       datasets: [{
//         data,
//         backgroundColor: "#C8B6FF"
//       }]
//     },
//     options: {
//       plugins: { legend: { display: false } },
//       scales: { y: { min: 1, max: 5 } }
//     }
//   });
// }



async function loadTodayMood() {
  const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}`);
  const today = new Date().toDateString();

  const todayMood = moods.find(
    (m) => new Date(m.createdAt).toDateString() === today
  );

  if (todayMood) {
    highlightMood(todayMood.mood);
    currentMood = todayMood.mood;
  }
}


function highlightMood(mood) {
  document.querySelectorAll(".mood-option-3d").forEach((el) => {
    if (el.dataset.mood === mood) {
      el.classList.add("active");
    } else {
      el.classList.add("hidden");  // Hides others
    }
  });
}

async function loadGoals() {
  try {
    const goals = await GET(`${BASE_URL}/api/goals?userId=CURRENT_USER._id`);

    const list = document.getElementById("goals-list");
    list.innerHTML = "";

    let completed = 0;

    goals.forEach(goal => {
      if (goal.completed) completed++;

      const div = document.createElement("div");
      div.className = "flex items-center gap-4";

      div.innerHTML = `
        <div class="goal-checkbox-3d ${goal.completed ? "checked" : ""}"
             data-id="${goal._id}"></div>
        <span class="flex-1 ${goal.completed ? "line-through opacity-70" : ""}">
          ${goal.title}
        </span>
        <button class="text-red-400 text-sm delete-goal" data-id="${goal._id}">
          ✕
        </button>
      `;

      list.appendChild(div);
    });

    updateGoalProgress(completed, goals.length);
attachGoalEvents();


  } catch (err) {
    console.error("Failed to load goals:", err);
  }
}


async function loadRecentActivity() {
  console.log("Recent activity not implemented yet");
}


async function loadRecentActivity() {
  try {
    const activities = [];

    // Fetch recent moods
    const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=3`);
    moods.forEach(m => {
      activities.push({
        type: "Mood",
        text: `Mood logged: ${m.mood}`,
        time: new Date(m.createdAt)
      });
    });

    // Fetch recent goals
    const goals = await GET(`${BASE_URL}/api/goals`);
    goals.slice(0, 3).forEach(g => {
      activities.push({
        type: "Goal",
        text: `Goal added: ${g.title}`,
        time: new Date(g.createdAt)
      });
    });

    // Sort by latest
    activities.sort((a, b) => b.time - a.time);

    const container = document.getElementById("recent-activities");
    container.innerHTML = "";

    if (activities.length === 0) {
      container.innerHTML = "<p>No recent activity</p>";
      return;
    }

    activities.slice(0, 5).forEach(act => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `
        <strong>${act.type}</strong>: ${act.text}
        <span class="activity-time">${act.time.toLocaleString()}</span>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load recent activity:", err);
  }
}



function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

async function loadWeeklyChart() {
  const ctx = document.getElementById("weeklyChart");
  const insightText = document.getElementById("weekly-insight-text");

  if (!ctx || !insightText) return;

  const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}?limit=7`);

  const moodScoreMap = {
    excellent: 5,
    good: 4,
    okay: 3,
    poor: 2
  };

  const last7Days = getLast7Days();

  const labels = [];
  const data = [];

  last7Days.forEach(day => {
    const dayStr = day.toDateString();

    const moodEntry = moods.find(
      m => new Date(m.createdAt).toDateString() === dayStr
    );

    labels.push(
      day.toLocaleDateString("en-US", { weekday: "short" })
    );

    data.push(
      moodEntry ? moodScoreMap[moodEntry.mood] : 3   // default = neutral
    );
  });

  // ---- Average mood ----
  const avgMood = data.reduce((a, b) => a + b, 0) / data.length;

  // ---- Insight text ----
  if (avgMood >= 4.2) {
    insightText.textContent = "Your mood stayed positive most days 🌟";
  } else if (avgMood >= 3.4) {
    insightText.textContent = "Your week was balanced — consistency helps 👍";
  } else if (avgMood >= 2.6) {
    insightText.textContent = "This week had ups and downs — gentle routines can help 💛";
  } else {
    insightText.textContent = "This week felt heavy — be kind to yourself 💙";
  }

  // ---- Chart ----
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Mood Trend",
        data,
        borderColor: "#C8B6FF",
        backgroundColor: "rgba(200,182,255,0.25)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: v => ["😔","😐","😊","😄","🤩"][v - 1]
          }
        }
      }
    }
  });
}




function attachGoalEvents() {
  // Toggle complete / incomplete
  document.querySelectorAll(".goal-checkbox-3d").forEach(box => {
    box.addEventListener("click", async () => {
      const goalId = box.dataset.id;
      const completed = !box.classList.contains("checked");

      await PATCH(`${BASE_URL}/api/goals/${goalId}`, { completed });

      loadGoals(); // reload updated goals
    });
  });

  // Delete goal
  document.querySelectorAll(".delete-goal").forEach(btn => {
    btn.addEventListener("click", async () => {
      await fetch(`${BASE_URL}/api/goals/${btn.dataset.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      loadGoals();
    });
  });
}


document.getElementById("add-goal-form").addEventListener("submit", async e => {
  e.preventDefault();

  const input = document.getElementById("new-goal-title");
  const title = input.value.trim();

  if (!title) return;

  await POST(`${BASE_URL}/api/goals`, { title });

  input.value = "";
  loadGoals();
});

function updateGoalProgress(completed, total) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("goal-progress-text").textContent =
    `${completed} of ${total} completed`;

  document.getElementById("goal-progress-bar").style.width = percent + "%";
}


document.addEventListener("DOMContentLoaded", async () => {
  const user = await loadUser();
  if (!user) return;
  await loadTodayMood();
  await loadGoals();
  await loadRecentActivity();
  await loadWeeklyChart();
  await loadPersonalizedWellness();
});
