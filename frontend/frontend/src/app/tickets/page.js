"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TicketsPage() {
  const [bookings, setBookings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const { userId } = JSON.parse(storedUser);

    fetch(`http://localhost:3000/api/user/${userId}/bookings`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, []);

  if (!bookings || bookings.length === 0) {
    return <div className="p-4">No bookings found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
            onClick={() => router.push(`/confirmation/${booking.bookingId}`)}
          >
            <h2 className="text-xl font-semibold">{booking.eventTitle}</h2>
            <p><strong>Performance Date:</strong> {new Date(booking.performanceDate).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> £{booking.totalAmount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
