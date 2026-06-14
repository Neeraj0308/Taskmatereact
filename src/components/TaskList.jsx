import React, { useEffect, useState } from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggle, onDelete, onToggleTimer, onAddTime }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const hasRunning = tasks.some(t => !!t.runningSince && !t.completed);
    if (!hasRunning) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [tasks]);

  if (tasks.length === 0) {
    return <p className="tasks-empty">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onToggleTimer={onToggleTimer}
          onAddTime={onAddTime}
        />
      ))}
    </div>
  );
}

export default TaskList;
