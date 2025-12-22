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
  great: 5,
  good: 4,
  okay: 3,
  bad: 2,
  terrible: 1
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

// async function loadDashboard() {
//   const user = await loadUser();
//   if (!user) {
//     console.error("Dashboard failed: user not loaded.");
//     return;
//   }

//   console.log("Dashboard loading for:", user.username);
//   // Fetch moods to calculate streak
// const moods = await GET(`${BASE_URL}/api/mood/${user._id}`);

// const activityDates = moods.map(m => m.createdAt);

// const dayStreak = calculateDayStreak(activityDates);

// document.getElementById("streak-count").textContent = dayStreak;
// window.CURRENT_DAY_STREAK = dayStreak;


//   await loadWeeklyChart();



//   // You can load:
//   // - goals
//   // - moods
//   // - recent activities
//   // - game scores
//   // - journal entries
//   // etc.
// }

async function loadDashboard() {
  const user = await loadUser();
  if (!user) return;

  console.log("Dashboard loading for:", user.username);

  const moods = await GET(`${BASE_URL}/api/mood/${user._id}`);
  const activityDates = moods.map(m => m.createdAt);

  const dayStreak = calculateDayStreak(activityDates);
  window.CURRENT_DAY_STREAK = dayStreak;

  document.getElementById("streak-count").textContent = dayStreak;

  await loadWeeklyChart();
  await loadPersonalizedWellness();
  await loadGoals();
  await loadRecentActivity();
}


function calculateDayStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) return 0;

  // Convert to YYYY-MM-DD format
  const uniqueDays = [...new Set(
    activityDates.map(d => new Date(d).toISOString().split("T")[0])
  )].sort().reverse();

  let streak = 0;
  let currentDate = new Date();

  for (let day of uniqueDays) {
    const date = new Date(day);
    const diff =
      Math.floor(
        (currentDate - date) / (1000 * 60 * 60 * 24)
      );

    if (diff === 0 || diff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
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

const score = Number(dashboard.wellnessScore) || 0;
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
  progressEl.style.width = visibleScore + "%";
  progressEl.title = `Completed ${score}% of your wellness score`;
}



  // ----- STREAK -----
  const streakEl = document.getElementById("streak-count");
  if (streakEl) streakEl.textContent = window.CURRENT_DAY_STREAK || 0;


  // ----- MOTIVATION TEXT (LEFT BOX) -----=
  const sessionEl = document.getElementById("sessions-count");
if (sessionEl)
  sessionEl.textContent = dashboard.sessions || 0;

const streakMsg = document.getElementById("streak-message");
if (streakMsg)
  streakMsg.textContent = updateStreakMotivation(window.CURRENT_DAY_STREAK || 0);



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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); // 🔥 CLONE, not reuse
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}



let weeklyChartInstance = null;

