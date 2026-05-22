import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
const C = {
  accent: "#2563eb", accentLight: "#dbeafe", accentBorder: "#93c5fd", accentDark: "#1d4ed8",
  pageBg: "#eef2f7", cardBg: "#ffffff", cardBorder: "#dde4ed",
  cardShadow: "0 2px 16px rgba(15,31,61,0.09)", headerBg: "#1a5fa8",
  t900: "#0a1628", t700: "#1e3a5f", t500: "#4f6e8f", t400: "#8eacc8", t200: "#dde4ed",
  green: "#16a34a", greenBg: "#dcfce7", greenBorder: "#86efac",
  red: "#dc2626", redBg: "#fee2e2", redBorder: "#fca5a5",
  amber: "#b45309", amberBg: "#fef3c7", amberBorder: "#fcd34d",
};
const INP = {
  width: "100%", padding: "9px 12px", borderRadius: 7, fontSize: 13,
  border: `1.5px solid ${C.cardBorder}`, outline: "none",
  background: "#fff", color: C.t900, boxSizing: "border-box", fontFamily: "inherit",
};
const EMPLOYEES = [
  { id: "id1234", name: "Sneha Dey",          dept: "ITSS",    location: "Kolkata",   team: "EMS",       supervisor: "Intikhab Alam", grade: "FTE", division: "Technology" },
  { id: "id1236", name: "Soumilya Roy",       dept: "Digital", location: "Mumbai",    team: "CRM IT",    supervisor: "Intikhab Alam", grade: "GAT", division: "Digital" },
  { id: "id1237", name: "Raunak Pati",        dept: "SAPSS",   location: "Kolkata",   team: "SAP Basis", supervisor: "Intikhab Alam", grade: "FTE", division: "SAP" },
  { id: "id1238", name: "Sohan Chakrabarty",  dept: "ITD",     location: "Hyderabad", team: "Security",  supervisor: "Intikhab Alam", grade: "GAT", division: "IT" },
  { id: "id1239", name: "Sourav Kumar Singh", dept: "PSPD",    location: "Chennai",   team: "Infra",     supervisor: "Intikhab Alam", grade: "GAT", division: "Infrastructure" },
  { id: "id1240", name: "Puspak Paul",        dept: "Digital", location: "Pune",      team: "QA Auto",   supervisor: "Intikhab Alam", grade: "FTE", division: "Digital" },
  { id: "id1241", name: "Satyaki Seth",       dept: "ITSS",    location: "Kolkata",   team: "EMS",       supervisor: "Intikhab Alam", grade: "GAT", division: "Technology" },
  { id: "id1242", name: "Sagnik Pal",         dept: "HR",      location: "Delhi",     team: "HR",        supervisor: "Intikhab Alam", grade: "FTE", division: "HR" },
];

