import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import ProtectedRoute from "./components/ProtectedRoute";
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