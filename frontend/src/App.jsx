import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import Savings from "./pages/Savings";
import SavingsHistory from "./pages/SavingsHistory";
import Withdrawals from "./pages/Withdrawals";
import WithdrawalHistory from "./pages/WithdrawalHistory";
import Groups from "./pages/Groups";
import Reports from "./pages/Reports";
import MemberStatement from "./pages/MemberStatement";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
      <Route path="/members/add" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
      <Route path="/members/:id/edit" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />

      <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
      <Route path="/savings/history/:memberId" element={<ProtectedRoute><SavingsHistory /></ProtectedRoute>} />

      <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
      <Route path="/withdrawals/history/:memberId" element={<ProtectedRoute><WithdrawalHistory /></ProtectedRoute>} />

      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />

      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/reports/member-statement" element={<ProtectedRoute><MemberStatement /></ProtectedRoute>} />

      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
