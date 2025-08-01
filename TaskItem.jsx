import React from "react";

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded shadow mb-2">
      <div
        className={`flex-1 cursor-pointer ${
          task.completed ? "line-through text-gray-400" : ""
        }`}
        onClick={() => onToggle(task.id)}
      >
        {task.text}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700 font-bold ml-4"
      >
        ❌
      </button>
    </div>
  );
}

export default TaskItem;
