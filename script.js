// Life Tracker (Static HTML/JS/CSS)
// Replace your entire script.js with this file.

const app = document.getElementById("app");

function show(view) {
  if (view === "weight") renderWeight();
  if (view === "habits") renderHabits();
  if (view === "goals") renderGoals();
  if (view === "journal") renderJournal();
  if (view === "shopping") renderShopping();
  if (view === "todo") renderTodo();
}

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => show(btn.dataset.view));
});

// DEFAULT VIEW
show("weight");

// --------------------
// WEIGHT (with goal + chart + correct progress updates)
// --------------------
function renderWeight() {
  const goal = getWeightGoal();

  app.innerHTML = `
    <div class="card">
      <h2>Weight Tracker</h2>

      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end; margin-bottom:12px;">
        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Goal weight</span>
          <input id="weightGoalInput" type="number" inputmode="decimal" placeholder="e.g. 180" value="${goal ?? ""}" />
        </label>
        <button id="saveWeightGoalBtn">Save Goal</button>

        <div style="flex:1;"></div>

        <div style="display:grid; gap:2px; min-width:220px;">
          <div style="font-size:12px; opacity:.7;">Progress</div>
          <div id="weightProgress" style="font-weight:600;">—</div>
          <div id="weightProgress2" style="font-size:12px; opacity:.8;">—</div>
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:end;">
        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Date</span>
          <input id="weightDate" type="date" />
        </label>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Weight</span>
          <input id="weightInput" type="number" inputmode="decimal" placeholder="e.g. 185.4" />
        </label>

        <button id="addWeightBtn">Add</button>
      </div>

      <div style="margin-top:12px;">
        <canvas id="weightChart" height="180" style="width:100%; display:block; border:1px solid #e5e7eb; border-radius:8px; background:#fff;"></canvas>
        <div style="font-size:12px; opacity:.75; margin-top:6px;">Chart is sorted by date.</div>
      </div>

      <h3 style="margin-top:16px; margin-bottom:8px;">Entries</h3>
      <ul id="weightList" style="list-style:none; padding:0; margin:0; display:grid; gap:8px;"></ul>
    </div>
  `;

  // default date = today
  document.getElementById("weightDate").value = new Date().toISOString().slice(0, 10);

  document.getElementById("addWeightBtn").addEventListener("click", addWeight);

  document.getElementById("saveWeightGoalBtn").addEventListener("click", () => {
    const raw = document.getElementById("weightGoalInput").value;
    if (raw === "") {
      localStorage.removeItem("weightGoal");
      updateWeightProgress();
      drawWeightChart(getWeights());
      return;
    }
    const val = Number(raw);
    if (!Number.isFinite(val)) return;
    localStorage.setItem("weightGoal", String(val));
    updateWeightProgress();
    drawWeightChart(getWeights());
  });

  window.onresize = () => {
    const canvas = document.getElementById("weightChart");
    if (canvas) drawWeightChart(getWeights());
  };

  loadWeights();
}

function addWeight() {
  const date = document.getElementById("weightDate").value;
  const weightRaw = document.getElementById("weightInput").value;

  if (!date) return;
  if (!weightRaw) return;

  const weight = Number(weightRaw);
  if (!Number.isFinite(weight)) return;

  const data = getWeights();
  data.unshift({
    id: crypto.randomUUID(),
    date,   // YYYY-MM-DD
    weight, // number
  });

  localStorage.setItem("weights", JSON.stringify(data));
  document.getElementById("weightInput").value = "";

  loadWeights();
}

function loadWeights() {
  const list = document.getElementById("weightList");
  const data = getWeights();

  if (data.length === 0) {
    list.innerHTML = `<li style="opacity:.7;">No entries yet.</li>`;
    drawWeightChart([]);
    updateWeightProgress();
    return;
  }

  // display newest first
  const display = [...data].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  list.innerHTML = display
    .map(
      (w) => `
      <li style="border:1px solid #ddd; border-radius:8px; padding:10px; background:#fff; display:grid; gap:8px;">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <div>
            <b>${escapeHtml(w.date)}</b>
            <span style="opacity:.8;">—</span>
            <span>${w.weight}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <button id="weight-edit-${w.id}">Edit</button>
            <button id="weight-del-${w.id}" style="background:#ef4444; color:white;">Delete</button>
          </div>
        </div>

        <div id="weight-editrow-${w.id}" style="display:none; gap:8px; align-items:end; flex-wrap:wrap;">
          <label style="display:grid; gap:4px;">
            <span style="font-size:12px; opacity:.8;">Date</span>
            <input id="weight-editdate-${w.id}" type="date" value="${escapeHtml(w.date)}" />
          </label>
          <label style="display:grid; gap:4px;">
            <span style="font-size:12px; opacity:.8;">Weight</span>
            <input id="weight-editval-${w.id}" type="number" inputmode="decimal" value="${w.weight}" />
          </label>
          <button id="weight-save-${w.id}">Save</button>
          <button id="weight-cancel-${w.id}">Cancel</button>
        </div>
      </li>
    `
    )
    .join("");

  // wire up buttons (use the canonical data from storage each time)
  display.forEach((w) => {
    document.getElementById(`weight-del-${w.id}`).addEventListener("click", () => {
      const next = getWeights().filter((x) => x.id !== w.id);
      localStorage.setItem("weights", JSON.stringify(next));
      loadWeights(); // will also redraw + update progress
    });

    document.getElementById(`weight-edit-${w.id}`).addEventListener("click", () => {
      const row = document.getElementById(`weight-editrow-${w.id}`);
      row.style.display = row.style.display === "none" ? "flex" : "none";
    });

    document.getElementById(`weight-cancel-${w.id}`).addEventListener("click", () => {
      document.getElementById(`weight-editrow-${w.id}`).style.display = "none";
    });

    document.getElementById(`weight-save-${w.id}`).addEventListener("click", () => {
      const newDate = document.getElementById(`weight-editdate-${w.id}`).value;
      const newValRaw = document.getElementById(`weight-editval-${w.id}`).value;
      const newVal = Number(newValRaw);

      if (!newDate) return;
      if (!Number.isFinite(newVal)) return;

      const next = getWeights().map((x) =>
        x.id === w.id ? { ...x, date: newDate, weight: newVal } : x
      );

      localStorage.setItem("weights", JSON.stringify(next));
      loadWeights(); // will also redraw + update progress
    });
  });

  drawWeightChart(data);
  updateWeightProgress();
}

