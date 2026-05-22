import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HEADER_H  = 64;
const SIDEBAR_W = 240;

const C = {
  sidebarBg:       "#04234e",
  sidebarBorder:   "rgba(255,255,255,0.07)",
  navText:         "#8eacc8",
  navTextHover:    "#c8ddf0",
  navTextActive:   "#ffffff",
  navActiveBg:     "rgba(59,130,246,0.18)",
  navActiveBorder: "#3b82f6",
  pageBg:          "#eef2f7",
};

const ROUTE_TO_ID = {
  "/profile":    "dashboard",
  "/onboarding": "employee-onboarding",
  "/extension":  "employee-extension",
  "/transfer":   "employee-transfer",
};
const ID_TO_ROUTE = {
  "dashboard":           "/profile",
  "employee-onboarding": "/onboarding",
  "employee-extension":  "/extension",
  "employee-transfer":   "/transfer",
};

const NAV_TREE = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: "user-requirement",
    label: "User Requirement",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    children: [
      {
        id: "employee-onboarding",
        label: "Employee Onboarding",
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        ),
      },
      {
        id: "employee-extension",
        label: "Employee Extension",
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <polyline points="16 11 18 13 22 9"/>
          </svg>
        ),
      },
      {
        id: "employee-transfer",
        label: "Employee Transfer",
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        ),
      },
    ],
  },
];

