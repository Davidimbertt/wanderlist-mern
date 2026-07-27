import { Link } from "react-router";

const dateFormatter = new Intl.DateTimeFormat(
  "en-US",
  {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
);

function formatDate(date) {
  return dateFormatter.format(new Date(date));
}

function TripCard({ trip }) {
  const activityCount = trip.activities?.length || 0;

  return (
    <article className="trip-card">
      <div className="trip-card-top">
        <span
          className={`status-badge status-${trip.status}`}
        >
          {trip.status}
        </span>

        <span className="trip-category">
          {trip.category}
        </span>
      </div>

      <div className="trip-card-content">
        <p className="trip-destination">
          📍 {trip.destinationCity}
          {trip.country ? `, ${trip.country}` : ""}
        </p>

        <h3>
          <Link to={`/trips/${trip._id}`}>
            {trip.title}
          </Link>
        </h3>

        <p className="trip-dates">
          {formatDate(trip.startDate)}
          {" — "}
          {formatDate(trip.endDate)}
        </p>
      </div>

      <footer className="trip-card-footer">
        <span>
          {activityCount}{" "}
          {activityCount === 1
            ? "activity"
            : "activities"}
        </span>

        <Link
          className="trip-card-link"
          to={`/trips/${trip._id}`}
        >
          View trip →
        </Link>
      </footer>
    </article>
  );
}

export default TripCard;