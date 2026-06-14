import React from "react";

function formatMs(ms = 0) {
  const total = Math.floor(ms / 1000);
  const s = total % 60;
  const m = Math.floor((total / 60) % 60);
  const h = Math.floor(total / 3600);
  return `${h > 0 ? `${h}:` : ""}${h > 0 ? String(m).padStart(2, '0') : m}:${String(s).padStart(2,'0')}`;
}

export default function Dashboard({ items, onClear }) {
  const total = items.reduce((acc, it) => acc + (it.timeSpent || 0), 0);

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h2 style={{margin:0}}>Dashboard</h2>
        <div style={{color:'#64748b'}}>Total time: {formatMs(total)}</div>
      </div>

      {items.length === 0 ? (
        <div className="tasks-empty">No completed tasks yet.</div>
      ) : (
        <div style={{display:'grid',gap:8}}>
          {items.map(it => (
            <div key={it.completedAt} className="task-card">
              <div style={{display:'flex',flexDirection:'column'}}>
                <div style={{fontWeight:600}}>{it.text}</div>
                <div className="time-label">Time: {formatMs(it.timeSpent)}</div>
                <div className="time-label">Created: {it.createdAt ? new Date(it.createdAt).toLocaleString() : '—'}</div>
                <div className="time-label">Due: {it.dueAt ? new Date(it.dueAt).toLocaleString() : '—'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:12,color: it.withinEstimate ? '#10b981' : '#ef4444', fontWeight:600}}>{it.withinEstimate ? 'Within estimate' : 'Over estimate'}</div>
                <div style={{fontSize:12,color:'#64748b',marginTop:6}}>Completed: {new Date(it.completedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:12,textAlign:'right'}}>
        <button className="theme-toggle" onClick={onClear}>Clear Dashboard</button>
      </div>
    </div>
  );
}
