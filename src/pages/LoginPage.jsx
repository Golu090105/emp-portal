import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const REMEMBER_KEY = "emp_remembered";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [rememberMe,  setRememberMe]  = useState(false);
  const [error,       setError]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  // ── On mount: restore saved credentials if "Remember Me" was checked ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        const { username: u, password: p } = JSON.parse(saved);
        setUsername(u || "");
        setPassword(p || "");
        setRememberMe(true);
      }
    } catch (_) {}
  }, []);

  // ── Loading spinner while token is being verified ──────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#eef2f7",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, border: "4px solid #dbeafe",
            borderTop: "4px solid #2563eb", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#4f6e8f", fontSize: 14, fontWeight: 600 }}>
            Loading…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  // ── Already logged in → go straight to app ─────────────────────────
  if (user) return <Navigate to="/profile" replace />;

  // ── Handle login ───────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!password)        { setError("Password is required."); return; }

    setSubmitting(true);
    try {
      await login(username.trim(), password);

      // Save or clear remembered credentials based on checkbox
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          username: username.trim(),
          password,
        }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const INP = {
    width: "100%", padding: "11px 14px", borderRadius: 9, fontSize: 13,
    border: "1.5px solid #dde4ed", outline: "none",
    background: "#fff", color: "#0a1628", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.15s",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #eef2f7 0%, #dbeafe 100%)",
      fontFamily: "'Segoe UI','Helvetica Neue',system-ui,sans-serif",
      padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420,
        boxShadow: "0 8px 40px rgba(15,31,61,0.14)", overflow: "hidden",
      }}>

        {/* ── Header band ── */}
        <div style={{
          background: "linear-gradient(135deg,#1a5fa8,#2563eb)",
          padding: "32px 32px 28px", textAlign: "center",
        }}>
          {/* Logo */}
          <div style={{
            width: 100, height: 100, borderRadius: 14,
            background: "#fff", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}>
            <img src="/itc_logo.jpg" alt="ITC"
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
              onError={e => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentNode.insertAdjacentHTML("beforeend",
                  `<span style="font-size:14px;font-weight:900;color:#1a5fa8">ITC</span>`);
              }}
            />
          </div>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 900, color: "#fff",
            letterSpacing: "0.12em",
            fontFamily: "'Avanta Garde','Times New Roman',serif",
          }}>PRAVESH</h1>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em" }}>
            USER ACCESS &amp; WORKFLOW MANAGEMENT
          </p>
        </div>

        {/* ── Form ── */}
        <div style={{ padding: "28px 32px 32px" }}>

          <p style={{
            fontSize: 13, fontWeight: 600, color: "#4f6e8f",
            textAlign: "center", marginBottom: 22,
          }}>Sign in to your account</p>

          {/* Error banner */}
          {error && (
            <div style={{
              padding: "11px 14px", borderRadius: 9, marginBottom: 18,
              background: "#fee2e2", border: "1.5px solid #fca5a5",
              color: "#dc2626", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700, color: "#4f6e8f",
              marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.04em",
            }}>Username</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                fontSize: 15, color: "#8eacc8",
              }}>👤</span>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter your username"
                autoFocus={!username}
                style={{ ...INP, paddingLeft: 38 }}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e  => e.target.style.borderColor = "#dde4ed"}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700, color: "#4f6e8f",
              marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.04em",
            }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                fontSize: 15, color: "#8eacc8",
              }}>🔒</span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter your password"
                style={{ ...INP, paddingLeft: 38, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e  => e.target.style.borderColor = "#dde4ed"}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: "absolute", right: 13, top: "50%",
                  transform: "translateY(-50%)", border: "none",
                  background: "none", cursor: "pointer",
                  color: "#8eacc8", fontSize: 16, padding: 0, lineHeight: 1,
                }}
              >{showPass ? "🙈" : "👁"}</button>
            </div>
          </div>

          {/* Remember Me row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 22,
          }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer", userSelect: "none",
              fontSize: 13, color: "#4f6e8f", fontWeight: 500,
            }}>
              {/* Custom checkbox */}
              <div
                onClick={() => setRememberMe(p => !p)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: rememberMe ? "none" : "2px solid #dde4ed",
                  background: rememberMe
                    ? "linear-gradient(135deg,#1a5fa8,#2563eb)"
                    : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: rememberMe ? "0 2px 6px rgba(37,99,235,0.35)" : "none",
                }}>
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              Remember me
            </label>

            {/* Saved indicator */}
            {rememberMe && username && (
              <span style={{
                fontSize: 11, color: "#16a34a", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Credentials saved
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={submitting}
            style={{
              width: "100%", padding: "13px", borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              background: submitting
                ? "#94a3b8"
                : "linear-gradient(135deg,#1a5fa8,#2563eb)",
              color: "#fff", border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 4px 14px rgba(37,99,235,0.35)",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 9, transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {submitting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Signing in…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </>
            )}
          </button>

          {/* Session info strip */}
          <div style={{
            marginTop: 20, padding: "12px 16px", borderRadius: 10,
            background: "#f0f5fb", border: "1px solid #dde4ed",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#4f6e8f" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: 11, color: "#4f6e8f", lineHeight: 1.5 }}>
              Your session will remain active for <strong>8 hours</strong>.
              Credentials are stored locally on this device only.
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
