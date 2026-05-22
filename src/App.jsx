import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }       from "./context/AuthContext";
import ProtectedRoute         from "./routes/ProtectedRoute";
import AppLayout              from "./routes/AppLayout";
import LoginPage              from "./pages/LoginPage";
import EmployeeProfile        from "./pages/EmployeeProfile";
import EmployeeOnboarding     from "./pages/EmployeeOnboarding";
import EmployeeExtension      from "./pages/EmployeeExtension";
import EmployeeTransfer       from "./pages/EmployeeTransfer";

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED — ProtectedRoute checks JWT, AppLayout provides shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile"    element={<EmployeeProfile />} />
            <Route path="/onboarding" element={<EmployeeOnboarding />} />
            <Route path="/extension"  element={<EmployeeExtension />} />
            <Route path="/transfer"   element={<EmployeeTransfer />} />
            <Route path="/"           element={<Navigate to="/profile" replace />} />
          </Route>
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  );
}
