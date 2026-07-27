import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";

import useAuth from "../context/useAuth";
import { getErrorMessage } from "../services/api";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData);

      const destination =
        location.state?.from?.pathname || "/dashboard";

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Link className="brand brand-light" to="/">
          <span className="brand-mark">W</span>
          <span>WanderList</span>
        </Link>

        <div className="auth-showcase-content">
          <p className="eyebrow">Plan with confidence</p>

          <h1>
            Every memorable journey starts with a
            thoughtful plan.
          </h1>

          <p>
            Organize destinations, daily activities,
            and live weather forecasts in one place.
          </p>
        </div>

        <p className="auth-quote">
          Your next adventure is closer than it feels.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to WanderList</h2>
          <p className="auth-intro">
            Continue planning your next great trip.
          </p>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />

            <button
              className="button button-primary button-full"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New to WanderList?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;