const AITaskSection = ({ tasks, setTasks, t }) => {
  const [newTask, setNewTask] = useState('');
  const update = (i, val) => setTasks(prev => prev.map((tk, idx) => idx === i ? { ...tk, text: val } : tk));
  const remove = (i) => setTasks(prev => prev.filter((_, idx) => idx !== i));
  const add = () => { if (!newTask.trim()) return; setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), assignee: null, assigneeId: null }]); setNewTask(''); };
  const inp = { background: t.inputBg, border:`1px solid ${t.border}`, borderRadius:'8px', padding:'8px 12px', color:t.text, fontSize:'13px', outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' };
  return (
    <div style={{ marginTop:'20px', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'12px', padding:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <span style={{ fontSize:'11px', fontWeight:'700', color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.7px' }}>✦ AI Generated Tasks</span>
        <span style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:'11px', fontWeight:'700', padding:'2px 10px', borderRadius:'20px' }}>{tasks.length}</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'10px' }}>
        {tasks.map((tk, i) => (
          <div key={tk.id} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ minWidth:'22px', height:'22px', borderRadius:'50%', background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:'10px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
            <input value={tk.text} onChange={e => update(i, e.target.value)} style={{ ...inp, flex:1 }} />
            {tk.assignee && (
              <span style={{ fontSize:'11px', fontWeight:'600', color:'#34d399', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'20px', padding:'2px 10px', whiteSpace:'nowrap', flexShrink:0 }}>
                👤 {tk.assignee}
              </span>
            )}
            <button onClick={() => remove(i)} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', borderRadius:'6px', padding:'6px 10px', cursor:'pointer', fontSize:'12px', flexShrink:0 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key==='Enter' && add()} placeholder="Add a task manually…" style={{ ...inp, flex:1 }} />
        <button onClick={add} style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif" }}>+ Add</button>
      </div>
    </div>
  );
};