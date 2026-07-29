function AdminPagination({
  page,
  totalPages,
  onPageChange,
}) {
  const lastPage = Math.max(totalPages || 1, 1);

  if (lastPage <= 1) {
    return (
      <div className="admin-pagination admin-pagination--single">
        <span>
          Page <strong>1</strong> of{" "}
          <strong>1</strong>
        </span>
      </div>
    );
  }

  return (
    <nav
      className="admin-pagination"
      aria-label="Table pagination"
    >
      <button
        className="button button-secondary"
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>

      <span>
        Page <strong>{page}</strong> of{" "}
        <strong>{lastPage}</strong>
      </span>

      <button
        className="button button-secondary"
        type="button"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}

export default AdminPagination;