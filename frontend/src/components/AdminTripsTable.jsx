const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
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

function AdminTripsTable({
  trips,
  busyTripId,
  onDelete,
}) {
  if (trips.length === 0) {
    return (
      <div className="admin-empty-state">
        <span aria-hidden="true">✈️</span>
        <h3>No trips found</h3>
        <p>No trips match the current search.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Trip</th>
            <th>Owner</th>
            <th>Travel dates</th>
            <th>Status</th>
            <th className="admin-table__actions">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => {
            const tripId = trip._id || trip.id;
            const isBusy = busyTripId === tripId;

            return (
              <tr key={tripId}>
                <td>
                  <div className="admin-trip">
                    <strong>{trip.title}</strong>

                    <span>
                      📍 {trip.destinationCity}
                      {trip.country
                        ? `, ${trip.country}`
                        : ""}
                    </span>

                    <small>
                      {formatLabel(trip.category)}
                    </small>
                  </div>
                </td>

                <td>
                  <div className="admin-owner">
                    <strong>
                      {trip.user?.name ||
                        "Deleted user"}
                    </strong>

                    <span>
                      {trip.user?.email ||
                        "No email available"}
                    </span>
                  </div>
                </td>

                <td>
                  {formatDate(trip.startDate)}
                  <span className="admin-date-divider">
                    {" "}
                    —{" "}
                  </span>
                  {formatDate(trip.endDate)}
                </td>

                <td>
                  <span
                    className={`admin-status admin-status--${trip.status}`}
                  >
                    {formatLabel(trip.status)}
                  </span>
                </td>

                <td className="admin-table__actions">
                  <button
                    className="admin-delete-button"
                    type="button"
                    disabled={isBusy}
                    onClick={() => onDelete(trip)}
                  >
                    {isBusy ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTripsTable;