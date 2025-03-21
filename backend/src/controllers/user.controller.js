class UserController {
    constructor(db) {
      this.db = db;
  
      // Bind methods so 'this' refers to the class instance
      this.getUserDetails = this.getUserDetails.bind(this);
      this.getUserBookings = this.getUserBookings.bind(this);
    }
  
    // GET /api/user/:userId
    getUserDetails(req, res) {
      const userId = req.params.userId;
      const query = "SELECT * FROM User WHERE UserID = ?";
      this.db.query(query, [userId], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error fetching user.' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found.' });
        }
        // Return the first row
        res.json(results[0]);
      });
    }
  
    // GET /api/user/:userId/bookings
    getUserBookings(req, res) {
      const userId = req.params.userId;
      const query = `
        SELECT 
          b.BookingID AS bookingId,
          b.TotalAmount AS totalAmount,
          e.Title AS eventTitle,
          p.PerformanceDate AS performanceDate,
          b.BookingDate AS bookingDate
        FROM Booking b
        JOIN events e ON b.EventID = e.EventID
        JOIN performance p ON b.PerformanceID = p.PerformanceID
        WHERE b.UserID = ?
        ORDER BY b.BookingDate DESC
      `;
      this.db.query(query, [userId], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error fetching bookings.' });
        }
        // Return array of bookings
        res.json(results);
      });
    }
  }
  
  module.exports = UserController;
  