import { useNavigate } from "react-router";

import useAuth from "../context/useAuth";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <span className="brand-mark">W</span>
            <span>WanderList</span>
          </div>

          <div className="header-user">
            <span>Hello, {user?.name}</span>

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

      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Your travel workspace</p>
            <h1>Welcome back, {user?.name}</h1>
            <p>
              Your trips, activities, and destination
              forecasts will appear here.
            </p>
          </div>

          <button
            className="button button-primary"
            type="button"
          >
            Plan a new trip
          </button>
        </section>

        <section className="empty-state">
          <div className="empty-state-icon">✈</div>
          <h2>Your dashboard is ready</h2>
          <p>
            Next, we will connect this page to your trip
            CRUD API and weather forecast.
          </p>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;