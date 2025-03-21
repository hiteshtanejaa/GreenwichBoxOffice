// src/controllers/admin.controller.js
class AdminController {
    constructor(db) {
      this.db = db;
      this.getAllEvents = this.getAllEvents.bind(this);
      this.getEventBookings = this.getEventBookings.bind(this);
    }
  
    // GET /api/admin/events
    getAllEvents(req, res) {
      const query = "SELECT * FROM events ORDER BY StartDate DESC";
      this.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching events." });
        res.json(results);
      });
    }
  
    // GET /api/admin/events/:eventId/bookings
    getEventBookings(req, res) {
      const eventId = req.params.eventId;
      const query = `
        SELECT b.BookingID, b.UserID, b.TotalAmount, b.DiscountApplied, b.BookingDate,
               t.TicketID, t.SeatInfo, t.Price,
               u.Name as userName
        FROM Booking b
        JOIN Ticket t ON b.BookingID = t.BookingID
        JOIN User u ON b.UserID = u.UserID
        WHERE b.EventID = ?
        ORDER BY b.BookingDate DESC
      `;
      this.db.query(query, [eventId], (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching bookings." });
        res.json(results);
      });
    }
  }
  
  module.exports = AdminController;
  