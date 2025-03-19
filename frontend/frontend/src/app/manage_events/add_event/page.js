"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [createdEventID, setCreatedEventID] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct the event object
    const newEvent = {
      Title: title,
      Genre: genre,
      Description: description,
      Duration: duration,
      StartDate: startDate,
      EndDate: endDate,
    };

    try {
      // POST to your backend (make sure /api/events is a POST endpoint)
      const res = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) {
        throw new Error("Failed to create event");
      }

      const data = await res.json();
      // data should contain the newly created event's ID if your backend returns it
      setCreatedEventID(data.eventId); // or data.insertId, etc.

      alert("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleAddPerformance = () => {
    if (!createdEventID) {
      alert("No event ID found. Please create an event first.");
      return;
    }
    // Navigate to the add performance page with the event ID
    router.push(`/manage_events/${createdEventID}/add_performance`);
  };

  return (
    <main style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Add Event</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label>
          Title:
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Genre:
          <input value={genre} onChange={(e) => setGenre(e.target.value)} required />
        </label>
        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Duration:
          <input
            placeholder="e.g., 2h"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </label>
        <label>
          Start Date:
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </label>
        <label>
          End Date:
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </label>

        <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem", fontWeight: "bold" }}>
          Create Event
        </button>
      </form>

      {/* After creating the event, show button to add performances */}
      {createdEventID && (
        <button
          onClick={handleAddPerformance}
          style={{
            marginTop: "1rem",
            padding: "0.5rem",
            fontWeight: "bold",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Add Performances
        </button>
      )}
    </main>
  );
}
