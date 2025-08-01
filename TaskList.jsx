import React from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="text-gray-500 text-center">No tasks found.</p>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
