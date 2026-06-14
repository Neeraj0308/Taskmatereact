import React, { useState } from "react";

function TaskInput({ onAdd }) {
  const [text, setText] = useState("");
  const [dueStr, setDueStr] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() !== "") {
      onAdd(text.trim(), dueStr.trim(), category, priority);
      setText("");
      setDueStr("");
      setCategory("Work");
      setPriority("Medium");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <input
        type="text"
        placeholder="Enter a task"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input-field"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="input-field"
        style={{maxWidth:160}}
      >
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="Study">Study</option>
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="input-field"
        style={{maxWidth:140}}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <input
        type="datetime-local"
        placeholder="Due date"
        value={dueStr}
        onChange={(e) => setDueStr(e.target.value)}
        className="input-field"
        style={{maxWidth:220}}
      />
      {/* description removed */}
      <button type="submit" className="btn-add">
        Add
      </button>
    </form>
  );
}

export default TaskInput;
