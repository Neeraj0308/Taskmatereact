import React from "react";

function TaskItem({ task, onToggle, onDelete, onToggleTimer, onAddTime, onUpdate, onReorder }) {
  const [isDragOver, setIsDragOver] = React.useState(false);
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

  const [editing, setEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(task.text);
  const [editDue, setEditDue] = React.useState(task.dueAt ? new Date(task.dueAt).toISOString().slice(0,16) : "");
  const [editCategory, setEditCategory] = React.useState(task.category || "Work");
  const [editPriority, setEditPriority] = React.useState(task.priority || "Medium");

  const saveEdit = () => {
    const dueTs = editDue ? Date.parse(editDue) : null;
    onUpdate(task.id, { text: editTitle, dueAt: dueTs, category: editCategory, priority: editPriority, overdueNotifiedAt: null });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditTitle(task.text);
    setEditDue(task.dueAt ? new Date(task.dueAt).toISOString().slice(0,16) : "");
    setEditCategory(task.category || "Work");
    setEditPriority(task.priority || "Medium");
  };

  const handleDragStart = (event) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(task.id));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const sourceId = Number(event.dataTransfer.getData("text/plain"));
    if (sourceId && sourceId !== task.id && onReorder) {
      onReorder(sourceId, task.id);
    }
  };

  return (
    <div
      className={`task-card ${isDragOver ? "drag-over" : ""}`}
      draggable={!editing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {editing ? (
        <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
          <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="input-field" />
          <select value={editCategory} onChange={e=>setEditCategory(e.target.value)} className="input-field" style={{maxWidth:180}}>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Study">Study</option>
          </select>
          <select value={editPriority} onChange={e=>setEditPriority(e.target.value)} className="input-field" style={{maxWidth:140}}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input type="datetime-local" value={editDue} onChange={e=>setEditDue(e.target.value)} className="input-field" />
          <div style={{display:'flex',gap:8}}>
            <button className="btn-add" onClick={saveEdit}>Save</button>
            <button className="theme-toggle" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-left" onClick={() => onToggle(task.id)}>
            <div className="task-checkbox">{task.completed ? "✔" : ""}</div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <div className={`task-text ${task.completed ? "completed" : ""}`}>{task.text}</div>
                {task.priority ? (
                  <div className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</div>
                ) : null}
                {task.category ? (
                  <div className="category-badge">{task.category}</div>
                ) : null}
                {task.dueAt ? (
                  <div style={{fontSize:12,color: task.dueAt < Date.now() && !task.completed ? '#ef4444' : '#64748b'}}>
                    Due: {new Date(task.dueAt).toLocaleString()}
                  </div>
                ) : null}
                {task.dueAt && !task.completed && task.dueAt < Date.now() ? (
                  <div className="overdue-badge">Overdue reminder active</div>
                ) : null}
              </div>
              <div className="time-label">Time: {formatMs((task.timeSpent || 0) + (task.runningSince ? Date.now() - task.runningSince : 0))}</div>
              {task.startAt ? <div className="time-label">Started at: {new Date(task.startAt).toLocaleString()}</div> : null}
              {task.endAt ? <div className="time-label">Ended at: {new Date(task.endAt).toLocaleString()}</div> : null}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button className="theme-toggle" onClick={() => onToggleTimer(task.id)}>{task.runningSince ? '⏸️ Stop' : '▶️ Start'}</button>
            <button className="theme-toggle" onClick={handleAddTime}>+ time</button>
            <button className="theme-toggle" onClick={()=>setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(task.id)} className="btn-delete">❌</button>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskItem;
