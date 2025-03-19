// src/app/events/[eventId]/page.js
'use client'; 
// If you need client-side interactivity (e.g., Book Now button triggers a client action)

import { useEffect, useState } from 'react';
import { useParams, useRouter} from 'next/navigation';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { eventId } = params; // e.g., 1, 2, etc.

  const [eventData, setEventData] = useState(null);
  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    // Fetch single event data
    fetch(`http://localhost:3000/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => setEventData(data))
      .catch((err) => console.error(err));

    // Fetch performances for this event
    fetch(`http://localhost:3000/api/performance/${eventId}`)
      .then((res) => res.json())
      .then((data) => setPerformances(data))
      .catch((err) => console.error(err));
  }, [eventId]);

  const handleBookNow = (performanceId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // user is not logged in, send them to register or login
      router.push("/register");
    } else {
      // user is logged in, proceed to booking page
      router.push(`/book?performanceId=${performanceId}`);
    }
  };

  if (!eventData) {
    return <div>Loading event details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Event Info */}
      <div className="bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{eventData.Title}</h1>
        <p className="text-gray-600">{eventData.Genre}</p>
        <p className="text-gray-700 mt-2">{eventData.Description}</p>
        <p className="mt-1 text-sm text-gray-500">Duration: {eventData.Duration}</p>
        <p className="mt-1 text-sm text-gray-500">
          Start: {new Date(eventData.StartDate).toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          End: {new Date(eventData.EndDate).toLocaleString()}
        </p>
      </div>

      {/* Performances */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Performances</h2>
        {performances.length === 0 ? (
          <p>No performances available.</p>
        ) : (
          performances.map((perf) => (
            <div
              key={perf.PerformanceID}
              className="flex items-center justify-between border-b py-2"
            >
              <div>
                <p className="font-medium">{perf.PerformanceName}</p>
                <p className="text-gray-500">
                  {new Date(perf.PerformanceDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleBookNow(perf.PerformanceID)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
