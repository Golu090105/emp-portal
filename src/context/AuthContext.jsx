import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);
const API = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On app load: verify stored token ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("emp_token");

    // No token at all → not logged in, done immediately
    if (!token) {
      setLoading(false);
      return;
    }

    // Token exists → verify with backend
    fetch(`${API}/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        } else {
          // Token rejected by backend — clear it
          localStorage.removeItem("emp_token");
          localStorage.removeItem("emp_user");
          setUser(null);
        }
      })
      .catch(() => {
        // Backend unreachable — trust the locally stored user so the
        // app still works offline; loading MUST still end here
        const saved = localStorage.getItem("emp_user");
        if (saved) {
          try { setUser(JSON.parse(saved)); } catch (_) { setUser(null); }
        } else {
          setUser(null);
        }
      })
      .finally(() => {
        // Always end loading — this is the fix for the blank screen
        setLoading(false);
      });
  }, []);

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const res  = await fetch(`${API}/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Login failed.");
    }

    localStorage.setItem("emp_token", data.token);
    localStorage.setItem("emp_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = localStorage.getItem("emp_token");
    if (token) {
      try {
        await fetch(`${API}/logout`, {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (_) { /* ignore network errors on logout */ }
    }
    localStorage.removeItem("emp_token");
    localStorage.removeItem("emp_user");
    setUser(null);
  }, []);

  // ── Get token for use in fetch calls ──────────────────────────────
  const getToken = useCallback(
    () => localStorage.getItem("emp_token"),
    []
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
