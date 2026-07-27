import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";

import useAuth from "../context/useAuth";

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <main className="page-loader">
        <div className="spinner" />
        <p>Loading WanderList...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;