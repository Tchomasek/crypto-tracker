import "./ConnectionErrorBanner.css";

export const ConnectionErrorBanner = () => (
  <div className="error-banner">
    WebSocket connection failed. Attempting to reconnect...
  </div>
);
