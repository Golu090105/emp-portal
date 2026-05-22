import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  accent:       "#2563eb",
  accentLight:  "#dbeafe",
  accentBorder: "#93c5fd",
  accentDark:   "#1d4ed8",
  pageBg:       "#eef2f7",
  cardBg:       "#ffffff",
  cardBorder:   "#dde4ed",
  cardShadow:   "0 2px 16px rgba(15,31,61,0.09)",
  headerBg:     "#1a5fa8",
  t900: "#0a1628",
  t700: "#1e3a5f",
  t500: "#4f6e8f",
  t400: "#8eacc8",
  t200: "#dde4ed",
  green:        "#16a34a",
  greenBg:      "#dcfce7",
  greenBorder:  "#86efac",
  red:          "#dc2626",
  redBg:        "#fee2e2",
  redBorder:    "#fca5a5",
  amber:        "#b45309",
  amberBg:      "#fef3c7",
  amberBorder:  "#fcd34d",
};

const INP = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  fontSize: 13, border: `1.5px solid ${C.cardBorder}`,
  outline: "none", background: "#fff", color: C.t900,
  boxSizing: "border-box", fontFamily: "inherit",
};

const EMPLOYEES = [
  { id:"id1234", name:"Sneha Dey",           dept:"ITSS",    location:"Kolkata",   team:"EMS",       supervisor:"Intikhab Alam", grade:"FTE", validity:"16-05-2026", status:"EXISTING", extended: false },
  { id:"id1236", name:"Soumilya Roy",         dept:"Digital", location:"Mumbai",    team:"CRM IT",    supervisor:"Intikhab Alam", grade:"GAT", validity:"01-07-2026", status:"EXISTING", extended: false },
  { id:"id1237", name:"Raunak Pati",          dept:"SAPSS",   location:"Kolkata",   team:"SAP Basis", supervisor:"Intikhab Alam", grade:"FTE", validity:"10-08-2026", status:"EXISTING", extended: false },
  { id:"id1238", name:"Sohan Chakrabarty",    dept:"ITD",     location:"Hyderabad", team:"Security",  supervisor:"Intikhab Alam", grade:"GAT", validity:"25-05-2026", status:"EXISTING", extended: false },
  { id:"id1239", name:"Sourav Kumar Singh",   dept:"PSPD",    location:"Chennai",   team:"Infra",     supervisor:"Intikhab Alam", grade:"GAT", validity:"30-09-2026", status:"EXISTING", extended: false },
  { id:"id1240", name:"Puspak Paul",          dept:"Digital", location:"Pune",      team:"QA Auto",   supervisor:"Intikhab Alam", grade:"FTE", validity:"15-10-2026", status:"EXISTING", extended: false },
  { id:"id1241", name:"Satyaki Seth",         dept:"ITSS",    location:"Kolkata",   team:"EMS",       supervisor:"Intikhab Alam", grade:"GAT", validity:"22-11-2026", status:"EXISTING", extended: false },
];

function StatusPill({ status }) {
  const s = status === "EXISTING"
    ? { bg: C.greenBg, color: C.green, border: C.greenBorder }
    : { bg: C.amberBg, color: C.amber, border: C.amberBorder };
  return (
    <span style={{
      padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: "0.06em",
    }}>{status}</span>
  );
}

const TH_S = {
  padding: "12px 16px", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: C.t500, background: "#f0f5fb",
  borderBottom: `1.5px solid ${C.cardBorder}`,
  textAlign: "left", whiteSpace: "nowrap",
};
const TD_S = {
  padding: "13px 16px", fontSize: 13,
  borderBottom: `1px solid #eef2f7`,
  color: C.t700, verticalAlign: "middle",
};

