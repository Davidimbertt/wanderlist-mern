function AdminStatCard({
  icon,
  label,
  value,
  description,
  actionLabel,
  onClick,
}) {
  return (
    <button
      className="admin-stat-card"
      type="button"
      aria-label={actionLabel}
      onClick={onClick}
    >
      <div className="admin-stat-card__top">
        <span
          className="admin-stat-card__icon"
          aria-hidden="true"
        >
          {icon}
        </span>

        <span className="admin-stat-card__label">
          {label}
        </span>
      </div>

      <strong className="admin-stat-card__value">
        {value}
      </strong>

      <p className="admin-stat-card__description">
        {description}
      </p>

      <span className="admin-stat-card__action">
        View details →
      </span>
    </button>
  );
}

export default AdminStatCard;