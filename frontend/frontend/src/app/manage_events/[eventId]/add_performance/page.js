"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function AddPerformancePage() {
  const { eventId } = useParams(); // matches [eventId] in folder name

  const [performanceDate, setPerformanceDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [band1, setBand1] = useState("");
  const [band2, setBand2] = useState("");
  const [band3, setBand3] = useState("");
  const [space, setSpace] = useState("");

  const handleAddPerformance = async (e) => {
    e.preventDefault();

    // Construct the performance object
    const newPerformance = {
      EventID: eventId, // must match the DB column
      PerformanceDate: performanceDate,
      StartTime: startTime,
      EndTime: endTime,
      Band1: band1,
      Band2: band2,
      Band3: band3,
      Space: space,
    };

    try {
      const res = await fetch("http://localhost:3000/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPerformance),
      });

      if (!res.ok) {
        throw new Error("Failed to add performance");
      }

      alert("Performance added successfully!");
      // Clear form or add more logic
      setPerformanceDate("");
      setStartTime("");
      setEndTime("");
      setBand1("");
      setBand2("");
      setBand3("");
      setSpace("");
    } catch (error) {
      console.error("Error adding performance:", error);
    }
  };

  return (
    <main style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Add Performance for Event #{eventId}</h1>
      <form onSubmit={handleAddPerformance} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label>
          Performance Date:
          <input
            type="date"
            value={performanceDate}
            onChange={(e) => setPerformanceDate(e.target.value)}
            required
          />
        </label>
        <label>
          Start Time:
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
        <label>
          Band 1:
          <input value={band1} onChange={(e) => setBand1(e.target.value)} />
        </label>
        <label>
          Band 2:
          <input value={band2} onChange={(e) => setBand2(e.target.value)} />
        </label>
        <label>
          Band 3:
          <input value={band3} onChange={(e) => setBand3(e.target.value)} />
        </label>
        <label>
          Space:
          <input value={space} onChange={(e) => setSpace(e.target.value)} />
        </label>

        <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem", fontWeight: "bold" }}>
          Add Performance
        </button>
      </form>
    </main>
  );
}
