import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import AppHeader from "../components/AppHeader";
import { getErrorMessage } from "../services/api";
import {
  deleteTrip,
  getTripById,
  updateTrip,
} from "../services/tripService";
import {
  getForecast,
} from "../services/weatherService";

const emptyActivity = {
  date: "",
  time: "",
  title: "",
  notes: "",
};

const longDateFormatter = new Intl.DateTimeFormat(
  "en-US",
  {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }
);

const shortDateFormatter = new Intl.DateTimeFormat(
  "en-US",
  {
    weekday: "short",
    month: "short",
    day: "numeric",
  }
);

function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

function TripDetailsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [forecast, setForecast] = useState(null);

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [weatherError, setWeatherError] =
    useState("");

  const [activityForm, setActivityForm] =
    useState(emptyActivity);

  const [savingActivity, setSavingActivity] =
    useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    getTripById(tripId)
      .then((tripData) => {
        if (!isActive) {
          return;
        }

        setTrip(tripData);

        const [longitude, latitude] =
          tripData.location.coordinates;

        getForecast(latitude, longitude)
          .then((weatherData) => {
            if (isActive) {
              setForecast(weatherData);
              setWeatherError("");
            }
          })
          .catch((requestError) => {
            if (isActive) {
              setWeatherError(
                getErrorMessage(requestError)
              );
            }
          })
          .finally(() => {
            if (isActive) {
              setWeatherLoading(false);
            }
          });
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError));
          setWeatherLoading(false);
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
  }, [tripId]);

  const handleActivityChange = (event) => {
    const { name, value } = event.target;

    setActivityForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const addActivity = async (event) => {
    event.preventDefault();
    setError("");
    setSavingActivity(true);

    try {
      const updatedTrip = await updateTrip(tripId, {
        activities: [
          ...(trip.activities || []),
          activityForm,
        ],
      });

      setTrip(updatedTrip);
      setActivityForm(emptyActivity);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingActivity(false);
    }
  };

  const removeActivity = async (activityId) => {
    const confirmed = window.confirm(
      "Remove this activity from the itinerary?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const remainingActivities =
      trip.activities.filter(
        (activity) => activity._id !== activityId
      );

    try {
      const updatedTrip = await updateTrip(tripId, {
        activities: remainingActivities,
      });

      setTrip(updatedTrip);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Permanently delete "${trip.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteTrip(tripId);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <AppHeader />

        <main className="content-loader">
          <div className="spinner" />
          <p>Loading your itinerary...</p>
        </main>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="app-shell">
        <AppHeader />

        <main className="form-page">
          <div
            className="alert alert-error"
            role="alert"
          >
            {error}
          </div>

          <Link
            className="button button-secondary"
            to="/dashboard"
          >
            Return to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const sortedActivities = [
    ...(trip.activities || []),
  ].sort((firstActivity, secondActivity) => {
    const firstDate = new Date(
      `${firstActivity.date.slice(0, 10)}T${
        firstActivity.time || "00:00"
      }`
    );

    const secondDate = new Date(
      `${secondActivity.date.slice(0, 10)}T${
        secondActivity.time || "00:00"
      }`
    );

    return firstDate - secondDate;
  });

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="trip-details-page">
        <Link
          className="back-link"
          to="/dashboard"
        >
          ← Back to all trips
        </Link>

        {error && (
          <div
            className="alert alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="trip-detail-hero">
          <div>
            <div className="detail-badges">
              <span
                className={`status-badge status-${trip.status}`}
              >
                {trip.status}
              </span>

              <span className="category-badge">
                {trip.category}
              </span>
            </div>

            <p className="detail-destination">
              📍 {trip.destinationCity}
              {trip.country
                ? `, ${trip.country}`
                : ""}
            </p>

            <h1>{trip.title}</h1>

            <p className="detail-dates">
              {longDateFormatter.format(
                new Date(trip.startDate)
              )}
              {" — "}
              {longDateFormatter.format(
                new Date(trip.endDate)
              )}
            </p>
          </div>

          <div className="detail-actions">
            <Link
              className="button button-secondary"
              to={`/trips/${tripId}/edit`}
            >
              Edit trip
            </Link>

            <button
              className="button button-danger"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </section>

        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-card">
              <div className="detail-card-heading">
                <div>
                  <p className="eyebrow">
                    Live destination forecast
                  </p>
                  <h2>Weather outlook</h2>
                </div>

                <span className="api-badge">
                  Open-Meteo API
                </span>
              </div>

              {weatherLoading ? (
                <div className="weather-loading">
                  <div className="spinner" />
                  <p>Checking the forecast...</p>
                </div>
              ) : weatherError ? (
                <div
                  className="alert alert-error"
                  role="alert"
                >
                  {weatherError}
                </div>
              ) : (
                <>
                  <div className="current-weather">
                    <span className="weather-main-icon">
                      {weatherIcon(
                        forecast.current.weatherCode
                      )}
                    </span>

                    <div>
                      <strong>
                        {Math.round(
                          forecast.current.temperature
                        )}
                        {forecast.units.temperature}
                      </strong>

                      <span>
                        {forecast.current.description}
                      </span>
                    </div>

                    <p>
                      Feels like{" "}
                      {Math.round(
                        forecast.current
                          .apparentTemperature
                      )}
                      {forecast.units.temperature}
                      <br />
                      Wind{" "}
                      {Math.round(
                        forecast.current.windSpeed
                      )}{" "}
                      {forecast.units.windSpeed}
                    </p>
                  </div>

                  <div className="forecast-grid">
                    {forecast.daily
                      .slice(0, 5)
                      .map((day) => (
                        <article
                          key={day.date}
                          className="forecast-day"
                        >
                          <strong>
                            {shortDateFormatter.format(
                              new Date(
                                `${day.date}T12:00:00`
                              )
                            )}
                          </strong>

                          <span className="forecast-icon">
                            {weatherIcon(
                              day.weatherCode
                            )}
                          </span>

                          <span>
                            {Math.round(
                              day.maximumTemperature
                            )}
                            ° /{" "}
                            {Math.round(
                              day.minimumTemperature
                            )}
                            °
                          </span>

                          <small>
                            {day.precipitationProbability}
                            % rain
                          </small>
                        </article>
                      ))}
                  </div>
                </>
              )}
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div>
                  <p className="eyebrow">
                    Daily plan
                  </p>
                  <h2>Itinerary activities</h2>
                </div>

                <span className="result-count">
                  {sortedActivities.length} total
                </span>
              </div>

              {sortedActivities.length > 0 ? (
                <div className="activity-list">
                  {sortedActivities.map((activity) => (
                    <article
                      className="activity-item"
                      key={activity._id}
                    >
                      <div className="activity-time">
                        <strong>
                          {shortDateFormatter.format(
                            new Date(activity.date)
                          )}
                        </strong>

                        <span>
                          {activity.time || "Any time"}
                        </span>
                      </div>

                      <div className="activity-content">
                        <h3>{activity.title}</h3>

                        {activity.notes && (
                          <p>{activity.notes}</p>
                        )}
                      </div>

                      <button
                        className="activity-remove"
                        type="button"
                        onClick={() =>
                          removeActivity(activity._id)
                        }
                        aria-label={`Remove ${activity.title}`}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="small-empty-state">
                  <span>🗓</span>
                  <p>
                    No activities yet. Add the first
                    item below.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="detail-sidebar">
            <section className="detail-card">
              <p className="eyebrow">
                Add to itinerary
              </p>
              <h2>New activity</h2>

              <form
                className="activity-form"
                onSubmit={addActivity}
              >
                <label>
                  <span>Date</span>
                  <input
                    name="date"
                    type="date"
                    value={activityForm.date}
                    onChange={handleActivityChange}
                    min={trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    required
                  />
                </label>

                <label>
                  <span>Time</span>
                  <input
                    name="time"
                    type="time"
                    value={activityForm.time}
                    onChange={handleActivityChange}
                  />
                </label>

                <label>
                  <span>Activity</span>
                  <input
                    name="title"
                    type="text"
                    value={activityForm.title}
                    onChange={handleActivityChange}
                    placeholder="Freedom Trail walk"
                    maxLength="100"
                    required
                  />
                </label>

                <label>
                  <span>Notes</span>
                  <textarea
                    name="notes"
                    value={activityForm.notes}
                    onChange={handleActivityChange}
                    placeholder="Tickets, meeting point..."
                    rows="3"
                    maxLength="500"
                  />
                </label>

                <button
                  className="button button-primary button-full"
                  type="submit"
                  disabled={savingActivity}
                >
                  {savingActivity
                    ? "Adding..."
                    : "+ Add activity"}
                </button>
              </form>
            </section>

            {trip.notes && (
              <section className="detail-card">
                <p className="eyebrow">Trip notes</p>
                <h2>Reminders</h2>
                <p className="trip-notes">
                  {trip.notes}
                </p>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default TripDetailsPage;