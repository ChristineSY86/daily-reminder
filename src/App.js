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

const REPEATS = [
  { id: "daily", label: "每天" },
  { id: "weekday", label: "工作日" },
  { id: "weekend", label: "周末" },
  { id: "once", label: "仅一次" },
  { id: "custom", label: "指定日期" },
];

const formatCustomDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const FILTERS = [
  { id: "all", label: "全部" },
  { id: "pending", label: "未完成" },
  { id: "work", label: "工作", color: "#C17A3A", bg: "#FDF3E7" },
  { id: "life", label: "生活", color: "#4A8C5C", bg: "#EBF5EE" },
  { id: "health", label: "健康", color: "#B05A7A", bg: "#F9EBF1" },
  { id: "learn", label: "学习", color: "#4A6FA5", bg: "#EAF0FA" },
  { id: "done", label: "已完成" },
];

export default function App() {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", time: "09:00", category: "work", repeat: "daily", note: "", customDate: "" });
  const [editId, setEditId] = useState(null);
  const [animatingId, setAnimatingId] = useState(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)); } catch {}
  }, [reminders]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (form.repeat === "custom" && !form.customDate) return;
    if (editId) {
      setReminders((prev) => prev.map((r) => (r.id === editId ? { ...r, ...form } : r)));
      setEditId(null);
    } else {
      setReminders((prev) => [{ id: Date.now(), ...form, done: false, createdAt: getToday() }, ...prev]);
    }
    setForm({ title: "", time: "09:00", category: "work", repeat: "daily", note: "", customDate: "" });
    setShowForm(false);
  };

  const toggleDone = (id) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 400);
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const deleteReminder = (id) => setReminders((prev) => prev.filter((r) => r.id !== id));

  const startEdit = (r) => {
    setForm({ title: r.title, time: r.time, category: r.category, repeat: r.repeat, note: r.note || "", customDate: r.customDate || "" });
    setEditId(r.id);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const openForm = () => {
    setForm({ title: "", time: "09:00", category: "work", repeat: "daily", note: "", customDate: "" });
    setEditId(null);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); };

  const filtered = reminders.filter((r) => {
    if (filter === "done") return r.done;
    if (filter === "pending") return !r.done;
    if (filter === "all") return true;
    return r.category === filter;
  });

  const pendingCount = reminders.filter((r) => !r.done).length;
  const doneCount = reminders.filter((r) => r.done).length;
  const today = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #FAF6F0; overscroll-behavior: none; }
        input, select, textarea { font-size: 16px !important; }
        ::-webkit-scrollbar { display: none; }
        .filter-bar {
          display: flex; gap: 8px; padding: 0 16px 14px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .filter-btn {
          flex-shrink: 0; padding: 7px 14px; border-radius: 20px;
          border: none; background: #EDE5D8; color: #8B7355;
          font-size: 13px; cursor: pointer; font-family: sans-serif; white-space: nowrap;
        }
        .filter-btn.active { background: #C17A3A; color: #fff; }
        .fab {
          position: fixed;
          bottom: max(28px, env(safe-area-inset-bottom, 28px));
          right: 24px; width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #D4924A, #B5622A);
          color: #fff; font-size: 30px; border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(193,122,58,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; transition: transform 0.3s ease;
        }
        @media (min-width: 600px) {
          .main-wrap { max-width: 480px; margin: 0 auto; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#FAF6F0", fontFamily: "'Noto Serif SC', Georgia, serif", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="main-wrap">

          {/* Header */}
          <div style={{ padding: "max(env(safe-area-inset-top, 0px), 16px) 16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 14, padding: "10px 16px", boxShadow: "0 2px 12px rgba(150,100,50,0.1)", border: "1px solid #EDE5D8" }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: "#C17A3A", lineHeight: 1 }}>{today.getDate()}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#8B7355", fontFamily: "sans-serif" }}>{today.getMonth() + 1}月 {today.getFullYear()}</div>
                  <div style={{ fontSize: 15, color: "#3D2C1E", fontWeight: 600, fontFamily: "sans-serif" }}>星期{weekdays[today.getDay()]}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#FEF0DC", borderRadius: 12, padding: "8px 14px" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#C17A3A", lineHeight: 1 }}>{pendingCount}</span>
                  <span style={{ fontSize: 10, color: "#8B7355", marginTop: 2, fontFamily: "sans-serif" }}>待完成</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#E8F0E9", borderRadius: 12, padding: "8px 14px" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#4A8C5C", lineHeight: 1 }}>{doneCount}</span>
                  <span style={{ fontSize: 10, color: "#8B7355", marginTop: 2, fontFamily: "sans-serif" }}>已完成</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            {FILTERS.map((f) => (
              <button key={f.id} className={`filter-btn${filter === f.id ? " active" : ""}`}
                style={f.color ? { color: filter === f.id ? "#fff" : f.color, background: filter === f.id ? f.color : f.bg } : {}}
                onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>☁️</div>
                <div style={{ fontSize: 17, color: "#8B7355", fontWeight: 600 }}>暂无提醒事项</div>
                <div style={{ fontSize: 13, color: "#B0A090", marginTop: 6, fontFamily: "sans-serif" }}>点击右下角 + 添加提醒</div>
              </div>
            )}

            {filtered.map((r) => {
              const cat = getCategoryById(r.category);
              return (
                <div key={r.id} style={{
                  background: "#FFFBF5", borderRadius: 14, padding: "14px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                  boxShadow: "0 2px 8px rgba(100,70,30,0.08)",
                  border: "1px solid #EDE5D8", borderLeft: `4px solid ${cat.color}`,
                  opacity: r.done ? 0.6 : 1,
                  transform: animatingId === r.id ? "scale(0.97)" : "scale(1)",
                  transition: "all 0.3s ease",
                }}>
                  <button onClick={() => toggleDone(r.id)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      border: `2px solid ${cat.color}`,
                      background: r.done ? cat.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                    }}>
                      {r.done && <svg width="12" height="9" viewBox="0 0 12 9"><polyline points="1,5 4,8 11,1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: r.done ? "#aaa" : "#3D2C1E", textDecoration: r.done ? "line-through" : "none", lineHeight: 1.4, flex: 1, wordBreak: "break-all" }}>
                        {r.title}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color, fontWeight: 500, fontFamily: "sans-serif", flexShrink: 0, marginTop: 2 }}>
                        {cat.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#9C8570", fontFamily: "sans-serif" }}>🕐 {r.time}</span>
                      <span style={{ fontSize: 12, color: "#9C8570", fontFamily: "sans-serif" }}>
                        {r.repeat === "custom"
                          ? `📆 ${formatCustomDate(r.customDate)}`
                          : `🔁 ${REPEATS.find(rep => rep.id === r.repeat)?.label}`}
                      </span>
                      {r.repeat !== "custom" && (
                        <span style={{ fontSize: 12, color: "#9C8570", fontFamily: "sans-serif" }}>📅 {formatDate(r.createdAt)}</span>
                      )}
                    </div>
                    {r.note && (
                      <div style={{ marginTop: 6, fontSize: 13, color: "#8B7355", background: "#F5EFE6", padding: "5px 10px", borderRadius: 8, fontStyle: "italic" }}>
                        {r.note}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                    <button onClick={() => startEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "4px", opacity: 0.5 }}>✏️</button>
                    <button onClick={() => deleteReminder(r.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "4px", opacity: 0.5 }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          {showForm && (
            <div ref={formRef} style={{ padding: "16px 16px 0" }}>
              <div style={{ background: "#FFFBF5", borderRadius: 20, padding: 20, boxShadow: "0 8px 32px rgba(100,70,30,0.12)", border: "1px solid #EDE5D8" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#3D2C1E", marginBottom: 14 }}>
                  {editId ? "编辑提醒" : "新增提醒"}
                </div>

                <input ref={titleRef} style={inputStyle} placeholder="提醒事项..." value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />

                <div style={{ marginTop: 12 }}>
                  <div style={labelStyle}>提醒时间</div>
                  <input type="time" style={inputStyle} value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={labelStyle}>重复频率</div>
                  <select style={inputStyle} value={form.repeat}
                    onChange={(e) => setForm({ ...form, repeat: e.target.value })}>
                    {REPEATS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>

                {form.repeat === "custom" && (
                  <div style={{ marginTop: 12 }}>
                    <div style={labelStyle}>指定日期</div>
                    <input type="date" style={inputStyle} value={form.customDate}
                      min={getToday()}
                      onChange={(e) => setForm({ ...form, customDate: e.target.value })} />
                    {!form.customDate && (
                      <div style={{ fontSize: 12, color: "#B05A7A", marginTop: 4, fontFamily: "sans-serif" }}>请选择一个日期</div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <div style={labelStyle}>分类</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} onClick={() => setForm({ ...form, category: cat.id })}
                        style={{
                          padding: "9px 18px", borderRadius: 20, cursor: "pointer", fontSize: 14,
                          fontFamily: "sans-serif", fontWeight: 500, border: `1.5px solid ${cat.color}`,
                          background: form.category === cat.id ? cat.color : cat.bg,
                          color: form.category === cat.id ? "#fff" : cat.color,
                          transition: "all 0.2s",
                        }}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={labelStyle}>备注（可选）</div>
                  <textarea style={{ ...inputStyle, height: 80, resize: "none", marginTop: 4 }}
                    placeholder="添加备注..." value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={closeForm} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #DDD0BC", background: "transparent", color: "#8B7355", fontSize: 15, cursor: "pointer", fontFamily: "sans-serif" }}>
                    取消
                  </button>
                  <button onClick={handleSubmit} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "#C17A3A", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", boxShadow: "0 4px 12px rgba(193,122,58,0.3)" }}>
                    {editId ? "保存修改" : "添加提醒"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FAB */}
        <button className="fab" style={{ transform: showForm ? "rotate(45deg)" : "rotate(0deg)" }}
          onClick={showForm ? closeForm : openForm}>
          +
        </button>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #DDD0BC",
  borderRadius: 10,
  fontSize: 16,
  fontFamily: "sans-serif",
  background: "#FAF6F0",
  color: "#3D2C1E",
  outline: "none",
  display: "block",
  appearance: "none",
  WebkitAppearance: "none",
};

const labelStyle = {
  fontSize: 12,
  color: "#8B7355",
  fontFamily: "sans-serif",
  fontWeight: 500,
  marginBottom: 4,
};
