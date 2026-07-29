import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import AdminPagination from "../components/AdminPagination";
import AdminStatCard from "../components/AdminStatCard";
import AdminTripsTable from "../components/AdminTripsTable";
import AdminUsersTable from "../components/AdminUsersTable";
import AppHeader from "../components/AppHeader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import useAuth from "../context/useAuth";
import {
  deleteAdminTrip,
  deleteAdminUser,
  getAdminStats,
  getAdminTrips,
  getAdminUsers,
  updateUserRole,
} from "../services/adminService";
import { getErrorMessage } from "../services/api";

const PAGE_LIMIT = 6;

const emptyStats = {
  users: {
    totalUsers: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
  },
  trips: {
    totalTrips: 0,
    upcomingTrips: 0,
    totalActivities: 0,
  },
  byStatus: [],
  byCategory: [],
};

const emptyUserPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  totalUsers: 0,
  totalPages: 1,
};

const emptyTripPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  totalTrips: 0,
  totalPages: 1,
};

const emptyConfirmation = {
  open: false,
  type: "",
  item: null,
};

const formatLabel = (value) => {
  if (!value) {
    return "Unknown";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
};

function AdminDashboardPage() {
  const { user } = useAuth();

  const managementRef = useRef(null);

  const [stats, setStats] = useState(emptyStats);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);

  const [userPagination, setUserPagination] =
    useState(emptyUserPagination);

  const [tripPagination, setTripPagination] =
    useState(emptyTripPagination);

  const [activeTab, setActiveTab] =
    useState("users");

  const [userSearchInput, setUserSearchInput] =
    useState("");

  const [tripSearchInput, setTripSearchInput] =
    useState("");

  const [userQuery, setUserQuery] = useState({
    search: "",
    role: "",
    page: 1,
  });

  const [tripQuery, setTripQuery] = useState({
    search: "",
    status: "",
    category: "",
    page: 1,
  });

  const [loading, setLoading] = useState(true);

  const [busyUserId, setBusyUserId] =
    useState("");

  const [busyTripId, setBusyTripId] =
    useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [confirmation, setConfirmation] =
    useState(emptyConfirmation);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const currentUserId = user?._id || user?.id;

  const closeToast = useCallback(() => {
    setToast({
      message: "",
      type: "success",
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      getAdminStats(),

      getAdminUsers({
        limit: PAGE_LIMIT,
        page: userQuery.page,
        search: userQuery.search,
        role: userQuery.role,
      }),

      getAdminTrips({
        limit: PAGE_LIMIT,
        page: tripQuery.page,
        search: tripQuery.search,
        status: tripQuery.status,
        category: tripQuery.category,
      }),
    ])
      .then(
        ([
          statsData,
          usersData,
          tripsData,
        ]) => {
          if (isActive) {
            setStats(statsData);
            setUsers(usersData.users);
            setTrips(tripsData.trips);

            setUserPagination(
              usersData.pagination
            );

            setTripPagination(
              tripsData.pagination
            );
          }
        }
      )
      .catch((requestError) => {
        if (isActive) {
          setToast({
            message:
              getErrorMessage(requestError),
            type: "error",
          });
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
    refreshKey,
    userQuery.page,
    userQuery.role,
    userQuery.search,
    tripQuery.page,
    tripQuery.search,
    tripQuery.status,
    tripQuery.category,
  ]);

  const refreshDashboard = () => {
    setLoading(true);

    setRefreshKey(
      (currentKey) => currentKey + 1
    );
  };

  const updateUserQuery = (updates) => {
    setLoading(true);

    setUserQuery((currentQuery) => ({
      ...currentQuery,
      ...updates,
    }));

    setRefreshKey(
      (currentKey) => currentKey + 1
    );
  };

  const updateTripQuery = (updates) => {
    setLoading(true);

    setTripQuery((currentQuery) => ({
      ...currentQuery,
      ...updates,
    }));

    setRefreshKey(
      (currentKey) => currentKey + 1
    );
  };

  const openManagement = (section) => {
    setActiveTab(section);

    window.requestAnimationFrame(() => {
      managementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const openTripsWithFilter = ({
    status = "",
    category = "",
  } = {}) => {
    setActiveTab("trips");
    setTripSearchInput("");

    updateTripQuery({
      search: "",
      status,
      category,
      page: 1,
    });

    window.requestAnimationFrame(() => {
      managementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleUserSearch = (event) => {
    event.preventDefault();

    updateUserQuery({
      search: userSearchInput.trim(),
      page: 1,
    });
  };

  const handleTripSearch = (event) => {
    event.preventDefault();

    updateTripQuery({
      search: tripSearchInput.trim(),
      page: 1,
    });
  };

  const clearUserFilters = () => {
    setUserSearchInput("");

    updateUserQuery({
      search: "",
      role: "",
      page: 1,
    });
  };

  const clearTripFilters = () => {
    setTripSearchInput("");

    updateTripQuery({
      search: "",
      status: "",
      category: "",
      page: 1,
    });
  };

  const handleRoleChange = async (
    userId,
    role
  ) => {
    try {
      setBusyUserId(userId);

      await updateUserRole(userId, role);

      setToast({
        message:
          "User role updated successfully.",
        type: "success",
      });

      refreshDashboard();
    } catch (requestError) {
      setToast({
        message: getErrorMessage(requestError),
        type: "error",
      });
    } finally {
      setBusyUserId("");
    }
  };

  const requestDeleteUser = (account) => {
    setConfirmation({
      open: true,
      type: "user",
      item: account,
    });
  };

  const requestDeleteTrip = (trip) => {
    setConfirmation({
      open: true,
      type: "trip",
      item: trip,
    });
  };

  const closeConfirmation = useCallback(() => {
    if (!busyUserId && !busyTripId) {
      setConfirmation(emptyConfirmation);
    }
  }, [busyUserId, busyTripId]);

  const handleConfirmedDelete = async () => {
    const { type, item } = confirmation;

    if (!item) {
      return;
    }

    const itemId = item._id || item.id;

    try {
      if (type === "user") {
        setBusyUserId(itemId);

        const result = await deleteAdminUser(
          itemId
        );

        setToast({
          message:
            `${item.name} was deleted with ` +
            `${result.deletedTrips} associated trip(s).`,
          type: "success",
        });

        if (
          users.length === 1 &&
          userQuery.page > 1
        ) {
          updateUserQuery({
            page: userQuery.page - 1,
          });
        } else {
          refreshDashboard();
        }
      }

      if (type === "trip") {
        setBusyTripId(itemId);

        await deleteAdminTrip(itemId);

        setToast({
          message:
            `"${item.title}" was deleted successfully.`,
          type: "success",
        });

        if (
          trips.length === 1 &&
          tripQuery.page > 1
        ) {
          updateTripQuery({
            page: tripQuery.page - 1,
          });
        } else {
          refreshDashboard();
        }
      }
    } catch (requestError) {
      setToast({
        message: getErrorMessage(requestError),
        type: "error",
      });
    } finally {
      setBusyUserId("");
      setBusyTripId("");
      setConfirmation(emptyConfirmation);
    }
  };

  const confirmationIsBusy = Boolean(
    busyUserId || busyTripId
  );

  const confirmationTitle =
    confirmation.type === "user"
      ? "Delete this user?"
      : "Delete this trip?";

  const confirmationMessage =
    confirmation.type === "user"
      ? `This will permanently delete ${
          confirmation.item?.name || "this user"
        } and all trips belonging to the account.`
      : `This will permanently delete "${
          confirmation.item?.title ||
          "this trip"
        }". This action cannot be undone.`;

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="admin-page">
        <section className="admin-hero">
          <div>
            <div className="admin-badge">
              <span aria-hidden="true">◆</span>
              Administrator workspace
            </div>

            <h1>WanderList control center</h1>

            <p>
              Monitor application activity and
              securely manage users and trips.
            </p>
          </div>

          <div className="admin-hero__identity">
            <span>Signed in as</span>
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </div>
        </section>

        <section
          className="admin-stats-grid"
          aria-label="Application statistics"
        >
          <AdminStatCard
            icon="👥"
            label="Registered users"
            value={stats.users.totalUsers}
            description={`${stats.users.newUsersThisMonth} joined this month`}
            actionLabel="View registered users"
            onClick={() =>
              openManagement("users")
            }
          />

          <AdminStatCard
            icon="✈️"
            label="Total trips"
            value={stats.trips.totalTrips}
            description="Across every WanderList account"
            actionLabel="View all trips"
            onClick={() =>
              openTripsWithFilter()
            }
          />

          <AdminStatCard
            icon="🗓️"
            label="Upcoming trips"
            value={stats.trips.upcomingTrips}
            description="Future journeys being planned"
            actionLabel="View upcoming trip information"
            onClick={() =>
              openTripsWithFilter({
                status: "upcoming",
              })
            }
          />

          <AdminStatCard
            icon="✓"
            label="Activities"
            value={stats.trips.totalActivities}
            description="Itinerary activities created"
            actionLabel="View trips containing activities"
            onClick={() =>
              openTripsWithFilter()
            }
          />
        </section>

        {loading && (
          <div
            className="admin-loading-banner"
            role="status"
          >
            <div className="spinner admin-loading-spinner" />

            <span>
              Updating administrator data...
            </span>
          </div>
        )}

        <section className="admin-insights-grid">
          <article className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <p className="eyebrow">
                  MongoDB aggregation
                </p>

                <h2>Trips by status</h2>
              </div>

              <span>
                {stats.trips.totalTrips} total
              </span>
            </div>

            <div className="admin-breakdown">
              {stats.byStatus.length > 0 ? (
                stats.byStatus.map((item) => (
                  <button
                    className="admin-breakdown__item"
                    type="button"
                    key={item._id || "unknown"}
                    onClick={() =>
                      openTripsWithFilter({
                        status: item._id,
                      })
                    }
                  >
                    <span>
                      {formatLabel(item._id)}
                    </span>

                    <strong>{item.total}</strong>
                  </button>
                ))
              ) : (
                <p>No trip data available.</p>
              )}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <p className="eyebrow">
                  Travel trends
                </p>

                <h2>Trips by category</h2>
              </div>

              <span>
                {stats.users.totalAdmins} admin(s)
              </span>
            </div>

            <div className="admin-breakdown">
              {stats.byCategory.length > 0 ? (
                stats.byCategory.map((item) => (
                  <button
                    className="admin-breakdown__item"
                    type="button"
                    key={item._id || "unknown"}
                    onClick={() =>
                      openTripsWithFilter({
                        category: item._id,
                      })
                    }
                  >
                    <span>
                      {formatLabel(item._id)}
                    </span>

                    <strong>{item.total}</strong>
                  </button>
                ))
              ) : (
                <p>
                  No category data available.
                </p>
              )}
            </div>
          </article>
        </section>

        <section
          className="admin-management"
          ref={managementRef}
        >
          <div className="admin-management__heading">
            <div>
              <p className="eyebrow">
                Application management
              </p>

              <h2>Manage WanderList</h2>
            </div>

            <button
              className="button button-secondary"
              type="button"
              onClick={refreshDashboard}
            >
              Refresh data
            </button>
          </div>

          <div
            className="admin-tabs"
            role="tablist"
            aria-label="Administrator sections"
          >
            <button
              className={
                activeTab === "users"
                  ? "admin-tab admin-tab--active"
                  : "admin-tab"
              }
              type="button"
              role="tab"
              aria-selected={
                activeTab === "users"
              }
              onClick={() =>
                setActiveTab("users")
              }
            >
              Users
              <span>
                {userPagination.totalUsers}
              </span>
            </button>

            <button
              className={
                activeTab === "trips"
                  ? "admin-tab admin-tab--active"
                  : "admin-tab"
              }
              type="button"
              role="tab"
              aria-selected={
                activeTab === "trips"
              }
              onClick={() =>
                setActiveTab("trips")
              }
            >
              Trips
              <span>
                {tripPagination.totalTrips}
              </span>
            </button>
          </div>

          {activeTab === "users" ? (
            <div
              className="admin-tab-panel"
              role="tabpanel"
            >
              <div className="admin-table-toolbar">
                <div>
                  <h3>User accounts</h3>

                  <p>
                    Showing {users.length} of{" "}
                    {userPagination.totalUsers}{" "}
                    matching account(s).
                  </p>
                </div>
              </div>

              <div className="admin-filter-panel">
                <form
                  className="admin-filter-search"
                  onSubmit={handleUserSearch}
                >
                  <label
                    className="visually-hidden"
                    htmlFor="adminUserSearch"
                  >
                    Search users
                  </label>

                  <input
                    id="adminUserSearch"
                    type="search"
                    value={userSearchInput}
                    placeholder="Search name or email"
                    onChange={(event) =>
                      setUserSearchInput(
                        event.target.value
                      )
                    }
                  />

                  <button
                    className="button button-primary"
                    type="submit"
                  >
                    Search
                  </button>
                </form>

                <label className="admin-filter-field">
                  <span>Role</span>

                  <select
                    value={userQuery.role}
                    onChange={(event) =>
                      updateUserQuery({
                        role:
                          event.target.value,
                        page: 1,
                      })
                    }
                  >
                    <option value="">
                      All roles
                    </option>

                    <option value="user">
                      Users
                    </option>

                    <option value="admin">
                      Administrators
                    </option>
                  </select>
                </label>

                <button
                  className="admin-filter-clear"
                  type="button"
                  onClick={clearUserFilters}
                >
                  Clear filters
                </button>
              </div>

              <AdminUsersTable
                users={users}
                currentUserId={currentUserId}
                busyUserId={busyUserId}
                onRoleChange={handleRoleChange}
                onDelete={requestDeleteUser}
              />

              <AdminPagination
                page={userPagination.page}
                totalPages={
                  userPagination.totalPages
                }
                onPageChange={(page) =>
                  updateUserQuery({ page })
                }
              />
            </div>
          ) : (
            <div
              className="admin-tab-panel"
              role="tabpanel"
            >
              <div className="admin-table-toolbar">
                <div>
                  <h3>All trips</h3>

                  <p>
                    Showing {trips.length} of{" "}
                    {tripPagination.totalTrips}{" "}
                    matching trip(s).
                  </p>
                </div>
              </div>

              <div className="admin-filter-panel">
                <form
                  className="admin-filter-search"
                  onSubmit={handleTripSearch}
                >
                  <label
                    className="visually-hidden"
                    htmlFor="adminTripSearch"
                  >
                    Search trips
                  </label>

                  <input
                    id="adminTripSearch"
                    type="search"
                    value={tripSearchInput}
                    placeholder="Search trip or destination"
                    onChange={(event) =>
                      setTripSearchInput(
                        event.target.value
                      )
                    }
                  />

                  <button
                    className="button button-primary"
                    type="submit"
                  >
                    Search
                  </button>
                </form>

                <label className="admin-filter-field">
                  <span>Status</span>

                  <select
                    value={tripQuery.status}
                    onChange={(event) =>
                      updateTripQuery({
                        status:
                          event.target.value,
                        page: 1,
                      })
                    }
                  >
                    <option value="">
                      All statuses
                    </option>

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

                <label className="admin-filter-field">
                  <span>Category</span>

                  <select
                    value={tripQuery.category}
                    onChange={(event) =>
                      updateTripQuery({
                        category:
                          event.target.value,
                        page: 1,
                      })
                    }
                  >
                    <option value="">
                      All categories
                    </option>

                    <option value="leisure">
                      Leisure
                    </option>

                    <option value="business">
                      Business
                    </option>

                    <option value="family">
                      Family
                    </option>

                    <option value="adventure">
                      Adventure
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </label>

                <button
                  className="admin-filter-clear"
                  type="button"
                  onClick={clearTripFilters}
                >
                  Clear filters
                </button>
              </div>

              <AdminTripsTable
                trips={trips}
                busyTripId={busyTripId}
                onDelete={requestDeleteTrip}
              />

              <AdminPagination
                page={tripPagination.page}
                totalPages={
                  tripPagination.totalPages
                }
                onPageChange={(page) =>
                  updateTripQuery({ page })
                }
              />
            </div>
          )}
        </section>
      </main>

      <ConfirmModal
        open={confirmation.open}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmLabel={
          confirmation.type === "user"
            ? "Delete user"
            : "Delete trip"
        }
        busy={confirmationIsBusy}
        onConfirm={handleConfirmedDelete}
        onCancel={closeConfirmation}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}

export default AdminDashboardPage;