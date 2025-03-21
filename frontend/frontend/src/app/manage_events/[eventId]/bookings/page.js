"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EventBookingsPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Check if admin
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const userObj = JSON.parse(storedUser);
    if (!userObj.isAdmin) {
      router.push("/");
      return;
    }

    // fetch from admin route
    fetch(`http://localhost:3000/api/admin/events/${eventId}/bookings`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [eventId, router]);

  if (!bookings) return <div>Loading bookings...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings for Event {eventId}</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">BookingID</th>
              <th className="border p-2">UserID</th>
              <th className="border p-2">UserName</th>
              <th className="border p-2">TicketID</th>
              <th className="border p-2">SeatInfo</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">TotalAmount</th>
              <th className="border p-2">DiscountApplied</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={i}>
                <td className="border p-2">{b.BookingID}</td>
                <td className="border p-2">{b.UserID}</td>
                <td className="border p-2">{b.userName}</td>
                <td className="border p-2">{b.TicketID}</td>
                <td className="border p-2">{b.SeatInfo}</td>
                <td className="border p-2">£{b.Price?.toFixed(2)}</td>
                <td className="border p-2">£{b.TotalAmount?.toFixed(2)}</td>
                <td className="border p-2">£{b.DiscountApplied?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
