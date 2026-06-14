import React from "react";

function TaskItem({ task, onToggle, onDelete, onToggleTimer, onAddTime }) {
  const formatMs = (ms = 0) => {
    const total = Math.floor(ms / 1000);
    const s = total % 60;
    const m = Math.floor((total / 60) % 60);
    const h = Math.floor(total / 3600);
    return `${h > 0 ? `${h}:` : ""}${h > 0 ? String(m).padStart(2, '0') : m}:${String(s).padStart(2,'0')}`;
  };

  const handleAddTime = () => {
    const entry = window.prompt("Add time (hh:mm:ss or minutes). Examples: '1:30:00' or '45'", "15");
    if (!entry) return;
    const parseTime = (val) => {
      const s = String(val).trim();
      if (s.includes(':')) {
        const parts = s.split(':').map(p => Number(p) || 0);
        let seconds = 0; let mul = 1;
        for (let i = parts.length - 1; i >= 0; i--) { seconds += parts[i] * mul; mul *= 60; }
        return seconds * 1000;
      }
      const mins = Number(s) || 0;
      return mins * 60 * 1000;
    };
    const ms = parseTime(entry);
    if (ms > 0) onAddTime(task.id, ms / 60000);
  };

  return (
    <div className="task-card">
      <div className="task-left" onClick={() => onToggle(task.id)}>
        <div className="task-checkbox">{task.completed ? "✔" : ""}</div>
        <div style={{display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div className={`task-text ${task.completed ? "completed" : ""}`}>{task.text}</div>
            {task.dueAt ? (
              <div style={{fontSize:12,color: task.dueAt < Date.now() && !task.completed ? '#ef4444' : '#64748b'}}>
                Due: {new Date(task.dueAt).toLocaleString()}
              </div>
            ) : null}
            {task.dueAt && !task.completed && task.dueAt < Date.now() ? (
              <div style={{color:'#ef4444',fontWeight:700,fontSize:12}}>Overdue</div>
            ) : null}
          </div>
          <div className="time-label">Time: {formatMs((task.timeSpent || 0) + (task.runningSince ? Date.now() - task.runningSince : 0))}</div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="theme-toggle" onClick={() => onToggleTimer(task.id)}>{task.runningSince ? '⏸️ Stop' : '▶️ Start'}</button>
        <button className="theme-toggle" onClick={handleAddTime}>+ mins</button>
        <button onClick={() => onDelete(task.id)} className="btn-delete">❌</button>
      </div>
    </div>
  );
}

export default TaskItem;