/* ── Drawer ── */
function Drawer({ open, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(10,22,40,0.45)", backdropFilter: "blur(3px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(820px, 95vw)", zIndex: 1001,
        background: C.pageBg, boxShadow: "-8px 0 48px rgba(10,22,40,0.22)",
        transform: open ? "translateX(0)" : "translateX(102%)",
        transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 28px",
          background: "linear-gradient(135deg,#1a5fa8,#1e6ec0)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "0.01em" }}>
              Employee Extension
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >✕</button>
        </div>
        <div style={{ flex: 1, padding: "28px 28px 40px" }}>{children}</div>
      </div>
    </>
  );
}

/* ── Extension Form ── */
function ExtensionForm({ employee, onClose, onSuccess, getToken }) {
  const [newValidity, setNewValidity] = useState("");
  const [addInfo,     setAddInfo]     = useState("");
  const [files,       setFiles]       = useState([]);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors,      setErrors]      = useState({});
  const fileRef = useRef();

  const ALLOWED_EXT = /\.(jpg|jpeg|png|pdf|docx)$/i;
  const MAX_FILE_SIZE_MB = 10;

  const handleFile = (e) => {
    const incoming = Array.from(e.target.files);
    const newErrors = {};
    const valid = [];
    incoming.forEach(f => {
      if (!ALLOWED_EXT.test(f.name)) {
        newErrors.files = `"${f.name}" is not allowed. Only JPG, JPEG, PNG, PDF, DOCX.`;
        return;
      }
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        newErrors.files = `"${f.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
        return;
      }
      valid.push(f);
    });
    setErrors(p => ({ ...p, ...newErrors }));
    setFiles(prev => {
      const keys = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...valid.filter(f => !keys.has(f.name + f.size))];
    });
    e.target.value = "";
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!newValidity) {
      e.newValidity = "New validity date is required.";
    } else {
      const [day, month, year] = employee.validity.split("-").map(Number);
      const existing = new Date(year, month - 1, day);
      const chosen   = new Date(newValidity);
      if (chosen <= existing)
        e.newValidity = `New validity must be after current validity (${employee.validity}).`;
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    setServerError("");
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("employeeId",   employee.id);
      formData.append("employeeName", employee.name);
      formData.append("newValidity",  newValidity);
      formData.append("addInfo",      addInfo);
      formData.append("extension",    "Yes");
      files.forEach(f => formData.append("hrAttachments", f));

      const res = await fetch("http://localhost:5000/submit-extension", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,   // ← JWT token
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message || "Submission failed.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      if (onSuccess) onSuccess(employee.id, newValidity);
      setTimeout(() => onClose(), 2500);

    } catch {
      setServerError("Network error. Please ensure the server is running.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "80px 40px", textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: C.greenBg, border: `2px solid ${C.greenBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, marginBottom: 20, boxShadow: "0 4px 20px rgba(22,163,74,0.2)",
        }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.t900, margin: "0 0 10px" }}>
          Extension Submitted!
        </h2>
        <p style={{ fontSize: 13, color: C.t500, maxWidth: 320, lineHeight: 1.6 }}>
          The extension request for <strong>{employee.name}</strong> has been submitted
          and is pending approval. This panel will close automatically.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: C.t500, margin: "0 0 20px" }}>
        Extend validity for the selected employee's access
      </p>

      {/* User Details Card */}
      <div style={{
        background: C.cardBg, borderRadius: 14, border: `1px solid ${C.cardBorder}`,
        boxShadow: C.cardShadow, overflow: "hidden", marginBottom: 20,
      }}>
        <div style={{
          padding: "13px 22px",
          background: "linear-gradient(135deg,#1a5fa8,#1e6ec0)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            User Details
          </span>
          <StatusPill status={employee.status} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Employee","Department","Location","Team","Supervisor","Grade","Validity"].map(h => (
                  <th key={h} style={TH_S}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...TD_S, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: C.t900 }}>{employee.name}</div>
                  <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 2 }}>{employee.id}</div>
                </td>
                <td style={TD_S}>{employee.dept}</td>
                <td style={TD_S}>{employee.location}</td>
                <td style={TD_S}>{employee.team}</td>
                <td style={{ ...TD_S, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: C.t700 }}>{employee.supervisor}</div>
                </td>
                <td style={TD_S}>
                  <span style={{
                    padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}`,
                  }}>{employee.grade}</span>
                </td>
                <td style={TD_S}>
                  <span style={{
                    padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBorder}`,
                  }}>{employee.validity}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Extension Details Card */}
      <div style={{
        background: C.cardBg, borderRadius: 14, border: `1px solid ${C.cardBorder}`,
        boxShadow: C.cardShadow, overflow: "hidden",
      }}>
        <div style={{ padding: "13px 22px", background: "linear-gradient(135deg,#1a5fa8,#1e6ec0)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Extension Details
          </span>
        </div>
        <div style={{ padding: "24px 24px" }}>

          {serverError && (
            <div style={{
              padding: "12px 16px", borderRadius: 9, marginBottom: 20,
              background: C.redBg, border: `1.5px solid ${C.redBorder}`,
              color: C.red, fontSize: 13, fontWeight: 600,
            }}>⚠ {serverError}</div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.t500, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Extension
              </label>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: C.greenBg, border: `1.5px solid ${C.greenBorder}`, color: C.green,
              }}>
                <span style={{ fontSize: 16 }}>✓</span> Yes — Extension Requested
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.t500, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                New Validity <span style={{ color: C.red }}>*</span>
              </label>
              <input
                type="date" value={newValidity}
                onChange={e => { setNewValidity(e.target.value); setErrors(p => ({ ...p, newValidity: "" })); }}
                style={{ ...INP, border: errors.newValidity ? `1.5px solid ${C.red}` : `1.5px solid ${C.cardBorder}` }}
              />
              {errors.newValidity && (
                <div style={{ fontSize: 11, color: C.red, marginTop: 5, fontWeight: 600 }}>⚠ {errors.newValidity}</div>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.t500, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Additional Information
              </label>
              <textarea
                value={addInfo} onChange={e => setAddInfo(e.target.value)}
                rows={3} placeholder="Enter any additional details..."
                style={{ ...INP, resize: "vertical" }}
              />
            </div>
          </div>

          {/* HR Attachments */}
          <div style={{ border: `1.5px solid ${C.redBorder}`, borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
            <div style={{
              padding: "12px 18px", background: "#fff1f2",
              borderBottom: `1px solid ${C.redBorder}`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>
                Divisional Attachment(s) — HR Communication
              </span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: C.t400 }}>
                Saved to: <code style={{ fontSize: 11 }}>public/src/HR attachment/</code>
              </span>
            </div>
            <div style={{ background: "#fff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center" }}>
                <div style={{
                  padding: "14px 18px", fontSize: 13, fontWeight: 600, color: C.t700,
                  borderRight: `1px solid #fee2e2`, background: "#fafafa",
                }}>HR Communication</div>
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => fileRef.current.click()} style={{
                    padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                    background: "#f0f5fb", border: `1px solid ${C.cardBorder}`,
                    color: C.t700, cursor: "pointer", whiteSpace: "nowrap",
                  }}>Choose File</button>
                  <span style={{ fontSize: 12, color: C.t400 }}>
                    {files.length > 0 ? `${files.length} file(s) selected` : "No file chosen"}
                  </span>
                  <input ref={fileRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.docx"
                    style={{ display: "none" }} onChange={handleFile} />
                </div>
              </div>
              {errors.files && (
                <div style={{ padding: "0 18px 10px", fontSize: 11, color: C.red, fontWeight: 600 }}>
                  ⚠ {errors.files}
                </div>
              )}
              {files.length > 0 && (
                <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", borderRadius: 8,
                      background: "#f8fafd", border: `1px solid ${C.cardBorder}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.t700 }}>
                        <span style={{ fontSize: 16 }}>📄</span>
                        <span style={{ fontWeight: 500 }}>{f.name}</span>
                        <span style={{ color: C.t400 }}>({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button onClick={() => removeFile(i)} style={{
                        border: "none", background: C.redBg, color: C.red,
                        padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                        fontSize: 11, fontWeight: 700,
                      }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleSubmit} disabled={submitting} style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "11px 28px", borderRadius: 9, fontSize: 14, fontWeight: 700,
              background: submitting ? "#94a3b8" : "linear-gradient(135deg,#1a5fa8,#2563eb)",
              color: "#fff", border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 3px 12px rgba(37,99,235,0.35)",
              letterSpacing: "0.02em", transition: "all 0.2s",
            }}>
              {submitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2"
                    style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Submit Extension
                </>
              )}
            </button>
            <button onClick={onClose} disabled={submitting} style={{
              padding: "11px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: "#f0f5fb", border: `1.5px solid ${C.cardBorder}`,
              color: C.t700, cursor: submitting ? "not-allowed" : "pointer",
            }}>Cancel</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="date"]:focus, textarea:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        button:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
}

/* ── Employee List Table ── */
function EmployeeListTable({ employees, onSelect }) {
  const [search,  setSearch]  = useState("");
  const [hovered, setHovered] = useState(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{
        background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`,
        boxShadow: C.cardShadow, overflow: "hidden",
      }}>
        {/* Toolbar */}
        <div style={{
          padding: "16px 24px", background: "#f0f5fb",
          borderBottom: `1.5px solid ${C.cardBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg,#1a5fa8,#2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <polyline points="16 11 18 13 22 9"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.t700 }}>Employee Directory</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
              background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}`,
            }}>{filtered.length} records</span>
          </div>
          <div style={{ position: "relative", minWidth: 240 }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={C.t400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or department…"
              style={{ ...INP, paddingLeft: 34, fontSize: 12, border: `1.5px solid ${C.cardBorder}` }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#","Employee Name","Employee ID","Department","Location","Grade","Current Validity","Status","Action"].map(h => (
                  <th key={h} style={{ ...TH_S, textAlign: h === "#" || h === "Action" ? "center" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.id}
                  onMouseEnter={() => setHovered(emp.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: emp.extended ? "#dcfce7" : hovered === emp.id ? "#f0f6ff" : i % 2 === 0 ? C.cardBg : "#f8fafd",
                    borderLeft: emp.extended ? "4px solid #16a34a" : "none",
                    transition: "background 0.12s",
                  }}>
                  <td style={{ ...TD_S, textAlign: "center", color: C.t400, fontWeight: 600, fontSize: 12 }}>{i + 1}</td>
                  <td style={{ ...TD_S, minWidth: 180 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg,${["#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b","#06b6d4","#ef4444","#14b8a6"][i%8]},${["#1d4ed8","#7c3aed","#db2777","#059669","#d97706","#0891b2","#b91c1c","#0d9488"][i%8]})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 12, color: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}>
                        {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: C.t900, fontSize: 13 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: C.t400, marginTop: 1 }}>{emp.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={TD_S}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: C.accent,
                      background: C.accentLight, padding: "3px 9px",
                      borderRadius: 5, border: `1px solid ${C.accentBorder}`,
                    }}>{emp.id}</span>
                  </td>
                  <td style={TD_S}>{emp.dept}</td>
                  <td style={TD_S}>{emp.location}</td>
                  <td style={TD_S}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, background: "#f0f5fb", color: C.t500,
                      padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.cardBorder}`,
                    }}>{emp.grade}</span>
                  </td>
                  <td style={TD_S}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, background: C.amberBg, color: C.amber,
                      padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.amberBorder}`,
                    }}>{emp.validity}</span>
                  </td>
                  <td style={TD_S}><StatusPill status={emp.status} /></td>
                  <td style={{ ...TD_S, textAlign: "center" }}>
                    {emp.extended ? (
                      <span style={{
                        padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                        background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac",
                      }}>Extended</span>
                    ) : (
                      <button onClick={() => onSelect(emp)} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                        background: "linear-gradient(135deg,#1a5fa8,#2563eb)",
                        color: "#fff", border: "none", cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Extend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ ...TD_S, textAlign: "center", padding: 48, color: C.t400 }}>
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px", background: "#f8fafc",
          borderTop: `1px solid ${C.cardBorder}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: C.t400 }}>
            Showing {filtered.length} of {EMPLOYEES.length} employees
          </span>
          <span style={{ fontSize: 11, color: C.t400 }}>
            Click <strong style={{ color: C.accent }}>Extend</strong> to open the extension panel
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Root Export ── */
export default function EmployeeExtension() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [selected,  setSelected]  = useState(null);
  const [drawerOpen,setDrawerOpen]= useState(false);
  const { getToken } = useAuth();

  const handleSelect = (emp) => { setSelected(emp); setDrawerOpen(true); };
  const handleClose  = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 380);
  };

  return (
    <div style={{
      padding: "28px 32px", minHeight: "100%",
      fontFamily: "'Segoe UI','Helvetica Neue',system-ui,sans-serif",
      background: C.pageBg,
    }}>
      <EmployeeListTable employees={employees} onSelect={handleSelect} />

      <Drawer open={drawerOpen} onClose={handleClose}>
        {selected && (
          <ExtensionForm
            employee={selected}
            onClose={handleClose}
            getToken={getToken}
            onSuccess={(id, newDate) => {
              setEmployees(prev =>
                prev.map(emp =>
                  emp.id === id ? { ...emp, extended: true, validity: newDate } : emp
                )
              );
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