async function loadWeeklyChart() {
  const canvas = document.getElementById("weeklyChart");
  const insightText = document.getElementById("weekly-insight-text");

  if (!canvas) return;

  const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}`);

  // ✅ SAME mood names as Mood Tracker
  const moodScoreMap = {
    great: 5,
    good: 4,
    okay: 3,
    bad: 2,
    terrible: 1
  };

  // ---- last 7 days (including today) ----
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const labels = [];
  const data = [];

  days.forEach(day => {
    labels.push(
      day.toLocaleDateString("en-US", { weekday: "short" })
    );

    const dayMoods = moods.filter(m => {
      const d = new Date(m.createdAt);
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      );
    });

    if (dayMoods.length === 0) {
      data.push(null); // ❗ breaks line correctly
    } else {
      const avg =
        dayMoods.reduce((sum, m) => sum + moodScoreMap[m.mood], 0) /
        dayMoods.length;
      data.push(Number(avg.toFixed(2)));
    }
  });

  // ---- destroy old chart ----
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  weeklyChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Mood Trend",
        data,
        borderColor: "#C8B6FF",
        backgroundColor: "rgba(200,182,255,0.25)",
        tension: 0.4,
        fill: true,
        spanGaps: false,
        pointRadius: 5,
        pointHoverRadius: 7
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
            callback: v =>
              ({1:"😢",2:"😟",3:"😐",4:"🙂",5:"😄"}[v])
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // ---- insight text ----
  if (insightText) {
    const valid = data.filter(v => v !== null);
    const avg =
      valid.reduce((a, b) => a + b, 0) / (valid.length || 1);

    insightText.textContent =
      avg >= 4 ? "Your mood has been mostly positive 🌟"
      : avg >= 3 ? "Your week looks balanced 👍"
      : avg >= 2 ? "Some ups and downs — take care 💛"
      : "It’s been a tough week — be kind to yourself 🤍";
  }
}


let reportWeeklyChart = null;

async function loadReportWeeklyActivityPattern() {
  const canvas = document.getElementById("weeklyActivityChart");
  if (!canvas) return;

  const moods = await GET(`${BASE_URL}/api/mood/${CURRENT_USER._id}`);

  const moodScoreMap = {
    great: 5,
    good: 4,
    okay: 3,
    bad: 2,
    terrible: 1
  };

  // --- last 7 days including today ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const labels = [];
  const data = [];

  days.forEach(day => {
    labels.push(
      day.toLocaleDateString("en-US", { weekday: "short" })
    );

    const dayMoods = moods.filter(m => {
      const d = new Date(m.createdAt);
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      );
    });

    if (dayMoods.length === 0) {
      data.push(null);
    } else {
      const avg =
        dayMoods.reduce((s, m) => s + moodScoreMap[m.mood], 0) /
        dayMoods.length;
      data.push(Number(avg.toFixed(2)));
    }
  });

  if (reportWeeklyChart) {
    reportWeeklyChart.destroy();
  }

  reportWeeklyChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: "#C8B6FF",
        backgroundColor: "rgba(200,182,255,0.25)",
        tension: 0.4,
        fill: true,
        spanGaps: false,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: v =>
              ({1:"😢",2:"😟",3:"😐",4:"🙂",5:"😄"}[v])
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

let dashboardMoodChart = null;

async function loadDashboardMoodGraph() {
  try {
    const timeframe = 7; // same as weekly mood tracker
    const res = await GET(
      `${BASE_URL}/api/mood/${CURRENT_USER._id}/stats?timeframe=${timeframe}`
    );

    const ctx = document
      .getElementById("dashboardMoodChart")
      ?.getContext("2d");

    if (!ctx) return;

    // Destroy old chart (important)
    if (dashboardMoodChart) {
      dashboardMoodChart.destroy();
    }

    dashboardMoodChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: res.moodTrend.map(d =>
          new Date(d.date).toLocaleDateString("en-US", {
            weekday: "short"
          })
        ),
        datasets: [
          {
            label: "Mood Trend",
            data: res.moodTrend.map(d => d.avgMood),
            borderColor: "#C8B6FF",
            backgroundColor: "rgba(200,182,255,0.2)",
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 1,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: value =>
                ({ 5: "😄", 4: "🙂", 3: "😐", 2: "😟", 1: "😢" }[value] || "")
            }
          }
        }
      }
    });

  } catch (err) {
    console.error("Dashboard mood graph error:", err);
  }
}


async function updateReportWeeklyActivityPattern() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch(`http://localhost:5000/api/mood/${userId}`);
  const moods = await res.json();

  const moodScore = {
    great: 5,
    good: 4,
    okay: 3,
    bad: 2,
    terrible: 1
  };

  // last 7 days (including today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activity = {};

  days.forEach(day => {
    const name = dayNames[day.getDay()];
    const dayMoods = moods.filter(m => {
      const d = new Date(m.createdAt);
      return d.toDateString() === day.toDateString();
    });

    if (dayMoods.length === 0) {
      activity[name] = 0;
    } else {
      activity[name] =
        dayMoods.reduce((s, m) => s + moodScore[m.mood], 0) /
        dayMoods.length;
    }
  });

  // update bars
  document.querySelectorAll(".weekly-bar").forEach(bar => {
    const day = bar.dataset.day;
    const value = activity[day] || 0;

    // scale: keep UI same, only height changes
    const height = value === 0 ? 20 : 20 + value * 16;
    bar.style.height = `${height}%`;
  });

  // update insight text
  const peakDay = Object.keys(activity).reduce((a, b) =>
    activity[a] > activity[b] ? a : b
  );

  const insight = document.getElementById("weekly-activity-insight");
  if (insight) {
    insight.textContent =
      activity[peakDay] === 0
        ? "No sufficient activity data available for this week."
        : `Peak activity observed on ${peakDay}. Consider scheduling important wellness sessions on this day.`;
  }
}





document.addEventListener("DOMContentLoaded", async () => {
  const user = await loadUser();
  if (!user) return;
  await loadTodayMood();
  await loadGoals();
  await loadRecentActivity();
  await loadWeeklyChart();
  await loadPersonalizedWellness();
  await loadDashboardMoodGraph();
});

window.addEventListener("storage", (event) => {
  if (event.key === "dashboardMoodUpdated") {
    loadDashboardMoodGraph();
  }
});

window.addEventListener("storage", (e) => {
  if (e.key === "dashboardMoodUpdated") {
    loadWeeklyChart();
  }
});


window.addEventListener("storage", (e) => {
  if (e.key === "moodUpdatedAt") {
    loadWeeklyChart();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  loadReportWeeklyActivityPattern();
});

document.addEventListener("DOMContentLoaded", () => {
  updateReportWeeklyActivityPattern();
});
