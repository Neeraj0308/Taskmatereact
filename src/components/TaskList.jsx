import React, { useEffect, useState } from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggle, onDelete, onToggleTimer, onAddTime, onUpdate, onReorder, filter, categoryFilter, priorityFilter, statusFilter }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const hasRunning = tasks.some(t => !!t.runningSince && !t.completed);
    if (!hasRunning) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [tasks]);

  const filtered = tasks.filter(t => {
    if (filter) {
      const q = filter.toLowerCase();
      if (!(t.text && t.text.toLowerCase().includes(q))) return false;
    }
    if (categoryFilter && categoryFilter !== "All") {
      if (t.category !== categoryFilter) return false;
    }
    if (priorityFilter && priorityFilter !== "All") {
      if (t.priority !== priorityFilter) return false;
    }
    if (statusFilter && statusFilter !== "All") {
      if (statusFilter === "Active" && t.completed) return false;
      if (statusFilter === "Completed" && !t.completed) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return <p className="tasks-empty">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {filtered.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onToggleTimer={onToggleTimer}
          onAddTime={onAddTime}
          onUpdate={onUpdate}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}

export default TaskList;
