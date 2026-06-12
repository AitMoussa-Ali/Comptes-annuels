

import { useEffect } from "react";
import { XIcon } from "../Icons/Icons";
import "./Modal.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  icon,
  confirmLabel = "Compris",
  onConfirm,
  cancelLabel,
  onCancel,
  variant = "warning",
  children,
}) {
  // Keyboard: Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => (onConfirm ? onConfirm() : onClose());
  const handleCancel  = () => (onCancel  ? onCancel()  : onClose());

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`modal-box modal-box--${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className={`modal-icon-wrapper modal-icon-wrapper--${variant}`}>
            {icon}
          </div>
        )}

        <div className="modal-content">
          {title   && <h2 className="modal-title">{title}</h2>}
          {children
            ? <div className="modal-body">{children}</div>
            : message && <p className="modal-message">{message}</p>
          }
        </div>

        <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
          <XIcon />
        </button>

        <div className="modal-actions">
          {cancelLabel && (
            <button className="btn btn-secondary modal-btn" onClick={handleCancel}>
              {cancelLabel}
            </button>
          )}
          <button className="btn btn-primary modal-btn" onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}