"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManageEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);

  // Inline styles for simplicity
  const styles = {
    container: { padding: "1rem", fontFamily: "Arial, sans-serif" },
    button: {
      border: "none",
      borderRadius: "4px",
      padding: "8px 16px",
      margin: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
    },
    addButton: { backgroundColor: "#007bff", color: "white" },
    editButton: { backgroundColor: "#28a745", color: "white" },
    deleteButton: { backgroundColor: "#dc3545", color: "white" },
    bookingsButton: { backgroundColor: "#6c757d", color: "white" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
    th: { backgroundColor: "#f8f9fa", padding: "10px", border: "1px solid #dee2e6" },
    td: { padding: "10px", border: "1px solid #dee2e6", textAlign: "center" },
  };

  useEffect(() => {
    // 1. Check if a user is logged in and is an admin.
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // If not logged in, redirect to the login page.
      router.push("/login");
      return;
    }
    const userObj = JSON.parse(storedUser);
    if (!userObj.isAdmin) {
      // If logged in but not an admin, redirect to home or show error.
      router.push("/");
      return;
    }

    // 2. Fetch events from the admin endpoint.
    fetch("http://localhost:3000/api/admin/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching admin events:", err));
  }, [router]);

  // Handler for navigating to the event edit page.
  const handleEdit = (eventId) => {
    router.push(`/manage_events/${eventId}/edit`);
  };

  // Handler for navigating to the bookings page for a specific event.
  const handleViewBookings = (eventId) => {
    router.push(`/manage_events/${eventId}/bookings`);
  };

  // Dummy delete handler for demonstration.
  const handleDelete = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((evt) => evt.EventID !== eventId));
      // In a real implementation, you would also call the backend DELETE endpoint.
    }
  };

  return (
    <main style={styles.container}>

      {/* Link to the "Add Event" page */}
      <Link href="/manage_events/add_event">
        <button style={{ ...styles.button, ...styles.addButton }}>
          Add Event
        </button>
      </Link>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Genre</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.EventID}>
              <td style={styles.td}>{event.Title}</td>
              <td style={styles.td}>{event.Genre}</td>
              <td style={styles.td}>{event.Description}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, ...styles.editButton }}
                  onClick={() => handleEdit(event.EventID)}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.button, ...styles.deleteButton }}
                  onClick={() => handleDelete(event.EventID)}
                >
                  Delete
                </button>
                <button
                  style={{ ...styles.button, ...styles.bookingsButton }}
                  onClick={() => handleViewBookings(event.EventID)}
                >
                  View Bookings
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
