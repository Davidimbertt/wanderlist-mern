import {
  Navigate,
  Outlet,
} from "react-router";

import useAuth from "../context/useAuth";

function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;