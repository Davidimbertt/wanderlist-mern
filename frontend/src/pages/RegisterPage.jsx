import { useState } from "react";
import { Link, useNavigate } from "react-router";

import useAuth from "../context/useAuth";
import { getErrorMessage } from "../services/api";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/dashboard", { replace: true });
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
          <p className="eyebrow">Your journey, organized</p>

          <h1>
            Turn travel ideas into unforgettable
            itineraries.
          </h1>

          <p>
            Build trips, schedule activities, and check
            destination weather before you leave.
          </p>
        </div>

        <p className="auth-quote">
          Plan simply. Travel confidently.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Get started</p>
          <h2>Create your account</h2>
          <p className="auth-intro">
            Your next adventure begins here.
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
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Your name"
              minLength="2"
              required
            />

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength="8"
              required
            />

            <label htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Enter your password again"
              minLength="8"
              required
            />

            <button
              className="button button-primary button-full"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;