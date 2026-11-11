import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/AxiosInstance";

const BackendTest = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint discussed: /api/notifications/v1/get?type=all&isFavourite=true
      const response = await axiosInstance.get("/api/notifications/v1/get", {
        params: {
          type: "all",
          isFavourite: "true"
        }
      });
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Backend Notification Test</h1>
      <p>Testing endpoint: <code>/api/notifications/v1/get?type=all&isFavourite=true</code></p>
      
      <button 
        onClick={fetchNotifications}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        {loading ? "Refreshing..." : "Refresh Data"}
      </button>

      {error && (
        <div style={{ color: "red", marginBottom: "20px", padding: "10px", border: "1px solid red" }}>
          Error: {error}
        </div>
      )}

      <div>
        <h2>Notifications ({notifications.length})</h2>
        {notifications.length === 0 && !loading && <p>No favourite notifications found.</p>}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {notifications.map((notif) => (
            <li 
              key={notif._id} 
              style={{ 
                borderBottom: "1px solid #ccc", 
                padding: "10px 0",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <span style={{ fontWeight: "bold" }}>{notif.type.toUpperCase()}</span>
              <span>{notif.message}</span>
              <span style={{ fontSize: "0.8em", color: "#666" }}>
                {new Date(notif.dateTime).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BackendTest;