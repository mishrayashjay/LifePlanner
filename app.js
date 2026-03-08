// --- UI Constants & Elements ---
const DOM = {
    themeToggle: document.getElementById('theme-toggle'),
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    
    // Header Elements
    dateDisplay: document.getElementById('current-date-display'),
    progressText: document.getElementById('progress-text'),
    progressFill: document.getElementById('progress-fill'),
    
    // Task Board
    todoList: document.getElementById('todo-list'),
    completedList: document.getElementById('completed-list'),
    todoCount: document.getElementById('todo-count'),
    completedCount: document.getElementById('completed-count'),
    
    // Modal
    addTaskBtn: document.getElementById('add-task-btn'),
    modal: document.getElementById('task-modal'),
    closeBtn: document.getElementById('close-modal-btn'),
    cancelBtn: document.getElementById('cancel-task-btn'),
    form: document.getElementById('task-form'),
    modalTitle: document.getElementById('modal-title'),
    
    // Form Inputs
    taskIdInput: document.getElementById('task-id'),
    taskTitleInput: document.getElementById('task-title'),
    taskDescInput: document.getElementById('task-desc'),
    taskDateInput: document.getElementById('task-date'),
    taskTimeInput: document.getElementById('task-time'),
    
    // Monthly/Weekly
    monthlyMonthDisplay: document.getElementById('monthly-month-display'),
    monthlyDaysGrid: document.getElementById('monthly-days'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    weeklyGrid: document.getElementById('weekly-grid'),

    // V2 & V4 Features
    liveClockWidget: document.getElementById('live-clock'),
    liveClockText: document.getElementById('live-clock-text'),
    streakCount: document.getElementById('streak-count'),
    dailyStudyTime: document.getElementById('daily-study-time'),
    
    // Study Tracker DOM
    pomodoroDisplay: document.getElementById('pomodoro-display'),
    pomodoroRing: document.getElementById('pomodoro-ring'),
    pomodoroStart: document.getElementById('pomodoro-start'),
    pomodoroPause: document.getElementById('pomodoro-pause'),
    pomodoroReset: document.getElementById('pomodoro-reset'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    
    // V5 Custom Time
    customTimeContainer: document.getElementById('custom-time-container'),
    customHours: document.getElementById('custom-hours'),
    customMins: document.getElementById('custom-mins'),
    customSecs: document.getElementById('custom-secs'),
    
    // V5 Focus Overlay
    focusOverlay: document.getElementById('focus-mode-overlay'),
    focusContent: document.querySelector('.focus-mode-content'),
    focusDisplay: document.getElementById('focus-timer-display'),
    focusEndSession: document.getElementById('focus-end-session'),
    focusGiveUp: document.getElementById('focus-give-up'),
    focusCompletionScreen: document.getElementById('focus-completion-screen'),
    focusCompletedTime: document.getElementById('focus-completed-time'),
    focusStartAnother: document.getElementById('focus-start-another'),
    focusCloseOverlay: document.getElementById('focus-close-overlay'),
    
    // V6/V7/V8 Focus Trackers & Analytics
    pomodoroTaskName: document.getElementById('pomodoro-task-name'),
    stopwatchTaskName: document.getElementById('stopwatch-task-name'),
    focusMotivator: document.getElementById('focus-motivational-text'),
    analyticsList: document.getElementById('analytics-list'),
    focusOverlayRing: document.getElementById('focus-overlay-ring'),
    
    // V8 Motivational Popup
    motivationalPopup: document.getElementById('motivational-popup'),
    motivationalQuote: document.getElementById('motivational-quote-text'),
    focusContinueSession: document.getElementById('focus-continue-session'),
    focusGiveUpAnyway: document.getElementById('focus-give-up-anyway'),
    focusTimerWrapper: document.querySelector('.focus-overlay-timer-wrapper'),
    
    stopwatchDisplay: document.getElementById('stopwatch-display'),
    stopwatchStart: document.getElementById('stopwatch-start'),
    stopwatchPause: document.getElementById('stopwatch-pause'),
    stopwatchReset: document.getElementById('stopwatch-reset')
};


// --- State Management ---
let state = {
    tasks: JSON.parse(localStorage.getItem('antiplanner_tasks') || '[]'),
    theme: localStorage.getItem('antiplanner_theme') || 'light',
    streak: parseInt(localStorage.getItem('antiplanner_streak') || 0, 10),
    currentDate: new Date(),
    monthlyViewDate: new Date(),
    
    // V4/V6 Study State
    studyDate: localStorage.getItem('antiplanner_study_date') || new Date().toISOString().split('T')[0],
    studyTimeSecs: parseInt(localStorage.getItem('antiplanner_study_time') || 0, 10),
    studySessions: JSON.parse(localStorage.getItem('antiplanner_study_sessions') || '[]')
};

// V4 Active Timers State
let pomodoro = {
    interval: null,
    totalSecs: 25 * 60,
    remainingSecs: 25 * 60,
    isActive: false,
    graceTimeout: null
};

let stopwatch = {
    interval: null,
    elapsedSecs: 0,
    isActive: false
};

// --- Initialization ---
// V8 Motivational Quotes Array
const MOTIVATIONAL_QUOTES = [
    "Discipline is choosing what you want most over what you want now.",
    "Stay focused. Your future self will thank you.",
    "Great things come from consistent effort.",
    "Just a little longer — you've got this.",
    "Success usually comes to those who are too busy to be looking for it."
];

function init() {
    initTheme();
    updateHeaderDate();
    initEventListeners();
    evaluateStreak();
    checkStudyDateReset();
    updateDailyStudyUI();
    renderTasks();
    renderMonthlyCalendar();
    renderWeeklyCalendar();
    renderAnalytics();
    updateProgress();
    requestNotificationPermission();
    
    // Feature initializations
    DOM.liveClockWidget.classList.remove('hidden');
    updateLiveClock();
    
    // Timers
    setInterval(updateLiveClock, 1000);
    setInterval(updateCountdowns, 1000);
    setInterval(checkNotifications, 60000); // Check every minute
}

// --- Theme Management ---
function initTheme() {
    if (state.theme === 'dark') {
        document.body.classList.add('dark-mode');
        DOM.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        DOM.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        state.theme = 'light';
        DOM.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.body.classList.add('dark-mode');
        state.theme = 'dark';
        DOM.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    localStorage.setItem('antiplanner_theme', state.theme);
}

// --- Navigation ---
function switchView(viewId) {
    // Update active nav item
    DOM.navItems.forEach(item => {
        if (item.dataset.view === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update active section
    DOM.viewSections.forEach(section => {
        if (section.id === `view-${viewId}`) {
            section.classList.add('active');
            section.classList.remove('hidden');
        } else {
            section.classList.remove('active');
            section.classList.add('hidden');
        }
    });

    // Re-render specific views if needed
    if (viewId === 'monthly') renderMonthlyCalendar();
    if (viewId === 'weekly') renderWeeklyCalendar();
}

// --- Data Management ---
function saveTasks() {
    localStorage.setItem('antiplanner_tasks', JSON.stringify(state.tasks));
    evaluateStreak();
    updateProgress();
    renderTasks();
    renderMonthlyCalendar();
    renderWeeklyCalendar();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// --- UI Updates ---
function updateHeaderDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    DOM.dateDisplay.textContent = state.currentDate.toLocaleDateString('en-US', options);
}

function updateProgress() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    DOM.progressText.textContent = `${percentage}%`;
    DOM.progressFill.style.width = `${percentage}%`;
}

// --- Task Rendering (Task Board) ---
function renderTasks() {
    const todos = state.tasks.filter(t => !t.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const completed = state.tasks.filter(t => t.completed)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // most recent first

    DOM.todoCount.textContent = todos.length;
    DOM.completedCount.textContent = completed.length;

    renderTaskList(DOM.todoList, todos);
    renderTaskList(DOM.completedList, completed);
    updateCountdowns(); // Initial countdown render
}

function renderTaskList(container, tasks) {
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">No tasks here.</p>`;
        return;
    }

    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-card glass-panel ${task.completed ? 'completed' : ''}`;
        
        // Format date/time
        let timeStr = task.time ? ` at ${task.time}` : '';
        let dateStr = new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Timer info setup
        const targetDateTime = `${task.date}T${task.time || '23:59:00'}`;
        const timerHtml = task.completed ? '' : `
            <div class="task-countdown" data-countdown-target="${targetDateTime}">
                <i class="fa-regular fa-clock"></i> <span>--</span>
            </div>
        `;
        
        taskEl.innerHTML = `
            <div class="task-header">
                <div class="task-title-group">
                    <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskCompletion('${task.id}')">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <span class="task-title">${task.title}</span>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" onclick="editTask('${task.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="task-action-btn delete" onclick="deleteTask('${task.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
            ${timerHtml}
            <div class="task-meta">
                <div class="task-meta-item">
                    <i class="fa-regular fa-calendar"></i> ${dateStr}${timeStr}
                </div>
                <div class="badge ${task.priority}">${task.priority}</div>
            </div>
        `;
        container.appendChild(taskEl);
    });
}

// --- Task Actions ---
function toggleTaskCompletion(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveTasks();
    }
}

function editTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    DOM.modalTitle.textContent = 'Edit Task';
    DOM.taskIdInput.value = task.id;
    DOM.taskTitleInput.value = task.title;
    DOM.taskDescInput.value = task.description;
    DOM.taskDateInput.value = task.date;
    DOM.taskTimeInput.value = task.time || '';
    
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
    
    openModal();
}

// --- Modal Management ---
function openModal() {
    DOM.modal.classList.remove('hidden');
    if (!DOM.taskIdInput.value) { // Set today's date if new task
        const today = new Date().toISOString().split('T')[0];
        DOM.taskDateInput.value = today;
    }
}

function closeModal() {
    DOM.modal.classList.add('hidden');
    DOM.form.reset();
    DOM.taskIdInput.value = '';
    DOM.modalTitle.textContent = 'Add New Task';
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = DOM.taskIdInput.value || generateId();
    const taskData = {
        id,
        title: DOM.taskTitleInput.value,
        description: DOM.taskDescInput.value,
        date: DOM.taskDateInput.value,
        time: DOM.taskTimeInput.value,
        priority: document.querySelector('input[name="priority"]:checked').value,
        completed: DOM.taskIdInput.value ? state.tasks.find(t => t.id === id).completed : false,
        notified: false // flag for reminders
    };

    if (DOM.taskIdInput.value) {
        // Edit
        const index = state.tasks.findIndex(t => t.id === id);
        state.tasks[index] = taskData;
    } else {
        // Add
        state.tasks.push(taskData);
    }

    saveTasks();
    closeModal();
}

// --- Event Listeners ---
function initEventListeners() {
    DOM.themeToggle.addEventListener('click', toggleTheme);
    
    DOM.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });

    DOM.addTaskBtn.addEventListener('click', () => {
        DOM.form.reset();
        DOM.taskIdInput.value = '';
        DOM.modalTitle.textContent = 'Add New Task';
        openModal();
    });
    
    DOM.closeBtn.addEventListener('click', closeModal);
    DOM.cancelBtn.addEventListener('click', closeModal);
    
    DOM.modal.addEventListener('click', (e) => {
        if (e.target === DOM.modal) closeModal();
    });

    DOM.form.addEventListener('submit', handleFormSubmit);

    // Monthly Calendar Navigation
    DOM.prevMonthBtn.addEventListener('click', () => {
        state.monthlyViewDate.setMonth(state.monthlyViewDate.getMonth() - 1);
        renderMonthlyCalendar();
    });
    
    DOM.nextMonthBtn.addEventListener('click', () => {
        state.monthlyViewDate.setMonth(state.monthlyViewDate.getMonth() + 1);
        renderMonthlyCalendar();
    });

    // V4/V5 Study Timer Events
    DOM.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (pomodoro.isActive) return;
            DOM.presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.time === 'custom') {
                DOM.customTimeContainer.classList.remove('hidden');
                calculateCustomTime();
            } else {
                DOM.customTimeContainer.classList.add('hidden');
                let mins = parseInt(btn.dataset.time, 10);
                pomodoro.totalSecs = mins * 60;
                pomodoro.remainingSecs = pomodoro.totalSecs;
                updatePomodoroUI();
            }
        });
    });

    [DOM.customHours, DOM.customMins, DOM.customSecs].forEach(input => {
        input.addEventListener('input', () => {
            if (!pomodoro.isActive && document.querySelector('.preset-btn.active').dataset.time === 'custom') {
                calculateCustomTime();
            }
        });
    });

    DOM.pomodoroStart.addEventListener('click', startPomodoro);
    DOM.pomodoroPause.addEventListener('click', pausePomodoro);
    DOM.pomodoroReset.addEventListener('click', resetPomodoro);
    
    // V5/V8 Overlay Events
    DOM.focusEndSession.addEventListener('click', cancelFocusSession);
    DOM.focusGiveUp.addEventListener('click', showMotivationalPopup);
    DOM.focusCloseOverlay.addEventListener('click', closeFocusOverlay);
    DOM.focusStartAnother.addEventListener('click', () => {
        closeFocusOverlay();
        resetPomodoro();
    });
    
    DOM.focusContinueSession.addEventListener('click', hideMotivationalPopupAndResume);
    DOM.focusGiveUpAnyway.addEventListener('click', () => {
        hideMotivationalPopup(false);
        cancelFocusSession();
    });

    DOM.stopwatchStart.addEventListener('click', startStopwatch);
    DOM.stopwatchPause.addEventListener('click', pauseStopwatch);
    DOM.stopwatchReset.addEventListener('click', resetStopwatch);

    // Make functions globally accessible for inline onclick handlers
    window.toggleTaskCompletion = toggleTaskCompletion;
    window.deleteTask = deleteTask;
    window.editTask = editTask;
}

// --- Utilities ---
function getTasksForDate(dateString) {
    return state.tasks.filter(t => t.date === dateString);
}

// --- V2 Feature Logic ---
function updateLiveClock() {
    const now = new Date();
    // Example: Sunday, 8 March 2026 | 12:30:45 AM
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const datePart = now.toLocaleDateString('en-US', dateOptions);
    const timePart = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    
    DOM.liveClockText.textContent = `${datePart} | ${timePart}`;
}

function updateCountdowns() {
    const now = new Date().getTime();
    const countdownEls = document.querySelectorAll('.task-countdown[data-countdown-target]');
    
    countdownEls.forEach(el => {
        const targetStr = el.dataset.countdownTarget;
        const targetDate = new Date(targetStr).getTime();
        const diff = targetDate - now;

        const textSpan = el.querySelector('span');
        el.classList.remove('urgent', 'soon', 'chill', 'expired');
        
        if (diff < 0) {
            textSpan.textContent = "Overdue";
            el.classList.add('expired');
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeStrings = [];
        if (days > 0) timeStrings.push(`${days}d`);
        if (hours > 0 || days > 0) timeStrings.push(`${hours}h`);
        if (minutes > 0 || hours > 0 || days > 0) timeStrings.push(`${minutes}m`);
        timeStrings.push(`${seconds}s`);

        textSpan.textContent = timeStrings.join(' ');

        // Coloring
        if (days === 0 && hours < 24) {
             if (hours < 2) {
                 el.classList.add('urgent');
             } else {
                 el.classList.add('soon');
             }
        } else {
             el.classList.add('chill');
        }
    });
}

function evaluateStreak() {
    const todayStr = state.currentDate.getFullYear() + '-' + String(state.currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(state.currentDate.getDate()).padStart(2, '0');
    
    let activeDates = [...new Set(state.tasks.map(t => t.date))]
        .filter(d => d <= todayStr)
        .sort((a,b) => a.localeCompare(b));

    let currentStreak = 0;

    for (let i = activeDates.length - 1; i >= 0; i--) {
        const date = activeDates[i];
        const dayTasks = state.tasks.filter(t => t.date === date);
        const allCompleted = dayTasks.length > 0 && dayTasks.every(t => t.completed);
        
        if (allCompleted) {
            currentStreak++;
        } else {
            if (date !== todayStr) {
                break; // Break streak on first past missed day
            }
        }
    }
    
    state.streak = currentStreak;
    localStorage.setItem('antiplanner_streak', state.streak.toString());
    DOM.streakCount.textContent = state.streak;
}

// --- V4/V6 Study Tracker Logic ---
function checkStudyDateReset() {
    const todayStr = state.currentDate.toISOString().split('T')[0];
    if (state.studyDate !== todayStr) {
        state.studyDate = todayStr;
        state.studyTimeSecs = 0;
        state.studySessions = []; // Reset daily sessions
        localStorage.setItem('antiplanner_study_date', state.studyDate);
        localStorage.setItem('antiplanner_study_time', state.studyTimeSecs);
        localStorage.setItem('antiplanner_study_sessions', JSON.stringify(state.studySessions));
        renderAnalytics();
    }
}

function addStudySession(taskName, durationSecs) {
    checkStudyDateReset();
    
    // Total header time
    state.studyTimeSecs += durationSecs;
    localStorage.setItem('antiplanner_study_time', state.studyTimeSecs);
    
    // Session history
    state.studySessions.push({
        id: Date.now().toString(),
        name: taskName || 'General Focus',
        durationSecs: durationSecs,
        date: new Date().toISOString()
    });
    localStorage.setItem('antiplanner_study_sessions', JSON.stringify(state.studySessions));
    
    updateDailyStudyUI();
    renderAnalytics();
}

function renderAnalytics() {
    DOM.analyticsList.innerHTML = '';
    
    if (state.studySessions.length === 0) {
        DOM.analyticsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No focus sessions completed today.</p>';
        return;
    }

    // Group by task name
    let taskTotals = {};
    state.studySessions.forEach(session => {
        if (!taskTotals[session.name]) taskTotals[session.name] = 0;
        taskTotals[session.name] += session.durationSecs;
    });

    // Render grouped totals
    for (const [name, totalSecs] of Object.entries(taskTotals)) {
        let hrs = Math.floor(totalSecs / 3600);
        let mins = Math.floor((totalSecs % 3600) / 60);
        let timeStr = "";
        
        if (hrs > 0) timeStr += `${hrs}h `;
        timeStr += `${mins}m`;
        // if less than a minute, show seconds
        if (hrs === 0 && mins === 0) timeStr = `${totalSecs}s`;
        
        const item = document.createElement('div');
        item.className = 'analytics-item';
        item.innerHTML = `
            <div class="analytics-task-name">
                <i class="fa-solid fa-book"></i> ${name}
            </div>
            <div class="analytics-time">${timeStr}</div>
        `;
        DOM.analyticsList.appendChild(item);
    }
}

function updateDailyStudyUI() {
    let hours = Math.floor(state.studyTimeSecs / 3600);
    let mins = Math.floor((state.studyTimeSecs % 3600) / 60);
    DOM.dailyStudyTime.textContent = `${hours}h ${mins}m`;
}

// Pomodoro Focus Timer
function calculateCustomTime() {
    let h = parseInt(DOM.customHours.value) || 0;
    let m = parseInt(DOM.customMins.value) || 0;
    let s = parseInt(DOM.customSecs.value) || 0;
    pomodoro.totalSecs = (h * 3600) + (m * 60) + s;
    if (pomodoro.totalSecs === 0) pomodoro.totalSecs = 60; // minimum 1 min fallback
    pomodoro.remainingSecs = pomodoro.totalSecs;
    updatePomodoroUI();
}

function formatTimeHHMMSS(seconds) {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = seconds % 60;
    
    let str = "";
    if (h > 0) str += `${h.toString().padStart(2, '0')}:`;
    str += `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return str;
}

function updatePomodoroUI() {
    let displayStr = formatTimeHHMMSS(pomodoro.remainingSecs);
    DOM.pomodoroDisplay.textContent = displayStr;
    DOM.focusDisplay.textContent = displayStr; // Sync with V5 overlay text
    
    // Small Card SVG ring math (dasharray = 565.48)
    let percent = pomodoro.totalSecs > 0 ? (pomodoro.remainingSecs / pomodoro.totalSecs) : 0;
    let offsetSmall = 565.48 - (percent * 565.48);
    DOM.pomodoroRing.style.strokeDashoffset = offsetSmall;
    
    // Massive V7 Overlay SVG ring math (dasharray = 1130.97)
    let offsetLarge = 1130.97 - (percent * 1130.97);
    DOM.focusOverlayRing.style.strokeDashoffset = offsetLarge;
}

function startPomodoro() {
    if (pomodoro.isActive) return;
    if (pomodoro.totalSecs <= 0) return;
    
    pomodoro.isActive = true;
    DOM.pomodoroStart.classList.add('hidden');
    DOM.pomodoroPause.classList.remove('hidden');
    
    // V5/V6: Open immersive overlay
    let taskName = DOM.pomodoroTaskName.value.trim();
    DOM.focusMotivator.textContent = taskName ? taskName : "Deep work in progress. Stay focused.";
    
    DOM.focusOverlay.classList.remove('hidden');
    DOM.focusContent.classList.remove('hidden');
    DOM.focusCompletionScreen.classList.add('hidden');
    
    // V5/V6/V7: Strict 10s Grace Period
    clearTimeout(pomodoro.graceTimeout); // Ensure clean state
    DOM.focusEndSession.classList.remove('hidden');
    DOM.focusGiveUp.classList.add('hidden');
    // Ensure completion screen buttons are hidden during countdown
    DOM.focusStartAnother.classList.add('hidden');
    DOM.focusCloseOverlay.classList.add('hidden');
    
    pomodoro.graceTimeout = setTimeout(() => {
        // ONLY change if Pomodoro is actually STILL active after 10 seconds
        if (pomodoro.isActive) { 
            DOM.focusEndSession.classList.add('hidden'); // Fully removes End Session
            DOM.focusGiveUp.classList.remove('hidden');  // Shows Give Up
        }
    }, 10000);
    
    pomodoro.interval = setInterval(() => {
        if (pomodoro.remainingSecs > 0) {
            pomodoro.remainingSecs--;
            updatePomodoroUI();
        } else {
            // Completed
            completeFocusSession();
        }
    }, 1000);
}

function completeFocusSession() {
    let focusType, durationSecs, taskName;
    
    if (pomodoro.isActive) {
        pausePomodoro();
        focusType = 'pomodoro';
        durationSecs = pomodoro.totalSecs;
        taskName = DOM.pomodoroTaskName.value.trim();
    } else if (stopwatch.isActive) {
        pauseStopwatch(true); // pass true to indicate full stop from overlay
        focusType = 'stopwatch';
        durationSecs = stopwatch.elapsedSecs; // grabbed before resetting
        taskName = DOM.stopwatchTaskName.value.trim();
    } else {
        return;
    }
    
    addStudySession(taskName, durationSecs);
    if (Notification.permission === 'granted') {
        new Notification('Focus Session Complete!', { body: 'Great job! Time added to your daily progress.' });
    }
    
    // Transitions in V5 Overlay
    DOM.focusContent.classList.add('hidden');
    DOM.focusCompletionScreen.classList.remove('hidden');
    
    let hrs = Math.floor(durationSecs / 3600);
    let mins = Math.floor((durationSecs % 3600) / 60);
    let timeStr = "";
    if (hrs > 0) timeStr += `${hrs} hour${hrs > 1 ? 's' : ''} `;
    if (mins > 0 || hrs === 0) timeStr += `${mins} minute${mins !== 1 ? 's' : ''}`;
    
    DOM.focusCompletedTime.textContent = `You studied for ${timeStr.trim()}`;
    
    // Reveal completion buttons
    DOM.focusStartAnother.classList.remove('hidden');
    DOM.focusCloseOverlay.classList.remove('hidden');
}

function cancelFocusSession() {
    // Both 'End Session' (grace) and 'Give Up' behave similar here: return to dashboard, no time logged
    if (pomodoro.isActive) {
        pausePomodoro();
        resetPomodoro();
    }
    if (stopwatch.isActive) {
        // Just cancel out, do not log time
        stopwatch.isActive = false;
        clearInterval(stopwatch.interval);
        stopwatch.elapsedSecs = 0;
        updateStopwatchUI();
        DOM.stopwatchStart.classList.remove('hidden');
        DOM.stopwatchStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        DOM.stopwatchPause.classList.add('hidden');
    }
    closeFocusOverlay();
}

// V8 Popup Handlers
function showMotivationalPopup() {
    // Pause timer in background so user doesn't bleed study time while deciding
    if (pomodoro.isActive) {
        clearInterval(pomodoro.interval);
    }
    
    // Randomize quote
    const rand = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    DOM.motivationalQuote.textContent = `"${MOTIVATIONAL_QUOTES[rand]}"`;
    
    // Blur the timer
    if (DOM.focusTimerWrapper) {
         DOM.focusTimerWrapper.style.filter = 'blur(10px) opacity(0.5)';
    }

    DOM.motivationalPopup.classList.remove('hidden');
}

function hideMotivationalPopup(shouldResume = false) {
    if (DOM.focusTimerWrapper) {
         DOM.focusTimerWrapper.style.filter = '';
    }
    DOM.motivationalPopup.classList.add('hidden');
    
    if (shouldResume && pomodoro.isActive) {
        // Re-establish interval
        pomodoro.interval = setInterval(() => {
            if (pomodoro.remainingSecs > 0) {
                pomodoro.remainingSecs--;
                updatePomodoroUI();
            } else {
                completeFocusSession();
            }
        }, 1000);
    }
}

function hideMotivationalPopupAndResume() {
    hideMotivationalPopup(true);
}

function closeFocusOverlay() {
    DOM.focusOverlay.classList.add('hidden');
    hideMotivationalPopup(false); // Reset in case hidden while active
}

function pausePomodoro() {
    pomodoro.isActive = false;
    clearInterval(pomodoro.interval);
    clearTimeout(pomodoro.graceTimeout);
    DOM.pomodoroStart.classList.remove('hidden');
    DOM.pomodoroStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    DOM.pomodoroPause.classList.add('hidden');
}

function resetPomodoro() {
    pausePomodoro();
    // Use active preset total
    let activePreset = document.querySelector('.preset-btn.active');
    if(activePreset) {
        if (activePreset.dataset.time === 'custom') {
            calculateCustomTime();
        } else {
            pomodoro.totalSecs = parseInt(activePreset.dataset.time, 10) * 60;
            pomodoro.remainingSecs = pomodoro.totalSecs;
        }
    } else {
        pomodoro.totalSecs = 25 * 60;
        pomodoro.remainingSecs = pomodoro.totalSecs;
    }
    DOM.pomodoroStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
    updatePomodoroUI();
}

// Stopwatch
function updateStopwatchUI() {
    let displayStr = formatTimeHHMMSS(stopwatch.elapsedSecs);
    DOM.stopwatchDisplay.textContent = displayStr;
    DOM.focusDisplay.textContent = displayStr; // Sync with overlay
    
    // V7: For stopwatch, progress ring grows endlessly or bounces, let's max it at 1h locally for aesthetics
    // or just lock it at 100% full visually. Let's make it pulse or stay full.
    // Setting dashed offset to 0 keeps it bold and full.
    DOM.focusOverlayRing.style.strokeDashoffset = 0;
}

function startStopwatch() {
    if (stopwatch.isActive) return;
    stopwatch.isActive = true;
    DOM.stopwatchStart.classList.add('hidden');
    DOM.stopwatchPause.classList.remove('hidden');
    
    // V6: Transition to Overlay
    let taskName = DOM.stopwatchTaskName.value.trim();
    DOM.focusMotivator.textContent = taskName ? taskName : "Stopwatch Session active.";
    
    DOM.focusOverlay.classList.remove('hidden');
    DOM.focusContent.classList.remove('hidden');
    DOM.focusCompletionScreen.classList.add('hidden');
    
    // Stopwatch does not need Give Up, just End Session
    DOM.focusEndSession.classList.remove('hidden');
    DOM.focusGiveUp.classList.add('hidden');
    clearTimeout(pomodoro.graceTimeout); // make sure it doesnt fire across timers

    // Sync initial state
    updateStopwatchUI();
    
    stopwatch.interval = setInterval(() => {
        stopwatch.elapsedSecs++;
        updateStopwatchUI();
    }, 1000);
}

function pauseStopwatch(fromOverlay = false) {
    if (!stopwatch.isActive) return;
    stopwatch.isActive = false;
    clearInterval(stopwatch.interval);
    
    if (fromOverlay) {
        // Stop completely
        addStudySession(DOM.stopwatchTaskName.value.trim(), stopwatch.elapsedSecs);
        stopwatch.elapsedSecs = 0;
        updateStopwatchUI();
        DOM.stopwatchStart.classList.remove('hidden');
        DOM.stopwatchStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        DOM.stopwatchPause.classList.add('hidden');
    } else {
        // Just pause in UI
        DOM.stopwatchStart.classList.remove('hidden');
        DOM.stopwatchStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
        DOM.stopwatchPause.classList.add('hidden');
    }
}

function resetStopwatch() {
    pauseStopwatch();
    stopwatch.elapsedSecs = 0;
    updateStopwatchUI();
    DOM.stopwatchStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
}

// --- Calendar Renders (Stubs for next step) ---
function renderMonthlyCalendar() {
    // We will expand this based on precise Date math
    DOM.monthlyMonthDisplay.textContent = state.monthlyViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    DOM.monthlyDaysGrid.innerHTML = '';
    
    const year = state.monthlyViewDate.getFullYear();
    const month = state.monthlyViewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Today string in local time, not UTC
    const todayStr = state.currentDate.getFullYear() + '-' + String(state.currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(state.currentDate.getDate()).padStart(2, '0');

    // Previous month filler days
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        createDayCell(d, true);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        createDayCell(d, false, d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') === todayStr);
    }

    // Next month filler days (to complete 42 cells / 6 rows)
    const totalRendered = firstDay + daysInMonth;
    const remaining = 42 - totalRendered;
    for (let i = 1; i <= remaining; i++) {
        createDayCell(new Date(year, month + 1, i), true);
    }
}

function createDayCell(date, isOtherMonth, isToday = false) {
    const cell = document.createElement('div');
    // Ensure we use local date strings, not UTC shifted strings
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    let classes = 'day-cell glass-panel';
    if (isOtherMonth) classes += ' other-month';
    if (isToday) classes += ' today';
    cell.className = classes;
    
    const tasks = getTasksForDate(dateStr);
    let tasksHtml = '';
    tasks.forEach(t => {
        tasksHtml += `<div class="mini-task ${t.priority} ${t.completed ? 'completed' : ''}">${t.time ? t.time+' ' : ''}${t.title}</div>`;
    });

    cell.innerHTML = `
        <span class="day-number">${date.getDate()}</span>
        <div class="day-tasks">
            ${tasksHtml}
        </div>
    `;
    DOM.monthlyDaysGrid.appendChild(cell);
}

function renderWeeklyCalendar() {
    DOM.weeklyGrid.innerHTML = '';
    
    // Find start of current week (Sunday)
    let curr = new Date(state.currentDate);
    curr.setDate(curr.getDate() - curr.getDay());
    
    // Today local string
    const todayStr = state.currentDate.getFullYear() + '-' + String(state.currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(state.currentDate.getDate()).padStart(2, '0');

    for (let i = 0; i < 7; i++) {
        const d = new Date(curr);
        d.setDate(d.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const isToday = dateStr === todayStr;
        
        const col = document.createElement('div');
        col.className = 'week-column';
        
        const tasks = getTasksForDate(dateStr);
        let tasksHtml = '';
        tasks.sort((a,b) => (a.time || '24:00').localeCompare(b.time || '24:00')).forEach(t => {
            tasksHtml += `
                <div class="week-task-card ${t.priority} ${t.completed ? 'completed' : ''}">
                    <strong>${t.time || 'Anytime'}</strong><br>
                    <span style="${t.completed ? 'text-decoration:line-through; opacity:0.6' : ''}">${t.title}</span>
                </div>
            `;
        });

        col.innerHTML = `
            <div class="week-day-header">
                <div class="week-day-name">${d.toLocaleDateString('en-US', { weekday: 'short'})}</div>
                <div class="week-day-num ${isToday ? 'today' : ''}">${d.getDate()}</div>
            </div>
            <div class="week-tasks">
                ${tasksHtml}
            </div>
        `;
        DOM.weeklyGrid.appendChild(col);
    }
}

// --- Notifications ---
function requestNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
}

function checkNotifications() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    let modified = false;

    state.tasks.forEach(task => {
        if (!task.completed && !task.notified && task.date === todayStr && task.time) {
            // If task time is within the next 15 minutes
            const taskTimeDate = new Date(`${todayStr}T${task.time}`);
            const diffInMinutes = (taskTimeDate - now) / 1000 / 60;
            
            if (diffInMinutes > 0 && diffInMinutes <= 15) {
                new Notification("Task Reminder", {
                    body: `${task.title} is due at ${task.time}`,
                    icon: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/svgs/solid/calendar-check.svg" // placeholder icon
                });
                task.notified = true;
                modified = true;
            }
        }
    });

    if (modified) {
        localStorage.setItem('antiplanner_tasks', JSON.stringify(state.tasks));
        // Note: intentionally avoided calling saveTasks() to prevent re-rendering the whole UI on tick
    }
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
