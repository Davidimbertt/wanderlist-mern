import { useEffect } from "react";

function Toast({
  message,
  type = "success",
  onClose,
}) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div
      className={`toast toast--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span
        className="toast__icon"
        aria-hidden="true"
      >
        {type === "error" ? "!" : "✓"}
      </span>

      <span>{message}</span>

      <button
        type="button"
        aria-label="Close notification"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;