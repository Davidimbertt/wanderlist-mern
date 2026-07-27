import {
  Link,
  useNavigate,
} from "react-router";

import useAuth from "../context/useAuth";

function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark">W</span>
          <span>WanderList</span>
        </Link>

        <div className="header-user">
          <Link
            className="header-link"
            to="/dashboard"
          >
            My trips
          </Link>

          <span className="header-name">
            Hello, {user?.name}
          </span>

          <button
            className="button button-secondary"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;