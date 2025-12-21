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

function getPersonalizedReportData() {
  return {
    username: CURRENT_USER?.username || "User",

    wellnessScore: Number(
      document.getElementById("wellness-score")?.textContent.replace("%","")
    ) || 0,

    sessions: Number(
      document.getElementById("sessions-count")?.textContent
    ) || 0,

    streak: Number(
      document.getElementById("streak-count")?.textContent
    ) || 0,

    goalCompletionText:
      document.getElementById("goal-progress-text")?.textContent || "0 of 0",

    goalCompletionPercent:
      parseInt(
        document.getElementById("goal-progress-bar")?.style.width
      ) || 0,

    mood: window.currentMood || "okay",

    recentActivities: Array.from(
      document.querySelectorAll("#recent-activities .activity-item")
    ).map(el => el.textContent.trim()),

    weeklyInsight:
      document.getElementById("weekly-insight-text")?.textContent || ""
  };
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
