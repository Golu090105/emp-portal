import { useState } from "react";
const C = {
  pageBg:      "#eef2f7",
  cardBg:      "#ffffff",
  cardBorder:  "#dde4ed",
  cardShadow:  "0 1px 10px rgba(15,31,61,0.08)",
  accent:      "#2563eb",
  accentLight: "#dbeafe",
  accentBorder:"#93c5fd",
  t900: "#0a1628",
  t700: "#1e3a5f",
  t500: "#4f6e8f",
  t400: "#8eacc8",
  green:       "#16a34a",
  greenBg:     "#dcfce7",
  greenBorder: "#86efac",
  red:         "#dc2626",
  redBg:       "#fee2e2",
  redBorder:   "#fca5a5",
  amber:       "#b45309",
  amberBg:     "#fef3c7",
  amberBorder: "#fcd34d",
};

const TH = {
  padding: "11px 16px", textAlign: "left", 
  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase", whiteSpace: "nowrap",
  color: C.t500, background: "#f5f8fc",
  borderBottom: `1.5px solid ${C.cardBorder}`,
};
const TD = {
  padding: "11px 16px",  textAlign: "left", borderBottom: `1px solid #eef2f7`,
  fontSize: 13, color: C.t700, verticalAlign: "middle",
};

const ENABLED_ACCESSES = [
  { sl:1, name:"Sahayak",                                  type:"ANALYST", rf:"RF120703982", date:"20-04-2026 10:59:04", status:"Closed" },
  { sl:2, name:"Network Login ID- Individual (AD Access)", type:"HSADM1",  rf:"RF120703984", date:"20-04-2026 10:59:22", status:"Closed" },
  { sl:3, name:"24x7 Internet Access",                     type:"L1",      rf:"RF120703990", date:"21-04-2026 09:15:00", status:"Active" },
  { sl:4, name:"AD ID mapping for Hosting Server Admin",   type:"ADMIN1",  rf:"RF120703995", date:"21-04-2026 09:20:11", status:"Active" },
];
const ACCESS_HISTORY = [
  { sl:1, name:"PAW",                      type:"L1",     rf:"RF120700010", date:"01-01-2026 08:00:00", status:"Closed" },
  { sl:2, name:"RSA Cloud Helpdesk Admin", type:"HSADM1", rf:"RF120700022", date:"15-02-2026 10:30:00", status:"Closed" },
];

function StatusBadge({ status }) {
  const map = {
    Active:   { bg: C.greenBg,  color: C.green,  border: C.greenBorder  },
    Closed:   { bg: C.redBg,    color: C.red,    border: C.redBorder    },
  };
  const s = map[status] || map.Closed;
  return (
    <span style={{
      padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: "0.03em", whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function TypeBadge({ type }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700,
      background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}`,
    }}>{type}</span>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE PAGE — just the content, shell is in AppLayout
═══════════════════════════════════════════════════════ */
export default function EmployeeProfile() {
  const [tab, setTab] = useState("enabled");
  const rows = tab === "enabled" ? ENABLED_ACCESSES : ACCESS_HISTORY;

  return (
    <>
      {/* Profile card */}
      <div style={{
        background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`,
        padding: "28px 32px", boxShadow: C.cardShadow, marginBottom: 22,
      }}>
        <div style={{ display: "flex", gap: 30, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Avatar */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 112, height: 132, borderRadius: 12, marginBottom: 12,
              border: `2px solid ${C.cardBorder}`, overflow: "hidden",
              boxShadow: "0 4px 14px rgba(30,107,192,0.12)",
            }}>
              <img src="/FORMALPic.jpeg" alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{
              background: `linear-gradient(90deg,${C.accent},#1d4ed8)`,
              color: "#fff", borderRadius: 7, padding: "5px 16px",
              fontSize: 12, fontWeight: 800, letterSpacing: "0.07em",
              boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
            }}>Intern</div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{
              fontSize: 24, fontWeight: 800, color: C.t900,
              margin: "0 0 18px", letterSpacing: "-0.01em",
            }}>Sagnik Pal</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px", marginBottom: 20 }}>
              {[
                { icon: "✉",  val: "sagnikpal2005@gmail.com" },
                { icon: "📍", val: "Kolkata" },
                { icon: "📱", val: "7605859338" },
                { icon: "🏢", val: "ITSS" },
                { icon: "👤", val: "Trainee" },
                { icon: "🔒", val: "3360" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: C.t700 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{r.icon}</span>
                  <span>{r.val}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", gap: 28, padding: "12px 20px",
              background: "#f5f8fc", borderRadius: 10, border: `1px solid ${C.cardBorder}`,
              flexWrap: "wrap",
            }}>
              {[
                { label: "Reporting To", val: "Intikhab Alam" },
                { label: "Team",         val: "ITSS"          },
                { label: "DoJ",          val: "04-05-2026"    },
              ].map((r, i) => (
                <div key={i} style={{ fontSize: 13 }}>
                  <span style={{ color: C.t400, marginRight: 6 }}>{r.label}:</span>
                  <strong style={{ color: C.t900 }}>{r.val}</strong>
                </div>
              ))}
            </div>
          </div>

          <button style={{
            padding: "10px 22px", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
            background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff",
            border: "none", cursor: "pointer",
            boxShadow: "0 3px 10px rgba(220,38,38,0.3)", flexShrink: 0,
          }}>Access Details</button>
        </div>
      </div>

      {/* Access table card */}
      <div style={{
        background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`,
        boxShadow: C.cardShadow, overflow: "hidden",
      }}>
        <div style={{ display: "flex", background: "#f5f8fc", borderBottom: `1.5px solid ${C.cardBorder}` }}>
          {[
            { key: "enabled", label: "Enabled Access(s)" },
            { key: "history", label: "Access History"    },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "13px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "none", outline: "none",
              background: tab === t.key ? C.cardBg : "transparent",
              color: tab === t.key ? C.accent : C.t400,
              borderBottom: tab === t.key ? `2.5px solid ${C.accent}` : "2.5px solid transparent",
              marginBottom: -1.5, transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Sl. No","Access Name","Type","Enable Details","RF Status"].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.cardBg : "#f8fafd" }}>
                  <td style={{ ...TD, color: C.t400, fontWeight: 600 }}>{r.sl}.</td>
                  <td style={{ ...TD, fontWeight: 600, color: C.t900 }}>{r.name}</td>
                  <td style={TD}><TypeBadge type={r.type} /></td>
                  <td style={TD}>
                    <div style={{ fontWeight: 700, color: C.accent, fontSize: 12 }}>{r.rf}</div>
                    <div style={{ fontSize: 11, color: C.t400, marginTop: 2 }}>{r.date}</div>
                  </td>
                  <td style={TD}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
