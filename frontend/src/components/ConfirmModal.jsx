import { useEffect } from "react";

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, busy, onCancel]);

  if (!open) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !busy
    ) {
      onCancel();
    }
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <section
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmModalTitle"
        aria-describedby="confirmModalMessage"
      >
        <span
          className="confirm-modal__icon"
          aria-hidden="true"
        >
          !
        </span>

        <h2 id="confirmModalTitle">{title}</h2>

        <p id="confirmModalMessage">
          {message}
        </p>

        <div className="confirm-modal__actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="button button-danger"
            type="button"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;