const DIVISIONS    = ["Technology", "Digital", "SAP", "IT", "Infrastructure", "Finance", "HR", "Operations"];
const DEPARTMENTS  = ["ITSS", "Digital", "SAPSS", "ITD", "PSPD", "HR", "Finance", "Compliance"];
const LOCATIONS    = ["Kolkata", "Mumbai", "Hyderabad", "Chennai", "Pune", "Delhi", "Bengaluru"];
const TEAMS        = ["EMS", "CRM IT", "SAP Basis", "Security", "Infra", "QA Auto", "DevOps", "Analytics"];
const SUPERVISORS  = ["Intikhab Alam", "Sandip Nag", "Arka Das", "Madhurima Das", "Soumyajit Chowdhury", "Debarati Dasgupta", "Nipa Naskar"];
const TRANSFER_TYPES = ["Internal Transfer", "Inter-Division Transfer", "Deputation", "Secondment", "Temporary Relocation"];
const TH_S = {
  padding: "11px 15px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: C.t500, background: "#f0f5fb",
  borderBottom: `1.5px solid ${C.cardBorder}`, textAlign: "left", whiteSpace: "nowrap",
};
const TD_S = { padding: "12px 15px", fontSize: 13, borderBottom: `1px solid #eef2f7`, color: C.t700, verticalAlign: "middle" };
function StatusPill({ label = "ACTIVE", color = "green" }) {
  const map = {
    green: { bg: C.greenBg, col: C.green, border: C.greenBorder },
    amber: { bg: C.amberBg, col: C.amber, border: C.amberBorder },
    blue:  { bg: C.accentLight, col: C.accent, border: C.accentBorder },
  };
  const s = map[color] || map.green;
  return (
    <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: s.bg, color: s.col, border: `1px solid ${s.border}`, letterSpacing: "0.06em" }}>
      {label}
    </span>
  );
}
function Label({ children, required }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.t500, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children} {required && <span style={{ color: C.red }}>*</span>}
    </label>
  );
}
function FieldError({ msg }) {
  return msg ? <div style={{ fontSize: 11, color: C.red, marginTop: 4, fontWeight: 600 }}>⚠ {msg}</div> : null;
}
function ReadOnlyField({ value }) {
  return (
    <div style={{ ...INP, background: "#f0f5fb", color: C.t700, fontWeight: 600, border: `1.5px solid ${C.cardBorder}`, cursor: "default" }}>
      {value || "—"}
    </div>
  );
}
function SectionHeader({ title, icon }) {
  return (
    <div style={{ padding: "12px 20px", background: "linear-gradient(135deg,#1a5fa8,#1e6ec0)", display: "flex", alignItems: "center", gap: 9 }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
    </div>
  );
}
function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.cardBg, borderRadius: 14, border: `1px solid ${C.cardBorder}`, boxShadow: C.cardShadow, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}
/* ── Drawer ── */
function Drawer({ open, onClose, children, width = "min(1000px,96vw)" }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,22,40,0.45)", backdropFilter: "blur(3px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width, zIndex: 1001, background: C.pageBg, boxShadow: "-8px 0 48px rgba(10,22,40,0.22)", transform: open ? "translateX(0)" : "translateX(102%)", transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {children}
      </div>
    </>
  );
}
function DrawerHeader({ title, icon, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 26px", background: "linear-gradient(135deg,#1a5fa8,#1e6ec0)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon}
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "0.01em" }}>{title}</span>
      </div>
      <button onClick={onClose} style={{ width: 33, height: 33, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>✕</button>
    </div>
  );
}
/* ══════════════════════════════════════════════════════
   DRAWER 1 — Transfer Form
══════════════════════════════════════════════════════ */
function TransferFormDrawer({ open, employee, onClose, onVerify }) {
  const empty = { newDivision: "", newDept: "", newLocation: "", newTeam: "", newSupervisor: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const validate = () => {
    const e = {};
    if (!form.newDivision)   e.newDivision   = "New division is required.";
    if (!form.newDept)       e.newDept       = "New department is required.";
    if (!form.newLocation)   e.newLocation   = "New location is required.";
    if (!form.newTeam)       e.newTeam       = "New team is required.";
    if (!form.newSupervisor) e.newSupervisor = "New supervisor is required.";
    return e;
  };
  const handleVerify = () => {
    const e = validate(); setErrors(e);
    if (!Object.keys(e).length) onVerify({ ...employee, ...form });
  };
  const handleReset = () => { setForm(empty); setErrors({}); };
  useEffect(() => { if (!open) { setForm(empty); setErrors({}); } }, [open]);
  const selectStyle = (err) => ({ ...INP, border: `1.5px solid ${err ? C.red : C.cardBorder}`, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238eacc8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 });
  if (!employee) return null;
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerHeader title="Employee Transfer" onClose={onClose}
        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>} />
      <div style={{ flex: 1, padding: "24px 26px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: 13, color: C.t500, margin: 0 }}>Review current employee details and fill in the transfer destination.</p>
        {/* User Details */}
        <Card>
          <SectionHeader title="User Details"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Employee", "Department", "Location", "Team", "Supervisor", "Grade"].map(h => <th key={h} style={TH_S}>{h}</th>)}</tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...TD_S, minWidth: 170 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                        {employee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: C.t900, fontSize: 13 }}>{employee.name}</div>
                        <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={TD_S}>{employee.dept}</td>
                  <td style={TD_S}>{employee.location}</td>
                  <td style={TD_S}>{employee.team}</td>
                  <td style={TD_S}>{employee.supervisor}</td>
                  <td style={TD_S}><span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}` }}>{employee.grade}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        {/* Transfer Details */}
        <Card>
          <SectionHeader title="Transfer Details"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>} />
          <div style={{ padding: "22px 22px" }}>

            {/* Grid: Current Info | New Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* ── Current Information ── */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, paddingBottom: 8, borderBottom: `1.5px solid ${C.accentBorder}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Current Information
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Existing Division</Label><ReadOnlyField value={employee.division} /></div>
                    <div><Label>Existing Department</Label><ReadOnlyField value={employee.dept} /></div>
                  <div><Label>Existing Location</Label><ReadOnlyField value={employee.location} /></div>
                  <div><Label>Existing Team</Label><ReadOnlyField value={employee.team} /></div>
                  </div>
                  <div><Label>Supervisor Name</Label><ReadOnlyField value={employee.supervisor} /></div>
                </div>
              </div>

              {/* ── New Information ── */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, paddingBottom: 8, borderBottom: `1.5px solid ${C.greenBorder}`, display: "flex", alignItems: "center", gap: 6, }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                  New Information
                </div>
                
                <div style={{ display: "grid",gridTemplateColumns: "1fr 1fr", flexDirection: "column", gap: 12 ,}}>
                  <div>
                    <Label required>New Division</Label>
                    <select value={form.newDivision} onChange={e => set("newDivision", e.target.value)} style={selectStyle(errors.newDivision)}>
                      <option value="">Select Division</option>
                      {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <FieldError msg={errors.newDivision} />
                  </div>
                  <div>
                    <Label required>New Department</Label>
                    <select value={form.newDept} onChange={e => set("newDept", e.target.value)} style={selectStyle(errors.newDept)}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <FieldError msg={errors.newDept} />
                  </div>
                  <div>
                    <Label required>New Location</Label>
                    <select value={form.newLocation} onChange={e => set("newLocation", e.target.value)} style={selectStyle(errors.newLocation)}>
                      <option value="">Select Location</option>
                      {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <FieldError msg={errors.newLocation} />
                  </div>
                  <div>
                    <Label required>New Team</Label>
                    <select value={form.newTeam} onChange={e => set("newTeam", e.target.value)} style={selectStyle(errors.newTeam)}>
                      <option value="">Select Team</option>
                      {TEAMS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <FieldError msg={errors.newTeam} />
                  </div>
                </div>
                <div style={{paddingTop:12 }}>
                    <Label required>New Supervisor</Label>
                    < select value={form.newSupervisor} onChange={e => set("newSupervisor", e.target.value)} style={selectStyle(errors.newSupervisor)}>
                      <option value="">Select Supervisor</option>
                      {SUPERVISORS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <FieldError msg={errors.newSupervisor} />
                </div>
                  
              </div>
          </div>
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.cardBorder}` }}>
              <button onClick={handleVerify} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 9, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#1a5fa8,#2563eb)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 3px 12px rgba(37,99,235,0.3)", letterSpacing: "0.02em" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
                Verify & Continue
              </button>
              <button onClick={handleReset} style={{ padding: "11px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: "#f0f5fb", border: `1.5px solid ${C.cardBorder}`, color: C.t700, cursor: "pointer" }}>
                Reset
              </button>
              <button onClick={onClose} style={{ padding: "11px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: "#fff", border: `1.5px solid ${C.cardBorder}`, color: C.t500, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
      <style>{`button:active{transform:scale(0.97)} select:focus,input:focus,textarea:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.12);}`}</style>
    </Drawer>
  );
}

/* ══════════════════════════════════════════════════════
   DRAWER 2 — Confirm & Submit
══════════════════════════════════════════════════════ */
function TransferConfirmDrawer({ open, data, onClose, onSubmitSuccess }) {
  const fileRef = useRef();
  const ALLOWED_EXT = /\.(jpg|jpeg|png|pdf|docx)$/i;
  const [transferType, setTransferType]   = useState("");
  const [files, setFiles]                 = useState([]);
  const [mode, setMode]                   = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [remarks, setRemarks]             = useState("");
  const [errors, setErrors]               = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [serverError, setServerError]     = useState("");
  const { getToken } = useAuth();

  const handleFile = (e) => {
    const incoming = Array.from(e.target.files);
    const valid = []; let ferr = "";
    incoming.forEach(f => {
      if (!ALLOWED_EXT.test(f.name)) { ferr = `"${f.name}" is not allowed. Use JPG, PNG, PDF, DOCX.`; return; }
      if (f.size > 10 * 1024 * 1024) { ferr = `"${f.name}" exceeds 10 MB.`; return; }
      valid.push(f);
    });
    if (ferr) setErrors(p => ({ ...p, files: ferr }));
    setFiles(prev => { const keys = new Set(prev.map(f => f.name + f.size)); return [...prev, ...valid.filter(f => !keys.has(f.name + f.size))]; });
    e.target.value = "";
  };

  const validate = () => {
    const e = {};
    if (!transferType)   e.transferType   = "Transfer type is required.";
    if (!files.length)   e.files          = "At least one attachment is required.";
    if (!mode)           e.mode           = "Mode of transfer is required.";
    if (!effectiveDate)  e.effectiveDate  = "Effective date is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); setErrors(e); setServerError("");
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("employeeId",    data.id);
      formData.append("employeeName",  data.name);
      formData.append("newDivision",   data.newDivision);
      formData.append("newDept",       data.newDept);
      formData.append("newLocation",   data.newLocation);
      formData.append("newTeam",       data.newTeam);
      formData.append("newSupervisor", data.newSupervisor);
      formData.append("transferType",  transferType);
      formData.append("mode",          mode);
      formData.append("effectiveDate", effectiveDate);
      formData.append("remarks",       remarks);
      files.forEach(f => formData.append("attachments", f));
      const res  = await fetch("http://localhost:5000/submit-transfer", { method: "POST", body: formData , headers: { Authorization: `Bearer ${getToken()}` } });
      const json = await res.json();
      if (!res.ok || !json.success) { setServerError(json.message || "Submission failed."); setSubmitting(false); return; }
      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess(data.id);
      setTimeout(() => onClose(), 2800);
    } catch { setServerError("Network error — please try again."); setSubmitting(false); }
  };

  useEffect(() => { if (!open) { setTransferType(""); setFiles([]); setMode(""); setEffectiveDate(""); setRemarks(""); setErrors({}); setSubmitted(false); setServerError(""); setSubmitting(false); } }, [open]);

  const selectStyle = (err) => ({ ...INP, border: `1.5px solid ${err ? C.red : C.cardBorder}`, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238eacc8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 });

  if (!data) return null;

  if (submitted) {
    return (
      <Drawer open={open} onClose={onClose}>
        <DrawerHeader title="Transfer Request" onClose={onClose}
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.greenBg, border: `2px solid ${C.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20, boxShadow: "0 4px 20px rgba(22,163,74,0.18)" }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.t900, margin: "0 0 10px" }}>Transfer Request Submitted!</h2>
          <p style={{ fontSize: 13, color: C.t500, maxWidth: 340, lineHeight: 1.7 }}>
            The transfer request for <strong>{data.name}</strong> has been submitted and is pending approval. This panel will close automatically.
          </p>
        </div>
        
      </Drawer>
    );
  }
  const InfoRow = ({ label, value }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, color: C.t400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.t700 }}>{value || "—"}</span>
    </div>
  );
  return (
    <Drawer open={open} onClose={onClose} width="min(1000px,97vw)">
      <DrawerHeader title="Confirm Transfer Request" onClose={onClose}
        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} />
      <div style={{ flex: 1, padding: "24px 26px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: 13, color: C.t500, margin: 0 }}>Review the selected transfer information and complete the supporting document details.</p>
        {/* User Details strip */}
        <Card>
          <SectionHeader title="Employee"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {data.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: C.t900, fontSize: 14 }}>{data.name}</div>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>{data.id}</div>
            </div>
            <div style={{ marginLeft: "auto" }}><StatusPill label="TRANSFER PENDING" color="amber" /></div>
          </div>
        </Card>
        {/* Transfer Details: Selected Info | Supportive Document */}
        <Card>
          <SectionHeader title="Transfer Details"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>} />
          <div style={{ padding: "22px 22px" }}>
            {serverError && (
              <div style={{ padding: "12px 16px", borderRadius: 9, marginBottom: 18, background: C.redBg, border: `1.5px solid ${C.redBorder}`, color: C.red, fontSize: 13, fontWeight: 600 }}>⚠ {serverError}</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* ── Selected Information ── */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, paddingBottom: 8, borderBottom: `1.5px solid ${C.accentBorder}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Selected Information
                </div>
                {/* From → To block */}
                {[
                  { label: "Division",    from: data.division,    to: data.newDivision   },
                  { label: "Department",  from: data.dept,        to: data.newDept       },
                  { label: "Location",    from: data.location,    to: data.newLocation   },
                  { label: "Team",        from: data.team,        to: data.newTeam       },
                  { label: "Supervisor",  from: data.supervisor,  to: data.newSupervisor },
                ].map(row => (
                  <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8, marginBottom: 10, padding: "9px 12px", borderRadius: 9, background: "#f8fafd", border: `1px solid ${C.cardBorder}` }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.t400, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{row.label} (from)</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.t700 }}>{row.from}</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <div>
                      <div style={{ fontSize: 10, color: C.green, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{row.label} (to)</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{row.to}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* ── Supportive Documents ── */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, paddingBottom: 8, borderBottom: `1.5px solid ${C.amberBorder}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Supportive Documents
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Transfer Type */}
                  <div>
                    <Label required>Transfer Type</Label>
                    <select value={transferType} onChange={e => { setTransferType(e.target.value); setErrors(p => ({ ...p, transferType: "" })); }} style={selectStyle(errors.transferType)}>
                      <option value="">Select Transfer Type</option>
                      {TRANSFER_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <FieldError msg={errors.transferType} />
                  </div>
                  {/* Mode of Transfer */}
                  <div>
                    <Label required>Mode of Transfer</Label>
                    <div style={{ display: "flex", gap: 16, marginTop: 2 }}>
                      {["Scheduled", "Immediate"].map(opt => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: mode === opt ? 700 : 500, color: mode === opt ? C.accent : C.t700, padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${mode === opt ? C.accentBorder : C.cardBorder}`, background: mode === opt ? C.accentLight : "#f8fafd", transition: "all 0.15s" }}>
                          <input type="radio" name="transferMode" value={opt} checked={mode === opt} onChange={() => { setMode(opt); setErrors(p => ({ ...p, mode: "" })); }} style={{ accentColor: C.accent }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <FieldError msg={errors.mode} />
                  </div>
                  {/* Attachments */}
                  <div>
                    <Label required>Attachment(s)</Label>
                    <div style={{ border: `1.5px solid ${errors.files ? C.red : C.cardBorder}`, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ padding: "10px 14px", background: "#fafafa", borderBottom: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => fileRef.current.click()} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#f0f5fb", border: `1px solid ${C.cardBorder}`, color: C.t700, cursor: "pointer" }}>
                          Choose File
                        </button>
                        <span style={{ fontSize: 12, color: C.t400 }}>{files.length ? `${files.length} file(s)` : "No file chosen"}</span>
                        <input ref={fileRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.docx" style={{ display: "none" }} onChange={handleFile} />
                      </div>
                      {files.length > 0 && (
                        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                          {files.map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 7, background: "#f8fafd", border: `1px solid ${C.cardBorder}` }}>
                              <span style={{ fontSize: 12, color: C.t700 }}>📄 {f.name} <span style={{ color: C.t400 }}>({(f.size / 1024).toFixed(1)} KB)</span></span>
                              <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ border: "none", background: C.redBg, color: C.red, padding: "2px 9px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FieldError msg={errors.files} />
                  </div>
                  {/* Effective Date */}
                  <div>
                    <Label required>Effective Date</Label>
                    <input type="date" value={effectiveDate} onChange={e => { setEffectiveDate(e.target.value); setErrors(p => ({ ...p, effectiveDate: "" })); }} style={{ ...INP, border: `1.5px solid ${errors.effectiveDate ? C.red : C.cardBorder}` }} />
                    <FieldError msg={errors.effectiveDate} />
                  </div>
                  {/* Remarks */}
                  <div>
                    <Label>Remarks</Label>
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Add any remarks or notes..." style={{ ...INP, resize: "vertical" }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Submit */}
            <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.cardBorder}` }}>
              <button onClick={handleSubmit} disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 9, fontSize: 14, fontWeight: 700, background: submitting ? "#94a3b8" : "linear-gradient(135deg,#1a5fa8,#2563eb)", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 3px 14px rgba(37,99,235,0.35)", letterSpacing: "0.02em" }}>
                {submitting ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Submitting…</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Submit Transfer Request</>
                )}
              </button>
              <button onClick={onClose} disabled={submitting} style={{ padding: "12px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: "#f0f5fb", border: `1.5px solid ${C.cardBorder}`, color: C.t700, cursor: submitting ? "not-allowed" : "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} button:active{transform:scale(0.97)} select:focus,input:focus,textarea:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.12);}`}</style>
    </Drawer>
  );
}
/* ══════════════════════════════════════════════════════
   MAIN TABLE
══════════════════════════════════════════════════════ */
function EmployeeTransferTable({ employees, onSelect }) {
  const [search, setSearch]   = useState("");
  const [hovered, setHovered] = useState(null);
  const avatarColors = ["#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b","#06b6d4","#ef4444","#14b8a6"];
  const avatarDark   = ["#1d4ed8","#7c3aed","#db2777","#059669","#d97706","#0891b2","#b91c1c","#0d9488"];
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`, boxShadow: C.cardShadow, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "15px 22px", background: "#f0f5fb", borderBottom: `1.5px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1a5fa8,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.t700 }}>Employee Transfer</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}` }}>{filtered.length} records</span>
        </div>
        <div style={{ position: "relative", minWidth: 240 }}>
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t400} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID or department…" style={{ ...INP, paddingLeft: 34, fontSize: 12, border: `1.5px solid ${C.cardBorder}` }} />
        </div>
      </div>
      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["#","Employee Name","Employee ID","Department","Location","Team","Grade","Supervisor","Details"].map(h => (
                <th key={h} style={{ ...TH_S, textAlign: h === "#" || h === "Details" ? "center" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => (
              <tr key={emp.id} onMouseEnter={() => setHovered(emp.id)} onMouseLeave={() => setHovered(null)}
                style={{ background: emp.transferred ? "#dcfce7" : hovered === emp.id ? "#f0f6ff" : i % 2 === 0 ? C.cardBg : "#f8fafd", borderLeft: emp.transferred ? "4px solid #16a34a" : "none", transition: "background 0.12s" }}>
                <td style={{ ...TD_S, textAlign: "center", color: C.t400, fontSize: 12, fontWeight: 600 }}>{i + 1}</td>
                <td style={{ ...TD_S, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${avatarColors[i % 8]},${avatarDark[i % 8]})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#fff", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.14)" }}>
                      {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: C.t900, fontSize: 13 }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: C.t400, marginTop: 1 }}>{emp.location}</div>
                    </div>
                  </div>
                </td>
                <td style={TD_S}><span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentLight, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.accentBorder}` }}>{emp.id}</span></td>
                <td style={TD_S}>{emp.dept}</td>
                <td style={TD_S}>{emp.location}</td>
                <td style={TD_S}>{emp.team}</td>
                <td style={TD_S}><span style={{ fontSize: 11, fontWeight: 700, background: "#f0f5fb", color: C.t500, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.cardBorder}` }}>{emp.grade}</span></td>
                <td style={{ ...TD_S, minWidth: 140 }}><span style={{ fontWeight: 600, color: C.t700, fontSize: 13 }}>{emp.supervisor}</span></td>
                <td style={{ ...TD_S, textAlign: "center" }}>
                  {emp.transferred ? (
                    <span style={{ padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}` }}>Transferred</span>
                  ) : (
                    <button onClick={() => onSelect(emp)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 7, fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#1a5fa8,#2563eb)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Access Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ ...TD_S, textAlign: "center", padding: 48, color: C.t400 }}>No employees found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div style={{ padding: "12px 22px", background: "#f8fafc", borderTop: `1px solid ${C.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.t400 }}>Showing {filtered.length} of {employees.length} employees</span>
        <span style={{ fontSize: 11, color: C.t400 }}>Click <strong style={{ color: C.accent }}>Access Details</strong> to initiate a transfer</span>
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════ */
export default function EmployeeTransfer() {
  const [employees,      setEmployees]     = useState(EMPLOYEES);
  const [selected,       setSelected]      = useState(null);
  const [drawer1Open,    setDrawer1Open]   = useState(false);
  const [drawer2Open,    setDrawer2Open]   = useState(false);
  const [verifiedData,   setVerifiedData]  = useState(null);

  const handleSelect = (emp) => { setSelected(emp); setDrawer1Open(true); };

  const handleVerify = (data) => { setVerifiedData(data); setDrawer2Open(true); };

  const closeDrawer1 = () => { setDrawer1Open(false); setTimeout(() => setSelected(null), 380); };

  const closeDrawer2 = () => {
    setDrawer2Open(false);
    setTimeout(() => setVerifiedData(null), 380);
  };

  const handleSubmitSuccess = (id) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, transferred: true } : e));
    setTimeout(() => { setDrawer2Open(false); setDrawer1Open(false); setSelected(null); setVerifiedData(null); }, 2900);
  };

  return (
    <div style={{ padding: "26px 30px", minHeight: "100%", fontFamily: "'Segoe UI','Helvetica Neue',system-ui,sans-serif", background: C.pageBg }}>
      <EmployeeTransferTable employees={employees} onSelect={handleSelect} />

      <TransferFormDrawer
        open={drawer1Open}
        employee={selected}
        onClose={closeDrawer1}
        onVerify={handleVerify}
      />

      <TransferConfirmDrawer
        open={drawer2Open}
        data={verifiedData}
        onClose={closeDrawer2}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </div>
  );
}
