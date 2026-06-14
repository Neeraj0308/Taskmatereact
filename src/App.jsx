import React, { useState, useEffect } from "react";
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

  const [tasks, setTasks] = useState(() => {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text, dueInput = null) => {
    const dueAt = dueInput ? (isNaN(Date.parse(dueInput)) ? null : Date.parse(dueInput)) : null;
    const newTask = { id: Date.now(), text, completed: false, timeSpent: 0, runningSince: null, createdAt: Date.now(), dueAt, overdueNotified: false };
    setTasks([newTask, ...tasks]);
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
      }

      updated.completed = !updated.completed;

      // If completed now, record to dashboard
      if (updated.completed) {
        const entry = {
          id: updated.id,
          text: updated.text,
          timeSpent: updated.timeSpent || 0,
          createdAt: updated.createdAt || null,
          dueAt: updated.dueAt || null,
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

  // Timer controls
  const toggleTimer = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      if (task.runningSince) {
        const elapsed = Date.now() - task.runningSince;
        return { ...task, runningSince: null, timeSpent: (task.timeSpent || 0) + elapsed };
      } else {
        return { ...task, runningSince: Date.now() };
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
    const id = setInterval(() => {
      const now = Date.now();
      setTasks(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (!t.completed && t.dueAt && now > t.dueAt && !t.overdueNotified) {
            // send notification
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              try { new Notification('Task overdue', { body: `${t.text} is past its due time` }); } catch (e) { /* ignore */ }
            } else {
              // fallback alert
              try { window.alert(`Task overdue: ${t.text}`); } catch (e) {}
            }
            changed = true;
            return { ...t, overdueNotified: true };
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const [showDashboard, setShowDashboard] = useState(false);

  const clearDashboard = () => setDashboard([]);

  return (
    <div className={`app-container ${theme === "dark" ? "theme-dark" : ""}`}>
      <header className="app-header">
        <h1 className="app-title">📝 TaskMate</h1>
        <div className="app-sub">Simple, beautiful task management</div>
        <div className="controls">
          <button className="theme-toggle" onClick={() => setShowDashboard(s => !s)} aria-label="Toggle dashboard">
            {showDashboard ? '⬅️ Back' : '📊 Dashboard'}
          </button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      <main>
        {!showDashboard ? (
          <>
            <TaskInput onAdd={addTask} />
            <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onToggleTimer={toggleTimer} onAddTime={addManualTime} />
          </>
        ) : (
          <Dashboard items={dashboard} onClear={clearDashboard} />
        )}
      </main>
    </div>
  );
}

export default App;
