import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TripDetailsPage from "./pages/TripDetailsPage";
import TripFormPage from "./pages/TripFormPage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to="/dashboard" replace />
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/trips/new"
          element={<TripFormPage />}
        />

        <Route
          path="/trips/:tripId"
          element={<TripDetailsPage />}
        />

        <Route
          path="/trips/:tripId/edit"
          element={<TripFormPage />}
        />

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate to="/dashboard" replace />
        }
      />
    </Routes>
  );
}

export default App;