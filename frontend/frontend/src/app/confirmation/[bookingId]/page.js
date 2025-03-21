"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ConfirmationPage() {
  const { bookingId } = useParams(); // e.g. "11"
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fetch booking details from our backend
    fetch(`http://localhost:3000/api/booking/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          // If the server responded with an error, handle it
          setErrorMsg(data.error);
        } else {
          setBookingData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching booking details:", err);
        setErrorMsg("An error occurred while fetching booking details.");
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) {
    return <div className="p-4">Loading booking details...</div>;
  }

  if (errorMsg) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Booking Confirmation</h1>
        <p className="text-red-500">{errorMsg}</p>
      </div>
    );
  }

  // Destructure the data we expect
  const { eventTitle, performanceDate, totalAmount, tickets } = bookingData;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Booking Confirmation</h1>

      {/* Booking Details */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Booking Details</h2>
        <p><strong>Event:</strong> {eventTitle}</p>
        <p><strong>Performance Date:</strong> {new Date(performanceDate).toLocaleString()}</p>
        <p><strong>Total Amount:</strong> £{totalAmount?.toFixed(2)}</p>
      </div>

      {/* Ticket Details */}
      <div>
        <h2 className="text-xl font-semibold">Ticket Details</h2>
        {tickets && tickets.length > 0 ? (
          <div className="space-y-2 mt-2">
            {tickets.map((ticket) => (
              <div key={ticket.ticketID} className="border p-2 rounded">
                {/* If your DB has band or userType columns, display them here */}
                <p><strong>TicketID:</strong> {ticket.ticketID}</p>
                <p><strong>Seat Info:</strong> {ticket.seatInfo}</p>
                <p><strong>Price:</strong> £{ticket.price?.toFixed(2)}</p>
                {/* <p><strong>Band:</strong> {ticket.band}</p> */}
                {/* <p><strong>User Type:</strong> {ticket.userType}</p> */}
              </div>
            ))}
          </div>
        ) : (
          <p>No tickets found for this booking.</p>
        )}
      </div>
    </div>
  );
}