function updateWeightProgress() {
  const el1 = document.getElementById("weightProgress");
  const el2 = document.getElementById("weightProgress2");
  if (!el1 || !el2) return;

  const goal = getWeightGoal();
  const data = getWeights();

  if (!data.length) {
    el1.textContent = "—";
    el2.textContent = "Add entries to see progress.";
    return;
  }

  // sort oldest -> newest by date
  const sorted = [...data].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const start = sorted[0].weight;
  const latest = sorted[sorted.length - 1].weight;

  const lost = start - latest; // positive means lost weight
  const currentText = `Current: ${latest} • Start: ${start}`;

  if (goal == null || !Number.isFinite(goal)) {
    el1.textContent = `${lost > 0 ? `${lost.toFixed(1)} lost so far` : lost < 0 ? `${Math.abs(lost).toFixed(1)} gained so far` : `No change yet`}`;
    el2.textContent = currentText;
    return;
  }

  // primary message: "lost so far" + "to go" (instead of "above goal")
  const toGo = latest - goal; // positive means still above goal (needs to lose more)
  const lostText =
    lost > 0 ? `${lost.toFixed(1)} lost so far` :
    lost < 0 ? `${Math.abs(lost).toFixed(1)} gained so far` :
    `No change yet`;

  if (latest === goal) {
    el1.textContent = `🎯 Goal reached • ${lostText}`;
    el2.textContent = currentText;
    return;
  }

  if (latest > goal) {
    el1.textContent = `${lostText} • ${toGo.toFixed(1)} to go`;
    el2.textContent = `Goal: ${goal} • ${currentText}`;
    return;
  }

  // below goal
  el1.textContent = `✅ Below goal by ${(goal - latest).toFixed(1)} • ${lostText}`;
  el2.textContent = `Goal: ${goal} • ${currentText}`;
}

function getWeights() {
  // supports older entries that used {value, date}
  const raw = JSON.parse(localStorage.getItem("weights") || "[]");
  return raw
    .map((x) => {
      if (x && x.weight != null) return x;
      return {
        id: (x && x.id) || crypto.randomUUID(),
        date: normalizeLegacyDate(x && x.date),
        weight: Number(x && x.value),
      };
    })
    .filter((x) => x && typeof x.date === "string" && Number.isFinite(x.weight));
}

function normalizeLegacyDate(dateStr) {
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return new Date().toISOString().slice(0, 10);
}

function getWeightGoal() {
  const g = localStorage.getItem("weightGoal");
  if (g == null || g === "") return null;
  const n = Number(g);
  return Number.isFinite(n) ? n : null;
}

