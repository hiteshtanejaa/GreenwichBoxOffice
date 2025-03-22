// src/controllers/admin.controller.js

/**
 * AdminController
 * 
 * This controller provides endpoints specifically for administrative tasks,
 * such as fetching all events or viewing all bookings for a particular event.
 * It is designed to be used by admin routes only.
 */
class AdminController {
    /**
     * Constructs a new AdminController.
     * @param {object} db - The database connection object.
     */
    constructor(db) {
      this.db = db;
  
      // Bind methods so 'this' context is preserved in callbacks
      this.getAllEvents = this.getAllEvents.bind(this);
      this.getEventBookings = this.getEventBookings.bind(this);
    }
  
    /**
     * Retrieves all events, ordered by StartDate descending.
     * Intended for admin usage to manage or review events.
     * 
     * Route: GET /api/admin/events
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getAllEvents(req, res) {
      // SQL query to select all events, sorted by StartDate in descending order
      const query = "SELECT * FROM events ORDER BY StartDate DESC";
      
      // Execute the query
      this.db.query(query, (err, results) => {
        if (err) {
          // Return a 500 error if there's a database issue
          return res.status(500).json({ error: "Error fetching events." });
        }
        // Respond with the list of events
        res.json(results);
      });
    }
  
    /**
     * Retrieves all bookings (and associated tickets) for a given event.
     * Joins Booking, Ticket, and User tables to provide comprehensive details.
     * 
     * Route: GET /api/admin/events/:eventId/bookings
     * @param {object} req - Express request object; expects eventId in req.params.
     * @param {object} res - Express response object.
     */
    getEventBookings(req, res) {
      // Extract the eventId from the URL parameters
      const eventId = req.params.eventId;
  
      // SQL query to fetch booking details, joined with Ticket and User data
      const query = `
        SELECT 
          b.BookingID, 
          b.UserID, 
          b.TotalAmount, 
          b.DiscountApplied, 
          b.BookingDate,
          t.TicketID, 
          t.SeatInfo, 
          t.Price,
          u.Name as userName
        FROM Booking b
        JOIN Ticket t ON b.BookingID = t.BookingID
        JOIN User u ON b.UserID = u.UserID
        WHERE b.EventID = ?
        ORDER BY b.BookingDate DESC
      `;
  
      // Execute the query using the eventId
      this.db.query(query, [eventId], (err, results) => {
        if (err) {
          // Return a 500 error if there's a database issue
          return res.status(500).json({ error: "Error fetching bookings." });
        }
        // Respond with the array of bookings and tickets
        res.json(results);
      });
    }
  }
  
  module.exports = AdminController;
  