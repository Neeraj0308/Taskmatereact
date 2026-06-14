import React, { useState } from "react";

function TaskInput({ onAdd }) {
  const [text, setText] = useState("");
  const [dueStr, setDueStr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() !== "") {
      onAdd(text.trim(), dueStr.trim());
      setText("");
      setDueStr("");
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
      <input
        type="datetime-local"
        placeholder="Due date"
        value={dueStr}
        onChange={(e) => setDueStr(e.target.value)}
        className="input-field"
        style={{maxWidth:220}}
      />
      <button type="submit" className="btn-add">
        Add
      </button>
    </form>
  );
}

export default TaskInput;