function drawWeightChart(entries) {
  const canvas = document.getElementById("weightChart");
  if (!canvas) return;

  const goal = getWeightGoal();

  // match internal resolution to displayed size
  const displayWidth = canvas.clientWidth || 600;
  const displayHeight = canvas.height || 180;
  canvas.width = Math.floor(displayWidth * devicePixelRatio);
  canvas.height = Math.floor(displayHeight * devicePixelRatio);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  const sorted = [...entries]
    .map((e) => ({ ...e, t: new Date(e.date + "T00:00:00").getTime() }))
    .filter((e) => Number.isFinite(e.t) && Number.isFinite(e.weight))
    .sort((a, b) => a.t - b.t);

  if (sorted.length < 2) {
    ctx.font = "12px system-ui";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(
      sorted.length === 1 ? "Add one more entry to see a line." : "No data to chart yet.",
      12,
      22
    );
    return;
  }

  const padL = 40, padR = 12, padT = 12, padB = 24;

  const xs = sorted.map((d) => d.t);
  const ys = sorted.map((d) => d.weight);

  // include goal line in range if present
  if (goal != null && Number.isFinite(goal)) ys.push(goal);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const xRange = Math.max(1e-6, maxX - minX);
  const yRange = Math.max(1e-6, maxY - minY);

  const xScale = (t) => padL + ((t - minX) / xRange) * (displayWidth - padL - padR);
  const yScale = (v) => padT + (1 - (v - minY) / yRange) * (displayHeight - padT - padB);

  // axis labels (min/max)
  ctx.font = "12px system-ui";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(String(maxY.toFixed(1)), 6, padT + 10);
  ctx.fillText(String(minY.toFixed(1)), 6, displayHeight - padB);

  // baseline
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, displayHeight - padB);
  ctx.lineTo(displayWidth - padR, displayHeight - padB);
  ctx.stroke();

  // goal line (dashed)
  if (goal != null && Number.isFinite(goal)) {
    const gy = yScale(goal);
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, gy);
    ctx.lineTo(displayWidth - padR, gy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Goal", displayWidth - padR - 32, Math.max(padT + 10, gy - 6));
    ctx.restore();
  }

  // line
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  sorted.forEach((d, i) => {
    const x = xScale(d.t);
    const y = yScale(d.weight);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // dots
  ctx.fillStyle = "#111827";
  sorted.forEach((d) => {
    const x = xScale(d.t);
    const y = yScale(d.weight);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}





// --------------------
// HABITS (Week/Month checklist grid)
// --------------------
function renderHabits() {
  const state = getHabitsState();
  state.completedByDate ??= {};

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  // Persist UI settings in habitsState
  state.ui ??= { mode: "week", anchor: todayKey }; // mode: "week" | "month"
  if (!state.ui.mode) state.ui.mode = "week";
  if (!state.ui.anchor) state.ui.anchor = todayKey;

  const ui = state.ui;

  const dates = ui.mode === "month" ? getMonthDates(ui.anchor) : getWeekDates(ui.anchor);

  const headerLabel =
    ui.mode === "month"
      ? formatMonthLabel(ui.anchor)
      : `Week of ${dates[0]} → ${dates[dates.length - 1]}`;

  app.innerHTML = `
    <div class="card">
      <h2>Habits</h2>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
        <input id="habitName" placeholder="New habit (e.g., Walk 20 min)" />
        <button id="addHabitBtn">Add</button>

        <div style="flex:1;"></div>

        <select id="habitMode">
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <button id="prevRangeBtn">◀</button>
        <button id="todayBtn">Today</button>
        <button id="nextRangeBtn">▶</button>
      </div>

      <div style="opacity:.8; margin-bottom:10px;"><b>${headerLabel}</b></div>

      <div style="overflow:auto; border:1px solid #e5e7eb; border-radius:10px; background:#fff;">
        <table style="border-collapse:collapse; min-width:720px; width:100%;">
          <thead>
            <tr>
              <th style="text-align:left; padding:10px; position:sticky; left:0; background:#fff; border-bottom:1px solid #e5e7eb;">Habit</th>
              ${dates
                .map(
                  (d) => `
                    <th style="padding:10px; text-align:center; border-bottom:1px solid #e5e7eb; white-space:nowrap;">
                      ${formatDayHeader(d, ui.mode)}
                    </th>
                  `
                )
                .join("")}
              <th style="padding:10px; text-align:center; border-bottom:1px solid #e5e7eb;">Delete</th>
            </tr>
          </thead>
          <tbody>
            ${
              state.habits.length
                ? state.habits.map((h) => habitRowGridHTML(h, state, dates)).join("")
                : `<tr><td colspan="${dates.length + 2}" style="padding:12px; opacity:.7;">No habits yet. Add one above.</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <p style="font-size:12px; opacity:.75; margin-top:10px;">
        Tip: Check/uncheck any day. Everything saves locally.
      </p>
    </div>
  `;

  // Set dropdown to current mode
  const modeSel = document.getElementById("habitMode");
  modeSel.value = ui.mode;

  // Add habit
  document.getElementById("addHabitBtn").addEventListener("click", () => {
    const input = document.getElementById("habitName");
    const name = input.value.trim();
    if (!name) return;

    state.habits.push({ id: crypto.randomUUID(), name });
    input.value = "";
    saveHabitsState(state);
    renderHabits();
  });

  // Change mode
  modeSel.addEventListener("change", () => {
    state.ui.mode = modeSel.value;
    saveHabitsState(state);
    renderHabits();
  });

  // Jump to today
  document.getElementById("todayBtn").addEventListener("click", () => {
    state.ui.anchor = todayKey;
    saveHabitsState(state);
    renderHabits();
  });

  // Prev/Next range
  document.getElementById("prevRangeBtn").addEventListener("click", () => {
    state.ui.anchor =
      state.ui.mode === "month" ? shiftMonth(state.ui.anchor, -1) : shiftDays(state.ui.anchor, -7);
    saveHabitsState(state);
    renderHabits();
  });

  document.getElementById("nextRangeBtn").addEventListener("click", () => {
    state.ui.anchor =
      state.ui.mode === "month" ? shiftMonth(state.ui.anchor, 1) : shiftDays(state.ui.anchor, 7);
    saveHabitsState(state);
    renderHabits();
  });

  // Wire up checkbox + delete handlers
  state.habits.forEach((habit) => {
    dates.forEach((dateKey) => {
      const cb = document.getElementById(`habit-${habit.id}-${dateKey}`);
      if (!cb) return;

      cb.addEventListener("change", (e) => {
        state.completedByDate[dateKey] ??= {};
        state.completedByDate[dateKey][habit.id] = e.target.checked;
        saveHabitsState(state);
      });
    });

    const del = document.getElementById(`habit-del-${habit.id}`);
    if (del) {
      del.addEventListener("click", () => {
        state.habits = state.habits.filter((x) => x.id !== habit.id);
        saveHabitsState(state);
        renderHabits();
      });
    }
  });
}

// ---- Habits storage
function getHabitsState() {
  return JSON.parse(
    localStorage.getItem("habitsState") ||
      JSON.stringify({
        habits: [],
        completedByDate: {}, // { "YYYY-MM-DD": { habitId: true/false } }
        ui: { mode: "week", anchor: new Date().toISOString().slice(0, 10) },
      })
  );
}

function saveHabitsState(state) {
  localStorage.setItem("habitsState", JSON.stringify(state));
}

// ---- Habits grid helpers
function habitRowGridHTML(habit, state, dates) {
  return `
    <tr>
      <td style="padding:10px; position:sticky; left:0; background:#fff; border-bottom:1px solid #f1f5f9;">
        ${escapeHtml(habit.name)}
      </td>
      ${dates
        .map((d) => {
          const checked = !!state.completedByDate?.[d]?.[habit.id];
          return `
            <td style="text-align:center; padding:10px; border-bottom:1px solid #f1f5f9;">
              <input id="habit-${habit.id}-${d}" type="checkbox" ${checked ? "checked" : ""} />
            </td>
          `;
        })
        .join("")}
      <td style="text-align:center; padding:10px; border-bottom:1px solid #f1f5f9;">
        <button id="habit-del-${habit.id}" style="background:#ef4444; color:white;">Delete</button>
      </td>
    </tr>
  `;
}

function getWeekDates(anchorKey) {
  const d = new Date(anchorKey + "T00:00:00");
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMon = (day + 6) % 7; // Monday-start week
  d.setDate(d.getDate() - diffToMon);

  const out = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

function getMonthDates(anchorKey) {
  const d = new Date(anchorKey + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();

  const last = new Date(year, month + 1, 0);
  const out = [];
  for (let day = 1; day <= last.getDate(); day++) {
    out.push(new Date(year, month, day).toISOString().slice(0, 10));
  }
  return out;
}

function shiftDays(anchorKey, days) {
  const d = new Date(anchorKey + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function shiftMonth(anchorKey, months) {
  const d = new Date(anchorKey + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function formatMonthLabel(anchorKey) {
  const d = new Date(anchorKey + "T00:00:00");
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function formatDayHeader(dateKey, mode) {
  const d = new Date(dateKey + "T00:00:00");
  if (mode === "month") return String(d.getDate());
  const dow = d.toLocaleString(undefined, { weekday: "short" });
  return `${dow} ${d.getDate()}`;
}

// ---- shared helper
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m])
  );
}

// --------------------
// STUBS (NEXT)
// --------------------
function renderGoals() {
  app.innerHTML = `<div class="card"><h2>Goals (next)</h2></div>`;
}

function renderJournal() {
  app.innerHTML = `<div class="card"><h2>Journal (next)</h2></div>`;
}
// --------------------
// GOALS (set progress, not add)
// --------------------
function renderGoals() {
  const state = getGoalsState();

  app.innerHTML = `
    <div class="card">
      <h2>Goals</h2>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:end; margin-bottom:12px;">
        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Goal</span>
          <input id="goalTitle" placeholder="e.g., Save for new tools" />
        </label>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Target number</span>
          <input id="goalTarget" type="number" inputmode="decimal" placeholder="e.g., 1000" />
        </label>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Due date</span>
          <input id="goalDue" type="date" />
        </label>

        <button id="addGoalBtn">Add Goal</button>
      </div>

      <div id="goalsList" style="display:grid; gap:10px;"></div>
    </div>
  `;

  document.getElementById("goalDue").value = new Date().toISOString().slice(0, 10);

  document.getElementById("addGoalBtn").addEventListener("click", () => {
    const title = document.getElementById("goalTitle").value.trim();
    const targetRaw = document.getElementById("goalTarget").value;
    const due = document.getElementById("goalDue").value;

    if (!title) return;

    const target = Number(targetRaw);
    if (!Number.isFinite(target) || target <= 0) return;

    state.goals.unshift({
      id: crypto.randomUUID(),
      title,
      target,
      current: 0,
      dueDate: due ? due : null,
      completed: false,
      createdAt: Date.now(),
    });

    saveGoalsState(state);

    document.getElementById("goalTitle").value = "";
    document.getElementById("goalTarget").value = "";
    document.getElementById("goalDue").value = new Date().toISOString().slice(0, 10);

    renderGoals();
  });

  renderGoalsList(state);
}

function renderGoalsList(state) {
  const wrap = document.getElementById("goalsList");

  if (!state.goals.length) {
    wrap.innerHTML = `<div style="opacity:.7;">No goals yet.</div>`;
    return;
  }

  wrap.innerHTML = state.goals.map((g) => goalCardHTML(g)).join("");

  state.goals.forEach((g) => {
    // SET progress (no math)
    document.getElementById(`goal-progress-${g.id}`).addEventListener("click", () => {
      const raw = prompt(`Set current progress (0 to ${g.target}):`, String(g.current ?? 0));
      if (raw === null) return;

      const val = Number(raw);
      if (!Number.isFinite(val)) return;

      g.current = clamp(val, 0, g.target);
      g.completed = g.current >= g.target;

      saveGoalsState(state);
      renderGoals();
    });

    // Complete
    document.getElementById(`goal-complete-${g.id}`).addEventListener("click", () => {
      g.current = g.target;
      g.completed = true;
      saveGoalsState(state);
      renderGoals();
    });

    // Delete
    document.getElementById(`goal-del-${g.id}`).addEventListener("click", () => {
      state.goals = state.goals.filter((x) => x.id !== g.id);
      saveGoalsState(state);
      renderGoals();
    });

    // Toggle edit
    document.getElementById(`goal-edit-${g.id}`).addEventListener("click", () => {
      const row = document.getElementById(`goal-editrow-${g.id}`);
      row.style.display = row.style.display === "none" ? "grid" : "none";
    });

    // Cancel edit
    document.getElementById(`goal-cancel-${g.id}`).addEventListener("click", () => {
      document.getElementById(`goal-editrow-${g.id}`).style.display = "none";
    });

    // Save edit
    document.getElementById(`goal-save-${g.id}`).addEventListener("click", () => {
      const title = document.getElementById(`goal-title-${g.id}`).value.trim();
      const target = Number(document.getElementById(`goal-target-${g.id}`).value);
      const current = Number(document.getElementById(`goal-current-${g.id}`).value);
      const due = document.getElementById(`goal-due-${g.id}`).value;

      if (!title) return;
      if (!Number.isFinite(target) || target <= 0) return;
      if (!Number.isFinite(current) || current < 0) return;

      g.title = title;
      g.target = target;
      g.current = clamp(current, 0, target);
      g.dueDate = due ? due : null;
      g.completed = g.current >= g.target;

      saveGoalsState(state);
      renderGoals();
    });
  });
}

function goalCardHTML(g) {
  const pct = g.target > 0 ? Math.round((Number(g.current || 0) / g.target) * 100) : 0;
  const done = g.completed || (g.current ?? 0) >= g.target;

  const daysLeftInfo = getDaysLeftInfo(g.dueDate, done);

  return `
    <div style="border:1px solid #ddd; border-radius:10px; background:#fff; padding:12px; display:grid; gap:10px;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
        <div>
          <div style="font-weight:700;">${escapeHtml(g.title)}</div>
          <div style="opacity:.8; font-size:12px;">
            ${g.current} / ${g.target} (${pct}%)
            ${done ? `<span style="margin-left:8px; font-weight:700;">✅ Completed</span>` : ``}
          </div>
          <div style="opacity:.85; font-size:12px; margin-top:4px;">
            ${daysLeftInfo}
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
          <button id="goal-progress-${g.id}">Set Progress</button>
          <button id="goal-complete-${g.id}">Complete</button>
          <button id="goal-edit-${g.id}">Edit</button>
          <button id="goal-del-${g.id}" style="background:#ef4444; color:white;">Delete</button>
        </div>
      </div>

      <div style="height:10px; background:#e5e7eb; border-radius:999px; overflow:hidden;">
        <div style="height:100%; width:${Math.min(100, Math.max(0, pct))}%; background:#111827;"></div>
      </div>

      <div id="goal-editrow-${g.id}" style="display:none; grid-template-columns: 1fr 140px 160px; gap:8px; align-items:end;">
        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Title</span>
          <input id="goal-title-${g.id}" value="${escapeHtml(g.title)}" />
        </label>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Target</span>
          <input id="goal-target-${g.id}" type="number" inputmode="decimal" value="${g.target}" />
        </label>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Due date</span>
          <input id="goal-due-${g.id}" type="date" value="${g.dueDate || ""}" />
        </label>

        <label style="display:grid; gap:4px; grid-column: 1 / 2;">
          <span style="font-size:12px; opacity:.8;">Current</span>
          <input id="goal-current-${g.id}" type="number" inputmode="decimal" value="${g.current}" />
        </label>

        <div style="grid-column: 2 / -1; display:flex; gap:8px; justify-content:flex-end; align-items:end;">
          <button id="goal-save-${g.id}">Save</button>
          <button id="goal-cancel-${g.id}">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function getDaysLeftInfo(dueDateKey, isCompleted) {
  if (isCompleted) return "Done.";
  if (!dueDateKey) return "No due date set.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateKey + "T00:00:00");
  const ms = due.getTime() - today.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left (due ${dueDateKey}).`;
  if (days === 0) return `Due today (${dueDateKey}).`;
  const overdue = Math.abs(days);
  return `${overdue} day${overdue === 1 ? "" : "s"} overdue (due ${dueDateKey}).`;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// ---- Goals storage
function getGoalsState() {
  return JSON.parse(localStorage.getItem("goalsState") || JSON.stringify({ goals: [] }));
}

function saveGoalsState(state) {
  localStorage.setItem("goalsState", JSON.stringify(state));
}
// --------------------
// JOURNAL (grouped by month, preview + expand, edit/delete)
// --------------------
function renderJournal() {
  const state = getJournalState();

  app.innerHTML = `
    <div class="card">
      <h2>Journal</h2>

      <div style="display:grid; gap:8px; margin-bottom:14px;">
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:end;">
          <label style="display:grid; gap:4px; flex:1; min-width:220px;">
            <span style="font-size:12px; opacity:.8;">Title</span>
            <input id="jrTitle" placeholder="e.g., Good day / Rough day / Thoughts" />
          </label>

          <label style="display:grid; gap:4px;">
            <span style="font-size:12px; opacity:.8;">Date</span>
            <input id="jrDate" type="date" />
          </label>

          <button id="jrAddBtn">Add Entry</button>
        </div>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Entry</span>
          <textarea id="jrBody" rows="5" placeholder="Write your entry..."></textarea>
        </label>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
        <input id="jrSearch" placeholder="Search entries..." style="flex:1; min-width:220px;" />
        <button id="jrExpandAll">Expand all</button>
        <button id="jrCollapseAll">Collapse all</button>
      </div>

      <div id="jrFolders" style="display:grid; gap:12px;"></div>
    </div>
  `;

  // default date = today
  document.getElementById("jrDate").value = new Date().toISOString().slice(0, 10);

  document.getElementById("jrAddBtn").addEventListener("click", () => {
    const title = document.getElementById("jrTitle").value.trim() || "Untitled";
    const date = document.getElementById("jrDate").value || new Date().toISOString().slice(0, 10);
    const body = document.getElementById("jrBody").value.trim();
    if (!body) return;

    state.entries.unshift({
      id: crypto.randomUUID(),
      title,
      date,      // YYYY-MM-DD
      body,      // text
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expanded: false,
    });

    saveJournalState(state);

    document.getElementById("jrTitle").value = "";
    document.getElementById("jrBody").value = "";
    document.getElementById("jrDate").value = new Date().toISOString().slice(0, 10);

    renderJournal();
  });

  document.getElementById("jrSearch").addEventListener("input", (e) => {
    state.ui.search = e.target.value;
    saveJournalState(state);
    renderJournal();
  });

  document.getElementById("jrExpandAll").addEventListener("click", () => {
    state.entries.forEach((x) => (x.expanded = true));
    saveJournalState(state);
    renderJournal();
  });

  document.getElementById("jrCollapseAll").addEventListener("click", () => {
    state.entries.forEach((x) => (x.expanded = false));
    saveJournalState(state);
    renderJournal();
  });

  // render folders
  renderJournalFolders(state);

  // set search field value after re-render
  document.getElementById("jrSearch").value = state.ui.search || "";
}

function renderJournalFolders(state) {
  const wrap = document.getElementById("jrFolders");

  const search = (state.ui.search || "").trim().toLowerCase();

  // sort by date desc, then createdAt desc
  const entries = [...state.entries].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const filtered = search
    ? entries.filter((e) => {
        const hay = `${e.title}\n${e.body}\n${e.date}`.toLowerCase();
        return hay.includes(search);
      })
    : entries;

  if (!filtered.length) {
    wrap.innerHTML = `<div style="opacity:.7;">No journal entries yet.</div>`;
    return;
  }

  const groups = groupEntriesByMonth(filtered); // { "YYYY-MM": [entries...] }

  wrap.innerHTML = Object.keys(groups)
    .sort((a, b) => b.localeCompare(a)) // newest month first
    .map((monthKey) => {
      const label = monthLabelFromKey(monthKey);
      const items = groups[monthKey]
        .map((e) => journalEntryHTML(e))
        .join("");

      return `
        <div style="border:1px solid #e5e7eb; border-radius:12px; background:#fff; overflow:hidden;">
          <div style="padding:10px 12px; background:#f3f4f6; font-weight:700;">
            ${escapeHtml(label)}
            <span style="font-weight:400; opacity:.75;"> (${groups[monthKey].length})</span>
          </div>
          <div style="padding:10px 12px; display:grid; gap:10px;">
            ${items}
          </div>
        </div>
      `;
    })
    .join("");

  // wire up events
  filtered.forEach((e) => {
    const toggle = document.getElementById(`jr-toggle-${e.id}`);
    const del = document.getElementById(`jr-del-${e.id}`);
    const edit = document.getElementById(`jr-edit-${e.id}`);
    const save = document.getElementById(`jr-save-${e.id}`);
    const cancel = document.getElementById(`jr-cancel-${e.id}`);

    toggle?.addEventListener("click", () => {
      const entry = state.entries.find((x) => x.id === e.id);
      if (!entry) return;
      entry.expanded = !entry.expanded;
      saveJournalState(state);
      renderJournal();
    });

    del?.addEventListener("click", () => {
      state.entries = state.entries.filter((x) => x.id !== e.id);
      saveJournalState(state);
      renderJournal();
    });

    edit?.addEventListener("click", () => {
      const row = document.getElementById(`jr-editrow-${e.id}`);
      row.style.display = row.style.display === "none" ? "grid" : "none";
    });

    cancel?.addEventListener("click", () => {
      document.getElementById(`jr-editrow-${e.id}`).style.display = "none";
    });

    save?.addEventListener("click", () => {
      const entry = state.entries.find((x) => x.id === e.id);
      if (!entry) return;

      const title = document.getElementById(`jr-title-${e.id}`).value.trim() || "Untitled";
      const date = document.getElementById(`jr-date-${e.id}`).value || entry.date;
      const body = document.getElementById(`jr-body-${e.id}`).value.trim();
      if (!body) return;

      entry.title = title;
      entry.date = date;
      entry.body = body;
      entry.updatedAt = Date.now();

      saveJournalState(state);
      renderJournal();
    });
  });
}

function journalEntryHTML(e) {
  const preview = firstSentencePreview(e.body);
  const expanded = !!e.expanded;

  return `
    <div style="border:1px solid #ddd; border-radius:10px; padding:10px; background:#fff; display:grid; gap:8px;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
        <div style="min-width:0;">
          <div style="font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${escapeHtml(e.title)}
          </div>
          <div style="font-size:12px; opacity:.75;">${escapeHtml(e.date)}</div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
          <button id="jr-toggle-${e.id}">${expanded ? "Collapse" : "Open"}</button>
          <button id="jr-edit-${e.id}">Edit</button>
          <button id="jr-del-${e.id}" style="background:#ef4444; color:white;">Delete</button>
        </div>
      </div>

      <div style="opacity:.85;">
        ${expanded
          ? `<div style="white-space:pre-wrap; line-height:1.4;">${escapeHtml(e.body)}</div>`
          : `<div>${escapeHtml(preview)}</div>`}
      </div>

      <div id="jr-editrow-${e.id}" style="display:none; grid-template-columns: 1fr 160px; gap:8px; align-items:end;">
        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Title</span>
          <input id="jr-title-${e.id}" value="${escapeHtml(e.title)}" />
        </label>

        <label style="display:grid; gap:4px;">
          <span style="font-size:12px; opacity:.8;">Date</span>
          <input id="jr-date-${e.id}" type="date" value="${escapeHtml(e.date)}" />
        </label>

        <label style="display:grid; gap:4px; grid-column: 1 / -1;">
          <span style="font-size:12px; opacity:.8;">Entry</span>
          <textarea id="jr-body-${e.id}" rows="6">${escapeHtml(e.body)}</textarea>
        </label>

        <div style="grid-column: 1 / -1; display:flex; gap:8px; justify-content:flex-end;">
          <button id="jr-save-${e.id}">Save</button>
          <button id="jr-cancel-${e.id}">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function groupEntriesByMonth(entries) {
  const groups = {};
  entries.forEach((e) => {
    const key = (e.date || "").slice(0, 7); // YYYY-MM
    const monthKey = /^\d{4}-\d{2}$/.test(key) ? key : "Unknown";
    groups[monthKey] ??= [];
    groups[monthKey].push(e);
  });
  return groups;
}

function monthLabelFromKey(monthKey) {
  if (monthKey === "Unknown") return "Unknown Month";
  const d = new Date(monthKey + "-01T00:00:00");
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function firstSentencePreview(text) {
  const cleaned = String(text || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const m = cleaned.match(/.*?[.!?](\s|$)/);
  const sentence = m ? m[0].trim() : cleaned;
  return sentence.length > 180 ? sentence.slice(0, 180) + "…" : sentence;
}

// ---- Journal storage
function getJournalState() {
  return JSON.parse(
    localStorage.getItem("journalState") ||
      JSON.stringify({
        entries: [],
        ui: { search: "" },
      })
  );
}

function saveJournalState(state) {
  localStorage.setItem("journalState", JSON.stringify(state));
}

// --------------------
// SHOPPING LIST
// --------------------
function renderShopping() {
  const state = getShoppingState();

  app.innerHTML = `
    <div class="card">
      <h2>Shopping List</h2>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:end; margin-bottom:12px;">
        <label style="display:grid; gap:4px; flex:1;">
          <span style="font-size:12px; opacity:.8;">Item</span>
          <input id="shopName" placeholder="e.g. Milk, Screws, Apples" />
        </label>

        <label style="display:grid; gap:4px; width:120px;">
          <span style="font-size:12px; opacity:.8;">Qty</span>
          <input id="shopQty" placeholder="1" />
        </label>

        <button id="addShopBtn">Add</button>
      </div>

      <div id="shoppingList" style="display:grid; gap:8px;"></div>
    </div>
  `;

  document.getElementById("addShopBtn").addEventListener("click", () => {
    const name = document.getElementById("shopName").value.trim();
    const qty = document.getElementById("shopQty").value.trim() || "1";

    if (!name) return;

    state.items.unshift({
      id: crypto.randomUUID(),
      name,
      qty,
      done: false,
      createdAt: Date.now(),
    });

    saveShoppingState(state);

    document.getElementById("shopName").value = "";
    document.getElementById("shopQty").value = "";

    renderShopping();
  });

  renderShoppingList(state);
}

function renderShoppingList(state) {
  const wrap = document.getElementById("shoppingList");

  if (!state.items.length) {
    wrap.innerHTML = `<div style="opacity:.7;">No items yet.</div>`;
    return;
  }

  wrap.innerHTML = state.items
    .map((item) => shoppingRowHTML(item))
    .join("");

  state.items.forEach((item) => {
    document.getElementById(`shop-check-${item.id}`).addEventListener("change", (e) => {
      item.done = e.target.checked;
      saveShoppingState(state);
    });

    document.getElementById(`shop-del-${item.id}`).addEventListener("click", () => {
      state.items = state.items.filter((x) => x.id !== item.id);
      saveShoppingState(state);
      renderShopping();
    });

    document.getElementById(`shop-edit-${item.id}`).addEventListener("click", () => {
      const row = document.getElementById(`shop-editrow-${item.id}`);
      row.style.display = row.style.display === "none" ? "grid" : "none";
    });

    document.getElementById(`shop-save-${item.id}`).addEventListener("click", () => {
      const name = document.getElementById(`shop-name-${item.id}`).value.trim();
      const qty = document.getElementById(`shop-qty-${item.id}`).value.trim();

      if (!name) return;

      item.name = name;
      item.qty = qty || "1";

      saveShoppingState(state);
      renderShopping();
    });
  });
}

function shoppingRowHTML(item) {
  return `
    <div style="border:1px solid #ddd; border-radius:10px; padding:10px; background:#fff; display:grid; gap:8px;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
        <label style="display:flex; gap:10px; align-items:center;">
          <input id="shop-check-${item.id}" type="checkbox" ${item.done ? "checked" : ""} />
          <span style="text-decoration:${item.done ? "line-through" : "none"};">
            ${escapeHtml(item.name)}${item.qty ? ` (${escapeHtml(item.qty)})` : ""}
          </span>
        </label>

        <div style="display:flex; gap:8px;">
          <button id="shop-edit-${item.id}">Edit</button>
          <button id="shop-del-${item.id}" style="background:#ef4444; color:white;">Delete</button>
        </div>
      </div>

      <div id="shop-editrow-${item.id}" style="display:none; grid-template-columns: 1fr 120px; gap:8px;">
        <input id="shop-name-${item.id}" value="${escapeHtml(item.name)}" />
        <input id="shop-qty-${item.id}" value="${escapeHtml(item.qty)}" />
        <div style="grid-column:1/-1; display:flex; justify-content:flex-end;">
          <button id="shop-save-${item.id}">Save</button>
        </div>
      </div>
    </div>
  `;
}

// ---- Shopping storage
function getShoppingState() {
  return JSON.parse(
    localStorage.getItem("shoppingState") ||
      JSON.stringify({ items: [] })
  );
}

function saveShoppingState(state) {
  localStorage.setItem("shoppingState", JSON.stringify(state));
}
// --------------------
// TODO LIST (priority + reorder + expandable notes)
// --------------------
function renderTodo() {
  const state = getTodoState();

  app.innerHTML = `
    <div class="card">
      <h2>To-Do</h2>

      <div style="display:grid; gap:8px; margin-bottom:12px;">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input id="todoTitle" placeholder="Task title" style="flex:1;" />

          <select id="todoUrgency">
            <option value="high">High</option>
            <option value="medium" selected>Medium</option>
            <option value="low">Low</option>
          </select>

          <button id="addTodoBtn">Add</button>
        </div>

        <textarea id="todoNotes" rows="3" placeholder="Notes (optional)"></textarea>
      </div>

      <div id="todoSections"></div>
    </div>
  `;

  document.getElementById("addTodoBtn").addEventListener("click", () => {
    const title = document.getElementById("todoTitle").value.trim();
    const urgency = document.getElementById("todoUrgency").value;
    const notes = document.getElementById("todoNotes").value.trim();

    if (!title) return;

    state.items.push({
      id: crypto.randomUUID(),
      title,
      notes,
      urgency,
      completed: false,
      completedAt: null,
      order: Date.now(),
      expanded: false
    });

    saveTodoState(state);

    document.getElementById("todoTitle").value = "";
    document.getElementById("todoNotes").value = "";

    renderTodo();
  });

  renderTodoSections(state);
}

function renderTodoSections(state) {
  const wrap = document.getElementById("todoSections");

  const active = state.items.filter(i => !i.completed);
  const completed = state.items.filter(i => i.completed);

  const groups = {
    high: active.filter(i => i.urgency === "high"),
    medium: active.filter(i => i.urgency === "medium"),
    low: active.filter(i => i.urgency === "low"),
  };

  Object.values(groups).forEach(g => g.sort((a, b) => a.order - b.order));

  wrap.innerHTML = `
    ${renderPriorityBlock("High Priority", "high", groups.high)}
    ${renderPriorityBlock("Medium Priority", "medium", groups.medium)}
    ${renderPriorityBlock("Low Priority", "low", groups.low)}
    ${renderCompletedBlock(completed)}
  `;

  wireTodoEvents(state);
  enableTodoDrag(state);
}

function renderPriorityBlock(title, level, items) {
  return `
    <div style="margin-bottom:18px;">
      <h3>${title}</h3>
      <div data-priority="${level}" style="display:grid; gap:10px;">
        ${
          items.length
            ? items.map(i => todoRowHTML(i)).join("")
            : `<div style="opacity:.6;">No items</div>`
        }
      </div>
    </div>
  `;
}

function renderCompletedBlock(items) {
  if (!items.length) return "";

  return `
    <div style="margin-top:20px;">
      <h3>Completed</h3>
      <div style="display:grid; gap:8px;">
        ${items
          .sort((a, b) => b.completedAt - a.completedAt)
          .map(i => completedTodoHTML(i))
          .join("")}
      </div>
    </div>
  `;
}

function todoRowHTML(item) {
  return `
    <div draggable="true"
         data-id="${item.id}"
         data-priority="${item.urgency}"
         style="border:1px solid #ddd;
                border-left:6px solid ${urgencyColor(item.urgency)};
                border-radius:10px;
                padding:10px;
                background:#fff;
                display:grid;
                gap:6px;">

      <div style="display:flex; justify-content:space-between; gap:10px;">
        <label style="display:flex; gap:10px; align-items:center;">
          <input type="checkbox" id="todo-check-${item.id}" />
          <strong>${escapeHtml(item.title)}</strong>
        </label>

        <div style="display:flex; gap:6px;">
          <button id="todo-edit-${item.id}">Edit</button>
          <button id="todo-del-${item.id}" style="background:#ef4444;color:white;">Delete</button>
        </div>
      </div>

      ${item.notes ? `<div style="opacity:.8;">${previewText(item.notes)}</div>` : ""}

      <div id="todo-edit-${item.id}-row"
           style="display:none; grid-template-columns: 1fr 1fr; gap:8px;">
        <input id="todo-title-${item.id}" value="${escapeHtml(item.title)}" />
        <select id="todo-urgency-${item.id}">
          <option value="high" ${item.urgency === "high" ? "selected" : ""}>High</option>
          <option value="medium" ${item.urgency === "medium" ? "selected" : ""}>Medium</option>
          <option value="low" ${item.urgency === "low" ? "selected" : ""}>Low</option>
        </select>

        <textarea id="todo-notes-${item.id}" rows="3">${escapeHtml(item.notes || "")}</textarea>

        <div style="grid-column:1/-1; text-align:right;">
          <button id="todo-save-${item.id}">Save</button>
        </div>
      </div>
    </div>
  `;
}

function completedTodoHTML(item) {
  return `
    <div style="
      border:1px solid #ddd;
      border-radius:10px;
      padding:8px;
      background:#f7f7f7;
      color:#666;
      font-size:0.9em;
    ">
      <label style="display:flex; justify-content:space-between; gap:10px;">
        <div>
          <input type="checkbox" id="todo-check-${item.id}" checked />
          ${escapeHtml(item.title)}
          <div style="font-size:11px; opacity:.7;">
            Completed ${new Date(item.completedAt).toLocaleDateString()}
          </div>
        </div>
        <button id="todo-del-${item.id}" style="background:#ef4444;color:white;">Delete</button>
      </label>
    </div>
  `;
}

// ---------- behavior ----------
function wireTodoEvents(state) {
  state.items.forEach(item => {
    const checkbox = document.getElementById(`todo-check-${item.id}`);
    if (checkbox) {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          item.completed = true;
          item.completedAt = Date.now();
        } else {
          item.completed = false;
          item.completedAt = null;
        }
        saveTodoState(state);
        renderTodo();
      });
    }

    const edit = document.getElementById(`todo-edit-${item.id}`);
    if (edit) {
      edit.addEventListener("click", () => {
        const row = document.getElementById(`todo-edit-${item.id}-row`);
        row.style.display = row.style.display === "none" ? "grid" : "none";
      });
    }

    const save = document.getElementById(`todo-save-${item.id}`);
    if (save) {
      save.addEventListener("click", () => {
        item.title = document.getElementById(`todo-title-${item.id}`).value.trim();
        item.notes = document.getElementById(`todo-notes-${item.id}`).value.trim();
        item.urgency = document.getElementById(`todo-urgency-${item.id}`).value;

        saveTodoState(state);
        renderTodo();
      });
    }

    const del = document.getElementById(`todo-del-${item.id}`);
    if (del) {
      del.addEventListener("click", () => {
        state.items = state.items.filter(x => x.id !== item.id);
        saveTodoState(state);
        renderTodo();
      });
    }
  });
}

// drag & reorder within same priority
function enableTodoDrag(state) {
  const items = document.querySelectorAll("[draggable=true]");
  let dragged = null;

  items.forEach(el => {
    el.addEventListener("dragstart", () => {
      dragged = el;
      el.style.opacity = "0.5";
    });

    el.addEventListener("dragend", () => {
      el.style.opacity = "";
    });

    el.addEventListener("dragover", e => e.preventDefault());

    el.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragged || dragged === el) return;
      if (dragged.dataset.priority !== el.dataset.priority) return;

      const fromId = dragged.dataset.id;
      const toId = el.dataset.id;

      const fromIndex = state.items.findIndex(x => x.id === fromId);
      const toIndex = state.items.findIndex(x => x.id === toId);

      const [moved] = state.items.splice(fromIndex, 1);
      state.items.splice(toIndex, 0, moved);

      state.items.forEach((x, i) => (x.order = i));
      saveTodoState(state);
      renderTodo();
    });
  });
}

// helpers
function urgencyColor(level) {
  if (level === "high") return "#ef4444";
  if (level === "medium") return "#f59e0b";
  return "#10b981";
}

function previewText(text) {
  const clean = String(text || "").trim();
  if (!clean) return "";
  return clean.length > 120 ? clean.slice(0, 120) + "…" : clean;
}

// storage
function getTodoState() {
  return JSON.parse(localStorage.getItem("todoState") || JSON.stringify({ items: [] }));
}

function saveTodoState(state) {
  localStorage.setItem("todoState", JSON.stringify(state));
}
