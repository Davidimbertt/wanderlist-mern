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
  createTrip,
  getTripById,
  updateTrip,
} from "../services/tripService";
import {
  searchCities,
} from "../services/weatherService";

const initialFormData = {
  title: "",
  destinationCity: "",
  country: "",
  longitude: "",
  latitude: "",
  startDate: "",
  endDate: "",
  category: "leisure",
  status: "planning",
  notes: "",
};

function toDateInputValue(date) {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
}

function TripFormPage() {
  const { tripId } = useParams();
  const isEditing = Boolean(tripId);
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState(initialFormData);

  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [searchingCities, setSearchingCities] =
    useState(false);

  const [loading, setLoading] =
    useState(isEditing);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [cityError, setCityError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    let isActive = true;

    getTripById(tripId)
      .then((trip) => {
        if (!isActive) {
          return;
        }

        const [longitude, latitude] =
          trip.location.coordinates;

        setFormData({
          title: trip.title,
          destinationCity: trip.destinationCity,
          country: trip.country || "",
          longitude: String(longitude),
          latitude: String(latitude),
          startDate: toDateInputValue(
            trip.startDate
          ),
          endDate: toDateInputValue(trip.endDate),
          category: trip.category,
          status: trip.status,
          notes: trip.notes || "",
        });

        setCitySearch(
          `${trip.destinationCity}${
            trip.country ? `, ${trip.country}` : ""
          }`
        );
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
  }, [isEditing, tripId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleCityInputChange = (event) => {
    setCitySearch(event.target.value);
    setCityResults([]);
    setCityError("");

    setFormData((currentData) => ({
      ...currentData,
      destinationCity: "",
      country: "",
      longitude: "",
      latitude: "",
    }));
  };

  const handleCitySearch = async () => {
    const searchTerm = citySearch.trim();

    if (searchTerm.length < 2) {
      setCityError(
        "Enter at least 2 characters to search."
      );
      return;
    }

    setSearchingCities(true);
    setCityError("");

    try {
      const locations = await searchCities(searchTerm);
      setCityResults(locations);

      if (locations.length === 0) {
        setCityError(
          "No matching cities were found."
        );
      }
    } catch (requestError) {
      setCityError(getErrorMessage(requestError));
    } finally {
      setSearchingCities(false);
    }
  };

  const selectCity = (location) => {
    setFormData((currentData) => ({
      ...currentData,
      destinationCity: location.name,
      country: location.country,
      longitude: String(location.longitude),
      latitude: String(location.latitude),
    }));

    setCitySearch(
      [
        location.name,
        location.state,
        location.country,
      ]
        .filter(Boolean)
        .join(", ")
    );

    setCityResults([]);
    setCityError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.destinationCity ||
      !formData.longitude ||
      !formData.latitude
    ) {
      setError(
        "Search for a destination and select one of the city results."
      );
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError(
        "The end date cannot be before the start date."
      );
      return;
    }

    setSubmitting(true);

    try {
      const savedTrip = isEditing
        ? await updateTrip(tripId, formData)
        : await createTrip(formData);

      navigate(`/trips/${savedTrip._id}`, {
        replace: true,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <AppHeader />

        <main className="content-loader">
          <div className="spinner" />
          <p>Loading trip...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="form-page">
        <div className="page-heading">
          <div>
            <Link
              className="back-link"
              to={
                isEditing
                  ? `/trips/${tripId}`
                  : "/dashboard"
              }
            >
              ← Back
            </Link>

            <p className="eyebrow">
              {isEditing
                ? "Update itinerary"
                : "New adventure"}
            </p>

            <h1>
              {isEditing
                ? "Edit your trip"
                : "Plan a new trip"}
            </h1>

            <p>
              Add the essential details now. Activities
              and weather will be available on the trip
              page.
            </p>
          </div>
        </div>

        <form
          className="form-card trip-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div
              className="alert alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <section className="form-section">
            <div className="form-section-heading">
              <span>1</span>
              <div>
                <h2>Trip details</h2>
                <p>
                  Give your journey a memorable name.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label className="field field-full">
                <span>Trip title</span>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Summer in Boston"
                  minLength="2"
                  maxLength="80"
                  required
                />
              </label>

              <label>
                <span>Category</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
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
                <span>Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
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
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span>2</span>
              <div>
                <h2>Destination</h2>
                <p>
                  Search Open-Meteo to select an exact
                  location.
                </p>
              </div>
            </div>

            <div className="city-search">
              <label htmlFor="citySearch">
                Destination city
              </label>

              <div className="city-search-row">
                <input
                  id="citySearch"
                  type="search"
                  value={citySearch}
                  onChange={handleCityInputChange}
                  placeholder="Search Boston, Paris, Tokyo..."
                  required
                />

                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleCitySearch}
                  disabled={searchingCities}
                >
                  {searchingCities
                    ? "Searching..."
                    : "Search city"}
                </button>
              </div>

              {cityError && (
                <p
                  className="field-error"
                  role="alert"
                >
                  {cityError}
                </p>
              )}

              {cityResults.length > 0 && (
                <div className="city-results">
                  {cityResults.map((location) => (
                    <button
                      key={`${location.id}-${location.latitude}`}
                      type="button"
                      onClick={() =>
                        selectCity(location)
                      }
                    >
                      <strong>{location.name}</strong>
                      <span>
                        {[
                          location.state,
                          location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {formData.destinationCity && (
                <div className="selected-city">
                  <span>✓</span>

                  <div>
                    <strong>
                      {formData.destinationCity}
                      {formData.country
                        ? `, ${formData.country}`
                        : ""}
                    </strong>

                    <small>
                      Coordinates saved automatically
                    </small>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span>3</span>
              <div>
                <h2>Travel dates</h2>
                <p>
                  Choose when your journey begins and
                  ends.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                <span>Start date</span>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>End date</span>
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  required
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span>4</span>
              <div>
                <h2>Notes</h2>
                <p>
                  Add useful reminders or travel ideas.
                </p>
              </div>
            </div>

            <label className="field">
              <span>Trip notes</span>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Hotel ideas, packing reminders, places to visit..."
                rows="5"
                maxLength="1000"
              />
            </label>
          </section>

          <footer className="form-actions">
            <Link
              className="button button-secondary"
              to={
                isEditing
                  ? `/trips/${tripId}`
                  : "/dashboard"
              }
            >
              Cancel
            </Link>

            <button
              className="button button-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Saving trip..."
                : isEditing
                  ? "Save changes"
                  : "Create trip"}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default TripFormPage;