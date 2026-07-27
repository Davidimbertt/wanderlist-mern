import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router";

import AppHeader from "../components/AppHeader";
import TripCard from "../components/TripCard";
import useAuth from "../context/useAuth";
import { getErrorMessage } from "../services/api";
import {
  getTrips,
  getTripStats,
} from "../services/tripService";

const emptyStats = {
  totalTrips: 0,
  upcomingTrips: 0,
  totalActivities: 0,
};

function DashboardPage() {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    sort: "startDate",
  });

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] =
    useState("");

  useEffect(() => {
    let isActive = true;

    const requestParams = {
      limit: 50,
      sort: filters.sort,
    };

    if (filters.status) {
      requestParams.status = filters.status;
    }

    if (filters.category) {
      requestParams.category = filters.category;
    }

    if (appliedSearch) {
      requestParams.search = appliedSearch;
    }

    Promise.all([
      getTrips(requestParams),
      getTripStats(),
    ])
      .then(([tripData, statsData]) => {
        if (isActive) {
          setTrips(tripData.trips);
          setStats(statsData.summary);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    filters.status,
    filters.category,
    filters.sort,
    appliedSearch,
  ]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setLoading(true);

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setLoading(true);
    setAppliedSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setLoading(true);
    setSearchInput("");
    setAppliedSearch("");

    setFilters({
      status: "",
      category: "",
      sort: "startDate",
    });
  };

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">
              Your travel workspace
            </p>

            <h1>Welcome back, {user?.name}</h1>

            <p>
              Organize every journey and keep your
              travel plans in one beautiful place.
            </p>
          </div>

          <Link
            className="button button-primary"
            to="/trips/new"
          >
            + Plan a new trip
          </Link>
        </section>

        <section
          className="stats-grid"
          aria-label="Trip statistics"
        >
          <article className="stat-card">
            <span className="stat-icon">🌍</span>
            <div>
              <strong>{stats.totalTrips}</strong>
              <span>Total trips</span>
            </div>
          </article>

          <article className="stat-card">
            <span className="stat-icon">🗓</span>
            <div>
              <strong>{stats.upcomingTrips}</strong>
              <span>Upcoming trips</span>
            </div>
          </article>

          <article className="stat-card">
            <span className="stat-icon">✓</span>
            <div>
              <strong>{stats.totalActivities}</strong>
              <span>Planned activities</span>
            </div>
          </article>
        </section>

        <section className="trips-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Your itineraries
              </p>
              <h2>My trips</h2>
            </div>

            <span className="result-count">
              {trips.length} shown
            </span>
          </div>

          <div className="filter-panel">
            <form
              className="search-form"
              onSubmit={handleSearch}
            >
              <label
                className="visually-hidden"
                htmlFor="tripSearch"
              >
                Search trips
              </label>

              <input
                id="tripSearch"
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search a trip or destination"
              />

              <button
                className="button button-primary"
                type="submit"
              >
                Search
              </button>
            </form>

            <div className="filter-controls">
              <label>
                <span>Status</span>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All statuses</option>
                  <option value="planning">
                    Planning
                  </option>
                  <option value="upcoming">
                    Upcoming
                  </option>
                  <option value="completed">
                    Completed
                  </option>
                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </label>

              <label>
                <span>Category</span>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All categories</option>
                  <option value="leisure">
                    Leisure
                  </option>
                  <option value="business">
                    Business
                  </option>
                  <option value="family">Family</option>
                  <option value="adventure">
                    Adventure
                  </option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                <span>Sort</span>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="startDate">
                    Date: earliest
                  </option>
                  <option value="-startDate">
                    Date: latest
                  </option>
                  <option value="title">
                    Name: A–Z
                  </option>
                  <option value="-createdAt">
                    Recently added
                  </option>
                </select>
              </label>

              <button
                className="filter-clear"
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          </div>

          {error && (
            <div
              className="alert alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="content-loader">
              <div className="spinner" />
              <p>Loading your trips...</p>
            </div>
          ) : trips.length > 0 ? (
            <div className="trip-grid">
              {trips.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✈</div>
              <h2>No trips found</h2>
              <p>
                Create your first trip or change the
                current search filters.
              </p>

              <Link
                className="button button-primary"
                to="/trips/new"
              >
                Plan your first trip
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;