/* ── Header ───────────────────────────────────────────── */
function Header({ user, onLogout }) {
  const initials    = (user?.full_name || user?.username || "U")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const displayName = user?.full_name || user?.username || "User";
  const email       = user?.email || "";

  return (
    <header style={{
      height: HEADER_H,
      flexShrink: 0,
      background: "linear-gradient(135deg,#1a5fa8 0%,#1e6ec0 60%,#1a5fa8 100%)",
      borderBottom: "2px solid rgba(255,255,255,0.12)",
      boxShadow: "0 3px 18px rgba(10,22,50,0.35)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky", top: 0, zIndex: 500,
    }}>
      {/* Logo + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: "#fff",
          overflow: "hidden", display: "flex", alignItems: "center",
          justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.25)", flexShrink: 0,
        }}>
          <img src="/itc_logo.jpg" alt="ITC"
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
            onError={e => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentNode.insertAdjacentHTML("beforeend",
                `<span style="font-size:12px;font-weight:900;color:#1a5fa8">ITC</span>`);
            }}
          />
        </div>
        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.2)" }} />
        <div>
          <div style={{
            fontSize: 19, fontWeight: 900, color: "#fff", letterSpacing: "0.14em",
            lineHeight: 1, fontFamily: "'Avanta Garde','Times New Roman',serif",
            textShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}>PRAVESH</div>
          <div style={{
            fontSize: 8.5, color: "rgba(255,255,255,0.6)", letterSpacing: "0.16em",
            textTransform: "uppercase", marginTop: 3, fontWeight: 600,
          }}>User Access &amp; Workflow Management</div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)",
          background: "rgba(255,255,255,0.1)", padding: "5px 14px",
          borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)",
        }}>
          {new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
        </div>

        <button style={{
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8, width: 34, height: 34, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.8)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 24, padding: "5px 14px 5px 5px",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#60a5fa,#2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 12, color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              {displayName}
            </div>
            {email && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                {email}
              </div>
            )}
          </div>
        </div>

        <button onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: "rgba(220,38,38,0.2)", color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.35)", cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="#dc2626"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(220,38,38,0.2)"; e.currentTarget.style.color="#fca5a5"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}

/* ── Sidebar ──────────────────────────────────────────── */
function Sidebar({ active, onNavigate, open, setOpen, user }) {
  const initials    = (user?.full_name || user?.username || "U")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const displayName = user?.full_name || user?.username || "User";
  const email       = user?.email || "";

  return (
    <aside style={{
      width: SIDEBAR_W,
      flexShrink: 0,
      background: C.sidebarBg,
      borderRight: `1px solid ${C.sidebarBorder}`,
      boxShadow: "3px 0 20px rgba(0,0,0,0.35)",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
      position: "sticky",
      top: 0,
      height: "100vh",
      /* sidebar sticks to the left while main scrolls */
    }}>
      {/* User strip */}
      <div style={{
        padding: "18px 20px",
        borderBottom: `1px solid ${C.sidebarBorder}`,
        background: "rgba(255,255,255,0.03)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#60a5fa,#2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0,
            boxShadow: "0 2px 10px rgba(37,99,235,0.5)",
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: "#e2e8f0",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{displayName}</div>
            {email && (
              <div style={{
                fontSize: 10, color: C.navText, marginTop: 2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{email}</div>
            )}
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{
        padding: "16px 20px 6px", fontSize: 9, fontWeight: 800,
        letterSpacing: "0.18em", color: "rgba(142,172,200,0.35)",
        textTransform: "uppercase", flexShrink: 0,
      }}>Main Menu</div>

      {/* Nav tree */}
      <nav style={{ flex: 1, paddingBottom: 16 }}>
        {NAV_TREE.map(item => {
          const parentActive = item.id === active ||
            (item.children && item.children.some(c => c.id === active));
          const isOpen = !!open[item.id];

          return (
            <div key={item.id}>
              <div
                onClick={() => {
                  if (item.children) {
                    setOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                  } else {
                    onNavigate(ID_TO_ROUTE[item.id] || "/profile");
                  }
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 20px", cursor: "pointer",
                  color: parentActive ? C.navTextActive : C.navText,
                  fontSize: 13, fontWeight: parentActive ? 700 : 500,
                  background: parentActive ? C.navActiveBg : "transparent",
                  borderLeft: parentActive ? `3px solid ${C.navActiveBorder}` : "3px solid transparent",
                  transition: "all 0.14s", userSelect: "none", marginBottom: 2,
                }}>
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.children && (
                  <span style={{
                    display: "flex", alignItems: "center",
                    transition: "transform 0.22s",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    color: isOpen ? C.navTextHover : C.navText,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                )}
              </div>

              {item.children && isOpen && (
                <div style={{
                  margin: "4px 12px 8px 12px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden",
                }}>
                  {item.children.map((child, idx) => {
                    const isActive = active === child.id;
                    return (
                      <div key={child.id}
                        onClick={() => onNavigate(ID_TO_ROUTE[child.id] || "/profile")}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 16px", cursor: "pointer", fontSize: 12.5,
                          color: isActive ? "#fff" : C.navText,
                          fontWeight: isActive ? 700 : 400,
                          background: isActive
                            ? "linear-gradient(90deg,rgba(37,99,235,0.55),rgba(37,99,235,0.25))"
                            : "transparent",
                          borderBottom: idx < item.children.length - 1
                            ? "1px solid rgba(255,255,255,0.04)" : "none",
                          borderLeft: isActive ? `3px solid ${C.navActiveBorder}` : "3px solid transparent",
                          transition: "all 0.13s", userSelect: "none",
                        }}>
                        <span style={{
                          color: isActive ? "#93c5fd" : C.navText,
                          display: "flex", alignItems: "center", flexShrink: 0,
                        }}>{child.icon}</span>
                        <span>{child.label}</span>
                        {isActive && (
                          <span style={{
                            marginLeft: "auto", width: 6, height: 6,
                            borderRadius: "50%", background: C.navActiveBorder, flexShrink: 0,
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "12px 20px", borderTop: `1px solid ${C.sidebarBorder}`,
        background: "rgba(0,0,0,0.1)", flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, color: "rgba(142,172,200,0.4)", lineHeight: 1.6 }}>
          Developed by <span style={{ color: "#60a5fa", fontWeight: 700 }}>ITSS</span>
        </div>
        <div style={{ fontSize: 9, color: "rgba(142,172,200,0.25)", marginTop: 2 }}>
          PRAVESH v2.4.1
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════
   APP LAYOUT
══════════════════════════════════════════════════════ */
export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const mainRef = useRef(null);

  const active = ROUTE_TO_ID[location.pathname] || "dashboard";

  const [open, setOpen] = useState(() => ({
    "user-requirement": ["employee-onboarding","employee-extension","employee-transfer"]
      .includes(ROUTE_TO_ID[location.pathname] || ""),
  }));

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    /*
      Full-page flex column:
        Row 1 (flex-shrink:0): Header  — full width, sticky top
        Row 2 (flex:1):        flex row
          Col A (flex-shrink:0): Sidebar — sticky, full remaining height
          Col B (flex:1):        Main content — scrollable
    */
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      fontFamily: "'Segoe UI','Helvetica Neue',system-ui,sans-serif",
      background: C.pageBg,
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #8eacc8; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #5a82a8; }
      `}</style>

      {/* ── Row 1: Header ── */}
      <Header user={user} onLogout={handleLogout} />

      {/* ── Row 2: Sidebar + Main ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <Sidebar
          active={active}
          onNavigate={navigate}
          open={open}
          setOpen={setOpen}
          user={user}
        />

        {/* Page content */}
        <main ref={mainRef} style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          background: C.pageBg,
        }}>
          <div style={{ padding: "28px 32px", minHeight: "100%" }}>
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
