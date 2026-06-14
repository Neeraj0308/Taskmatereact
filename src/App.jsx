import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("taskmate-current-user") || null;
  });

  const [authError, setAuthError] = useState("");
  const [currentTeamId, setCurrentTeamId] = useState(() => localStorage.getItem("taskmate-current-team") || "");
  const [teamMode, setTeamMode] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamError, setTeamError] = useState("");
  const [teams, setTeams] = useState(() => JSON.parse(localStorage.getItem("taskmate-teams")) || {});
  const [tasks, setTasks] = useState([]);

  const loadPersonalTasks = (user) => {
    const key = `taskmate-tasks-${user}`;
    setTasks(JSON.parse(localStorage.getItem(key)) || []);
  };

  const loadTeamTasks = (teamId) => {
    setTasks(JSON.parse(localStorage.getItem(`taskmate-team-tasks-${teamId}`)) || []);
  };

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      return;
    }
    if (teamMode && currentTeamId) {
      const team = teams[currentTeamId];
      if (!team || !team.members.includes(currentUser)) {
        setTeamMode(false);
        setCurrentTeamId("");
        localStorage.removeItem("taskmate-current-team");
        loadPersonalTasks(currentUser);
        return;
      }
      loadTeamTasks(currentTeamId);
    } else {
      loadPersonalTasks(currentUser);
    }
  }, [currentUser, currentTeamId, teamMode, teams]);

  useEffect(() => {
    if (!currentUser) return;
    if (teamMode && currentTeamId) {
      localStorage.setItem(`taskmate-team-tasks-${currentTeamId}`, JSON.stringify(tasks));
    } else {
      const key = `taskmate-tasks-${currentUser}`;
      localStorage.setItem(key, JSON.stringify(tasks));
    }
  }, [tasks, currentTeamId, teamMode, currentUser]);

  useEffect(() => {
    localStorage.setItem('taskmate-teams', JSON.stringify(teams));
  }, [teams]);

  const addTask = (text, dueInput = null, category = "Work", priority = "Medium") => {
    const dueAt = dueInput ? (isNaN(Date.parse(dueInput)) ? null : Date.parse(dueInput)) : null;
    const newTask = {
      id: Date.now(),
      text,
      category,
      priority,
      completed: false,
      timeSpent: 0,
      runningSince: null,
      startAt: null,
      endAt: null,
      createdAt: Date.now(),
      dueAt,
      overdueNotifiedAt: null
    };
    setTasks([newTask, ...tasks]);
  };

  const currentTeam = currentTeamId ? teams[currentTeamId] : null;
  const userTeams = Object.values(teams).filter(team => team.members.includes(currentUser));

  const handleCreateTeam = () => {
    const name = teamName.trim();
    if (!name) {
      setTeamError("Please enter a team name.");
      return;
    }
    if (name.length < 2) {
      setTeamError("Team name must be at least 2 characters.");
      return;
    }
    const existing = Object.values(teams).find(team => team.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setTeamError("A team with that name already exists. Join it instead.");
      return;
    }
    const id = String(Date.now());
    setTeams(prev => ({
      ...prev,
      [id]: { id, name, members: [currentUser] }
    }));
    setCurrentTeamId(id);
    localStorage.setItem("taskmate-current-team", id);
    setTeamMode(true);
    setTeamName("");
    setTeamError("");
  };

  const handleJoinTeam = () => {
    const name = teamName.trim();
    if (!name) {
      setTeamError("Please enter a team name.");
      return;
    }
    const found = Object.values(teams).find(team => team.name.toLowerCase() === name.toLowerCase());
    if (!found) {
      setTeamError("No team found with that name.");
      return;
    }
    if (found.members.includes(currentUser)) {
      setCurrentTeamId(found.id);
      setTeamMode(true);
      localStorage.setItem("taskmate-current-team", found.id);
      setTeamName("");
      return;
    }
    setTeams(prev => ({
      ...prev,
      [found.id]: { ...found, members: [...found.members, currentUser] }
    }));
    setCurrentTeamId(found.id);
    localStorage.setItem("taskmate-current-team", found.id);
    setTeamMode(true);
    setTeamName("");
    setTeamError("");
  };

  const handleLogin = (username, password) => {
    const users = JSON.parse(localStorage.getItem("taskmate-users")) || {};
    if (!users[username]) {
      return "No account found for that username.";
    }
    if (users[username] !== password) {
      return "Invalid password.";
    }
    setCurrentUser(username);
    localStorage.setItem("taskmate-current-user", username);
    setAuthError("");
    setTeamMode(false);
    setCurrentTeamId("");
    localStorage.removeItem("taskmate-current-team");
    const key = `taskmate-tasks-${username}`;
    setTasks(JSON.parse(localStorage.getItem(key)) || []);
    return "";
  };

  const handleLeaveTeam = () => {
    if (!currentTeam) return;
    const remaining = currentTeam.members.filter(member => member !== currentUser);
    if (remaining.length === 0) {
      const updatedTeams = { ...teams };
      delete updatedTeams[currentTeamId];
      setTeams(updatedTeams);
    } else {
      setTeams(prev => ({
        ...prev,
        [currentTeamId]: { ...currentTeam, members: remaining }
      }));
    }
    setCurrentTeamId("");
    localStorage.removeItem("taskmate-current-team");
    setTeamMode(false);
    loadPersonalTasks(currentUser);
  };

  const handleSignup = (username, password) => {
    const users = JSON.parse(localStorage.getItem("taskmate-users")) || {};
    if (users[username]) {
      return "That username is already taken.";
    }
    users[username] = password;
    localStorage.setItem("taskmate-users", JSON.stringify(users));
    setCurrentUser(username);
    localStorage.setItem("taskmate-current-user", username);
    setTasks([]);
    setAuthError("");
    return "";
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("taskmate-current-user");
    setTasks([]);
  };

  const updateTask = (id, fields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;

      // If timer is running, stop it and accumulate
      let updated = { ...task };
      if (updated.runningSince) {
        const elapsed = Date.now() - updated.runningSince;
        updated.timeSpent = (updated.timeSpent || 0) + elapsed;
        updated.runningSince = null;
        updated.endAt = Date.now();
        updated.startAt = updated.startAt || task.runningSince;
      }

      updated.completed = !updated.completed;

      // If completed now, record to dashboard
      if (updated.completed) {
        if (!updated.endAt) {
          updated.endAt = Date.now();
        }
        const entry = {
          id: updated.id,
          text: updated.text,
          timeSpent: updated.timeSpent || 0,
          createdAt: updated.createdAt || null,
          dueAt: updated.dueAt || null,
          startAt: updated.startAt || null,
          endAt: updated.endAt || null,
          completedAt: Date.now()
        };
        setDashboard(d => [entry, ...d]);
      }

      return updated;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const reorderTasks = (id, targetIndex) => {
    setTasks(prev => {
      const currentIndex = prev.findIndex(task => task.id === id);
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  // Timer controls
  const toggleTimer = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      if (task.runningSince) {
        const elapsed = Date.now() - task.runningSince;
        return { ...task, runningSince: null, timeSpent: (task.timeSpent || 0) + elapsed, endAt: Date.now() };
      } else {
        return { ...task, runningSince: Date.now(), startAt: task.startAt || Date.now(), endAt: null };
      }
    }));
  };

  const addManualTime = (id, minutes) => {
    const ms = Math.max(0, Number(minutes) || 0) * 60 * 1000;
    if (ms === 0) return;
    setTasks(prev => prev.map(task => task.id === id ? { ...task, timeSpent: (task.timeSpent || 0) + ms } : task));
  };

  // Dashboard state
  const [dashboard, setDashboard] = useState(() => {
    return JSON.parse(localStorage.getItem('dashboard')) || [];
  });

  useEffect(() => {
    localStorage.setItem('dashboard', JSON.stringify(dashboard));
  }, [dashboard]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      try { Notification.requestPermission(); } catch (e) {}
    }
  }, []);

  // Periodically check for overdue tasks and notify once per task
  useEffect(() => {
    const REMINDER_INTERVAL = 5 * 60 * 1000;
    const id = setInterval(() => {
      const now = Date.now();
      setTasks(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (!t.completed && t.dueAt && now > t.dueAt) {
            const shouldNotify = !t.overdueNotifiedAt || (now - t.overdueNotifiedAt) >= REMINDER_INTERVAL;
            if (shouldNotify) {
              const message = `${t.text} is overdue. You are not done with your work yet.`;
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                try { new Notification('Task overdue', { body: message }); } catch (e) { /* ignore */ }
              } else {
                try { window.alert(`Task overdue: ${message}`); } catch (e) {}
              }
              changed = true;
              return { ...t, overdueNotifiedAt: now };
            }
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const [showDashboard, setShowDashboard] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const clearDashboard = () => setDashboard([]);

  return (
    <div className={`app-container ${theme === "dark" ? "theme-dark" : ""}`}>
      <header className="app-header">
        <h1 className="app-title">📝 TaskMate</h1>
        <div className="app-sub">Simple, beautiful task management</div>
        <div className="controls">
          {currentUser && (
            <>
              <input placeholder="Search tasks..." className="input-field" style={{maxWidth:280}} value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="input-field" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{maxWidth:160}}>
                <option value="All">All categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Study">Study</option>
              </select>
              <select className="input-field" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{maxWidth:140}}>
                <option value="All">All priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{maxWidth:140}}>
                <option value="All">All status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="theme-toggle" onClick={() => setShowDashboard(s => !s)} aria-label="Toggle dashboard">
                {showDashboard ? '⬅️ Back' : '📊 Dashboard'}
              </button>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      <main>
        {!currentUser ? (
          <AuthForm onLogin={handleLogin} onSignup={handleSignup} errorMessage={authError} />
        ) : !showDashboard ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
              <div style={{ color: "#64748b" }}>
                Signed in as <strong>{currentUser}</strong>
                {teamMode && currentTeam ? (
                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    Team: <strong>{currentTeam.name}</strong> • Members: {currentTeam.members.join(", ")}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {!teamMode ? (
                  <>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Team name"
                      value={teamName}
                      onChange={e => { setTeamName(e.target.value); setTeamError(""); }}
                      style={{ minWidth: 180 }}
                    />
                    <button className="theme-toggle" onClick={handleCreateTeam}>Create Team</button>
                    <button className="theme-toggle" onClick={handleJoinTeam}>Join Team</button>
                    {teamError && (
                      <div style={{ color: '#b91c1c', marginTop: 6, fontSize: 13 }}>{teamError}</div>
                    )}
                  </>
                ) : (
                  <button className="theme-toggle" onClick={handleLeaveTeam}>Leave Team</button>
                )}
                <button className="theme-toggle" onClick={handleLogout}>Logout</button>
              </div>
            </div>
            <TaskInput onAdd={addTask} />
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onToggleTimer={toggleTimer}
              onAddTime={addManualTime}
              onUpdate={updateTask}
              onReorder={reorderTasks}
              filter={search}
              categoryFilter={categoryFilter}
              priorityFilter={priorityFilter}
              statusFilter={statusFilter}
            />
          </>
        ) : (
          <Dashboard items={dashboard} onClear={clearDashboard} />
        )}
      </main>
    </div>
  );
}

export default App;
