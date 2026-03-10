import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "daily-reminders-v1";

const CATEGORIES = [
  { id: "work", label: "工作", color: "#C17A3A", bg: "#FDF3E7" },
  { id: "life", label: "生活", color: "#4A8C5C", bg: "#EBF5EE" },
  { id: "health", label: "健康", color: "#B05A7A", bg: "#F9EBF1" },
  { id: "learn", label: "学习", color: "#4A6FA5", bg: "#EAF0FA" },
];

const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const getToday = () => new Date().toISOString().split("T")[0];

export default function App() {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", time: "09:00", category: "work", repeat: "daily", note: "" });
  const [editId, setEditId] = useState(null);
  const [animatingId, setAnimatingId] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)); } catch {}
  }, [reminders]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setReminders((prev) => prev.map((r) => (r.id === editId ? { ...r, ...form } : r)));
      setEditId(null);
    } else {
      setReminders((prev) => [{ id: Date.now(), ...form, done: false, createdAt: getToday() }, ...prev]);
    }
    setForm({ title: "", time: "09:00", category: "work", repeat: "daily", note: "" });
    setShowForm(false);
  };

  const toggleDone = (id) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 600);
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const deleteReminder = (id) => setReminders((prev) => prev.filter((r) => r.id !== id));

  const startEdit = (r) => {
    setForm({ title: r.title, time: r.time, category: r.category, repeat: r.repeat, note: r.note || "" });
    setEditId(r.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const filtered = reminders.filter((r) => {
    if (filter === "done") return r.done;
    if (filter === "pending") return !r.done;
    if (filter === "all") return true;
    return r.category === filter;
  });

  const pendingCount = reminders.filter((r) => !r.done).length;
  const doneCount = reminders.filter((r) => r.done).length;

  const REPEATS = [
    { id: "daily", label: "每天" },
    { id: "weekday", label: "工作日" },
    { id: "weekend", label: "周末" },
    { id: "once", label: "仅一次" },
  ];

  const today = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div style={styles.root}>
      <div style={styles.texture} />
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.dateBlock}>
            <span style={styles.dateNum}>{today.getDate()}</span>
            <div>
              <div style={styles.dateMonth}>{today.getMonth() + 1}月 {today.getFullYear()}</div>
              <div style={styles.dateWeek}>星期{weekdays[today.getDay()]}</div>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.statPill}>
            <span style={styles.statNum}>{pendingCount}</span>
            <span style={styles.statLabel}>待完成</span>
          </div>
          <div style={{ ...styles.statPill, background: "#E8F0E9" }}>
            <span style={{ ...styles.statNum, color: "#4A8C5C" }}>{doneCount}</span>
            <span style={styles.statLabel}>已完成</span>
          </div>
        </div>
      </header>

      <div style={styles.filterBar}>
        {[
          { id: "all", label: "全部" },
          { id: "pending", label: "未完成" },
          ...CATEGORIES,
          { id: "done", label: "已完成" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{
              ...styles.filterBtn,
              ...(filter === f.id ? styles.filterBtnActive : {}),
              ...(f.color ? { color: filter === f.id ? "#fff" : f.color, background: filter === f.id ? f.color : f.bg } : {}),
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>☁️</div>
            <div style={styles.emptyText}>暂无提醒事项</div>
            <div style={styles.emptyHint}>点击下方 + 添加你的第一条提醒</div>
          </div>
        )}
        {filtered.map((r) => {
          const cat = getCategoryById(r.category);
          return (
            <div key={r.id} style={{
              ...styles.card,
              opacity: r.done ? 0.65 : 1,
              borderLeft: `4px solid ${cat.color}`,
              transform: animatingId === r.id ? "scale(0.97)" : "scale(1)",
              transition: "all 0.3s ease",
            }}>
              <button style={styles.checkBtn} onClick={() => toggleDone(r.id)}>
                <div style={{ ...styles.checkCircle, background: r.done ? cat.color : "transparent", borderColor: cat.color }}>
                  {r.done && <svg width="12" height="9" viewBox="0 0 12 9"><polyline points="1,5 4,8 11,1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <span style={{ ...styles.cardTitle, textDecoration: r.done ? "line-through" : "none", color: r.done ? "#aaa" : "#3D2C1E" }}>{r.title}</span>
                  <span style={{ ...styles.catTag, background: cat.bg, color: cat.color }}>{cat.label}</span>
                </div>
                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>🕐 {r.time}</span>
                  <span style={styles.metaItem}>🔁 {REPEATS.find(rep => rep.id === r.repeat)?.label}</span>
                  <span style={styles.metaItem}>📅 {formatDate(r.createdAt)}</span>
                </div>
                {r.note && <div style={styles.cardNote}>{r.note}</div>}
              </div>
              <div style={styles.cardActions}>
                <button style={styles.actionBtn} onClick={() => startEdit(r)}>✏️</button>
                <button style={{ ...styles.actionBtn, color: "#D06060" }} onClick={() => deleteReminder(r.id)}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div ref={formRef} style={styles.formWrap}>
          <div style={styles.formCard}>
            <div style={styles.formTitle}>{editId ? "编辑提醒" : "新增提醒"}</div>
            <input style={styles.input} placeholder="提醒事项..." value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>提醒时间</label>
                <input type="time" style={styles.input} value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>重复</label>
                <select style={styles.input} value={form.repeat}
                  onChange={(e) => setForm({ ...form, repeat: e.target.value })}>
                  {REPEATS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>分类</label>
              <div style={styles.catRow}>
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setForm({ ...form, category: cat.id })}
                    style={{ ...styles.catBtn, background: form.category === cat.id ? cat.color : cat.bg, color: form.category === cat.id ? "#fff" : cat.color, border: `1.5px solid ${cat.color}` }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea style={{ ...styles.input, height: 72, resize: "vertical" }}
              placeholder="备注（可选）..." value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <div style={styles.formBtns}>
              <button style={styles.cancelBtn} onClick={() => { setShowForm(false); setEditId(null); }}>取消</button>
              <button style={styles.submitBtn} onClick={handleSubmit}>{editId ? "保存修改" : "添加提醒"}</button>
            </div>
          </div>
        </div>
      )}

      <button style={{ ...styles.fab, transform: showForm ? "rotate(45deg)" : "rotate(0deg)" }}
        onClick={() => {
          if (showForm) { setShowForm(false); setEditId(null); }
          else { setForm({ title: "", time: "09:00", category: "work", repeat: "daily", note: "" }); setEditId(null); setShowForm(true); }
        }}>+</button>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#FAF6F0", fontFamily: "'Noto Serif SC', Georgia, serif", position: "relative", paddingBottom: 120 },
  texture: { position: "fixed", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: "none", zIndex: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 24px 16px", position: "relative", zIndex: 1 },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  dateBlock: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: "12px 18px", boxShadow: "0 2px 12px rgba(150,100,50,0.1)", border: "1px solid #EDE5D8" },
  dateNum: { fontSize: 44, fontWeight: 700, color: "#C17A3A", lineHeight: 1 },
  dateMonth: { fontSize: 13, color: "#8B7355", fontWeight: 500 },
  dateWeek: { fontSize: 16, color: "#3D2C1E", fontWeight: 600, fontFamily: "sans-serif" },
  headerRight: { display: "flex", gap: 10 },
  statPill: { display: "flex", flexDirection: "column", alignItems: "center", background: "#FEF0DC", borderRadius: 12, padding: "8px 16px", minWidth: 56 },
  statNum: { fontSize: 22, fontWeight: 700, color: "#C17A3A", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#8B7355", marginTop: 2 },
  filterBar: { display: "flex", gap: 8, padding: "0 24px 16px", overflowX: "auto", position: "relative", zIndex: 1, scrollbarWidth: "none" },
  filterBtn: { flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", background: "#EDE5D8", color: "#8B7355", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", transition: "all 0.2s" },
  filterBtnActive: { background: "#C17A3A", color: "#fff" },
  list: { padding: "0 20px", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 },
  card: { background: "#FFFBF5", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 2px 8px rgba(100,70,30,0.08)", border: "1px solid #EDE5D8" },
  checkBtn: { background: "none", border: "none", padding: 0, cursor: "pointer", marginTop: 2, flexShrink: 0 },
  checkCircle: { width: 22, height: 22, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardTitle: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  catTag: { fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, fontFamily: "sans-serif", flexShrink: 0 },
  cardMeta: { display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" },
  metaItem: { fontSize: 12, color: "#9C8570", fontFamily: "sans-serif" },
  cardNote: { marginTop: 6, fontSize: 13, color: "#8B7355", background: "#F5EFE6", padding: "6px 10px", borderRadius: 8, fontStyle: "italic" },
  cardActions: { display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 },
  actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: "4px 6px", borderRadius: 6, opacity: 0.6 },
  empty: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: "#8B7355", fontWeight: 600 },
  emptyHint: { fontSize: 13, color: "#B0A090", marginTop: 6, fontFamily: "sans-serif" },
  formWrap: { padding: "16px 20px", position: "relative", zIndex: 1 },
  formCard: { background: "#FFFBF5", borderRadius: 20, padding: 24, boxShadow: "0 8px 32px rgba(100,70,30,0.12)", border: "1px solid #EDE5D8", display: "flex", flexDirection: "column", gap: 14 },
  formTitle: { fontSize: 18, fontWeight: 700, color: "#3D2C1E" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #DDD0BC", borderRadius: 10, fontSize: 14, fontFamily: "sans-serif", background: "#FAF6F0", color: "#3D2C1E", outline: "none", boxSizing: "border-box" },
  row: { display: "flex", gap: 12 },
  field: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#8B7355", fontFamily: "sans-serif", fontWeight: 500 },
  catRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: { padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", fontWeight: 500, transition: "all 0.2s" },
  formBtns: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 },
  cancelBtn: { padding: "10px 20px", borderRadius: 10, border: "1.5px solid #DDD0BC", background: "transparent", color: "#8B7355", fontSize: 14, cursor: "pointer", fontFamily: "sans-serif" },
  submitBtn: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#C17A3A", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", boxShadow: "0 4px 12px rgba(193,122,58,0.3)" },
  fab: { position: "fixed", bottom: 32, right: 28, width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg, #D4924A, #B5622A)", color: "#fff", fontSize: 32, fontWeight: 300, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(193,122,58,0.45)", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, zIndex: 100, transition: "transform 0.3s ease" },
};
