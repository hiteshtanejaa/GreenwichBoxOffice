// src/app/page.js
import Link from 'next/link';

export default async function HomePage() {
  // Replace with your actual backend URL if different
  const res = await fetch('http://localhost:3000/api/events', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  const events = await res.json();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link key={event.EventID} href={`/events/${event.EventID}`}>
          <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">{event.Title}</h2>
            <p className="text-sm text-gray-500">{event.Genre}</p>
            <p className="mt-2 text-gray-700 line-clamp-3">{event.Description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
