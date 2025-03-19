"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const labelClass = "block font-semibold mb-1";
const inputClass = "border border-gray-300 p-2 rounded w-full";

export default function EditEventPage() {
  const { eventId } = useParams();
  const router = useRouter();

  const [eventData, setEventData] = useState({
    Title: "",
    Genre: "",
    Description: "",
    Duration: "",
    StartDate: "",
    EndDate: "",
  });
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    // Fetch single event data
    fetch(`http://localhost:3000/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        // data is the single event object from the server
        setEventData({
          Title: data.Title || "",
          Genre: data.Genre || "",
          Description: data.Description || "",
          Duration: data.Duration || "",
          StartDate: data.StartDate ? data.StartDate.slice(0, 16) : "",
          EndDate: data.EndDate ? data.EndDate.slice(0, 16) : "",
        });
      })
      .catch((err) => console.error("Error fetching event:", err));

    // Fetch performances for this event
    fetch(`http://localhost:3000/api/performance/${eventId}`)
      .then((res) => res.json())
      .then((perfData) => {
        // perfData is an array of performances
        const updatedPerf = perfData.map((p) => ({
          ...p,
          PerformanceDate: p.PerformanceDate?.slice(0, 10) || "",
          StartTime: p.StartTime?.slice(0, 5) || "",
          EndTime: p.EndTime?.slice(0, 5) || "",
        }));
        setPerformances(updatedPerf);
      })
      .catch((err) => console.error("Error fetching performances:", err))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePerformanceChange = (index, field, value) => {
    setPerformances((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      // Update the event
      const eventResponse = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData }),
      });
      if (!eventResponse.ok) {
        throw new Error("Failed to update event");
      }

      // Update each performance
      for (const perf of performances) {
        const perfUpdateBody = {
          PerformanceDate: perf.PerformanceDate,
          StartTime: perf.StartTime,
          EndTime: perf.EndTime,
          Band1: perf.Band1,
          Band2: perf.Band2,
          Band3: perf.Band3,
          Space: perf.Space,
        };

        const perfResponse = await fetch(
          `http://localhost:3000/api/performance/${perf.PerformanceID}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(perfUpdateBody),
          }
        );
        if (!perfResponse.ok) {
          throw new Error(`Failed to update performance ID: ${perf.PerformanceID}`);
        }
      }

      alert("Event and performances updated successfully!");
      // router.push("/manage_events"); // if you want to go back
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while updating the event.");
    }
  };

  if (loading) {
    return <div className="p-4">Loading event details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Event #{eventId}</h1>

      {/* Event Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              name="Title"
              value={eventData.Title}
              onChange={handleEventChange}
            />
          </div>
          <div>
            <label className={labelClass}>Genre</label>
            <input
              className={inputClass}
              name="Genre"
              value={eventData.Genre}
              onChange={handleEventChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass}
              name="Description"
              rows={3}
              value={eventData.Description}
              onChange={handleEventChange}
            />
          </div>
          <div>
            <label className={labelClass}>Duration</label>
            <input
              className={inputClass}
              name="Duration"
              placeholder="e.g., 2h"
              value={eventData.Duration}
              onChange={handleEventChange}
            />
          </div>
          <div>
            <label className={labelClass}>Start Date & Time</label>
            <input
              className={inputClass}
              type="datetime-local"
              name="StartDate"
              value={eventData.StartDate}
              onChange={handleEventChange}
            />
          </div>
          <div>
            <label className={labelClass}>End Date & Time</label>
            <input
              className={inputClass}
              type="datetime-local"
              name="EndDate"
              value={eventData.EndDate}
              onChange={handleEventChange}
            />
          </div>
        </div>
      </div>

      {/* Performances Table */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Performances</h2>
        {performances.length === 0 ? (
          <p>No performances found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">Start Time</th>
                <th className="border p-2">End Time</th>
                <th className="border p-2">Band1</th>
                <th className="border p-2">Band2</th>
                <th className="border p-2">Band3</th>
                <th className="border p-2">Space</th>
              </tr>
            </thead>
            <tbody>
              {performances.map((perf, index) => (
                <tr key={perf.PerformanceID}>
                  <td className="border p-2">
                    <input
                      type="date"
                      className={inputClass}
                      value={perf.PerformanceDate}
                      onChange={(e) =>
                        handlePerformanceChange(index, "PerformanceDate", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="time"
                      className={inputClass}
                      value={perf.StartTime}
                      onChange={(e) => handlePerformanceChange(index, "StartTime", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="time"
                      className={inputClass}
                      value={perf.EndTime}
                      onChange={(e) => handlePerformanceChange(index, "EndTime", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      className={inputClass}
                      value={perf.Band1 || ""}
                      onChange={(e) => handlePerformanceChange(index, "Band1", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      className={inputClass}
                      value={perf.Band2 || ""}
                      onChange={(e) => handlePerformanceChange(index, "Band2", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      className={inputClass}
                      value={perf.Band3 || ""}
                      onChange={(e) => handlePerformanceChange(index, "Band3", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      className={inputClass}
                      value={perf.Space || ""}
                      onChange={(e) => handlePerformanceChange(index, "Space", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveChanges}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
