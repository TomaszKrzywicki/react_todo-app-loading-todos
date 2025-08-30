import React, { useEffect } from 'react';

type Props = {
  message: string;
  onClose: () => void;
};

export const Notification: React.FC<Props> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="notification notification--error">
      <span>{message}</span>
      <button
        type="button"
        className="delete"
        onClick={onClose}
        aria-label="close"
      >
        ×
      </button>
    </div>
  );
};
