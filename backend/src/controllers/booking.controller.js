// src/controllers/booking.controller.js

const DiscountService = require('../services/discount.service');

/**
 * BookingController handles operations related to booking,
 * including completing a booking (inserting records into Booking, Payment, and Ticket tables)
 * as well as retrieving booking details.
 */
class BookingController {
  /**
   * Constructs a new BookingController instance.
   * @param {object} db - The database connection object.
   */
  constructor(db) {
    this.db = db;
    // Initialize the discount service for calculating discount amounts.
    this.discountService = new DiscountService(db);
    // Bind the completeBooking method to ensure the correct 'this' context.
    this.completeBooking = this.completeBooking.bind(this);
  }

  /**
   * Retrieves detailed booking information including event and performance info and associated tickets.
   * @param {object} req - Express request object; expects bookingId in req.params.
   * @param {object} res - Express response object.
   */
  getBookingDetails(req, res) {
    const bookingId = req.params.bookingId;
    
    // 1) Fetch the main booking, event, and performance info
    const bookingQuery = `
      SELECT b.BookingID, b.TotalAmount, e.Title AS EventTitle, p.PerformanceDate
      FROM Booking b
      JOIN events e ON b.EventID = e.EventID
      JOIN performance p ON b.PerformanceID = p.PerformanceID
      WHERE b.BookingID = ?
    `;
    
    this.db.query(bookingQuery, [bookingId], (err, results) => {
      if (err) {
        console.error('Error fetching booking:', err);
        return res.status(500).json({ error: 'Database error while fetching booking.' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      
      const bookingRow = results[0];
      // Build a bookingData object to store the main booking info and an array for tickets.
      const bookingData = {
        bookingId: bookingRow.BookingID,
        eventTitle: bookingRow.EventTitle,
        performanceDate: bookingRow.PerformanceDate,
        totalAmount: bookingRow.TotalAmount,
        tickets: [] // Tickets will be added in the next step.
      };

      // 2) Fetch tickets associated with this booking
      const ticketQuery = `
        SELECT t.TicketID, t.SeatInfo, t.Price
        FROM Ticket t
        WHERE t.BookingID = ?
      `;
      this.db.query(ticketQuery, [bookingId], (ticketErr, ticketResults) => {
        if (ticketErr) {
          console.error('Error fetching tickets:', ticketErr);
          return res.status(500).json({ error: 'Database error while fetching tickets.' });
        }
        
        // Map the ticket results into an array of ticket objects.
        bookingData.tickets = ticketResults.map((t) => ({
          ticketID: t.TicketID,
          seatInfo: t.SeatInfo,
          price: t.Price,
        }));
        
        // 3) Respond with the combined booking details.
        res.json(bookingData);
      });
    });
  }

  /**
   * Completes a booking by calculating discounts, inserting booking, payment, and ticket records.
   * @param {object} req - Express request object containing booking details in req.body.
   * @param {object} res - Express response object.
   */
  async completeBooking(req, res) {
    try {
      const {
        userId,
        performanceId,
        eventId,
        totalAmount,            // Base total amount (sum of ticket prices without discount)
        discountApplied = 0,    // Optional, default to 0
        payment,
        shipping,
        categories,             // Example: { adults: { band, qty }, children: { band, qty }, ... }
        performanceDetails,     // Example: { Band1: 25, Band2: 15, Band3: 10 } – ticket prices for each band
      } = req.body;

      // 1) Calculate discount amounts based on categories.
      let discountTotal = 0;
      let totalTickets = 0;

      // Loop over each category (e.g., adults, children, oap, social)
      for (const cat of Object.keys(categories)) {
        const { band, qty } = categories[cat];
        if (!band || qty <= 0) continue; // Skip if no band selected or quantity is zero.

        totalTickets += qty;
        // Get the base ticket price from performance details for the selected band.
        const ticketPrice = performanceDetails[band] || 0;

        // Determine discount type based on category:
        // For "children", "oap", and "social", assign corresponding discount types.
        let discountType = null;
        if (cat === "children") discountType = "Children";
        else if (cat === "oap") discountType = "Old Age Pensioners";
        else if (cat === "social") discountType = "Social Group";
        // "adults" receive no discount.

        // If the category has a discount type, fetch the discount percentage and calculate discount.
        if (discountType) {
          const baseDiscount = await this.discountService.getDiscountPercentage(discountType);
          // Calculate discount per ticket for this category.
          const discountPerTicket = this.discountService.calculateDiscount(ticketPrice, baseDiscount);
          discountTotal += discountPerTicket * qty;
        }
      }

      // 2) Apply extra 5% discount if total tickets exceed 20.
      let additionalDiscount = 0;
      if (totalTickets > 20) {
        const leftover = totalAmount - discountTotal;
        additionalDiscount = leftover * 0.05; // 5% of the remaining amount.
      }

      const finalDiscount = discountTotal + additionalDiscount;
      const finalTotal = totalAmount - finalDiscount;

      // 3) Insert the booking record with the final discount and final total.
      const bookingQuery = `
        INSERT INTO Booking (UserID, EventID, PerformanceID, BookingDate, DiscountApplied, TotalAmount)
        VALUES (?, ?, ?, NOW(), ?, ?)
      `;
      const bookingResult = await new Promise((resolve, reject) => {
        this.db.query(
          bookingQuery,
          [userId, eventId, performanceId, finalDiscount, finalTotal],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });
      const bookingId = bookingResult.insertId;

      // 4) Insert payment details into the Payment table.
      const paymentQuery = `
        INSERT INTO Payment (BookingID, CardNumber, Expiry, CVV, CardHolderName, PaymentDate, Amount)
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `;
      const paymentResult = await new Promise((resolve, reject) => {
        this.db.query(
          paymentQuery,
          [bookingId, payment.cardNumber, payment.expiry, payment.cvv, payment.cardHolderName, finalTotal],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });
      const paymentId = paymentResult.insertId;

      // 5) Update the booking record with the paymentId.
      const updateBookingQuery = `UPDATE Booking SET PaymentID = ? WHERE BookingID = ?`;
      await new Promise((resolve, reject) => {
        this.db.query(updateBookingQuery, [paymentId, bookingId], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // 6) Insert tickets for each category.
      const tickets = [];
      for (const cat of Object.keys(categories)) {
        const { band, qty } = categories[cat];
        if (!band || qty <= 0) continue;

        // Use the base ticket price from performanceDetails.
        const ticketPrice = performanceDetails[band] || 0;
        for (let i = 0; i < qty; i++) {
          // Generate a random seat number between 1 and 100.
          const randomSeatNumber = Math.floor(Math.random() * 100) + 1;
          tickets.push([bookingId, `Seat ${randomSeatNumber}`, ticketPrice]);
        }
      }

      // Insert tickets if any were generated.
      if (tickets.length > 0) {
        const ticketQuery = `INSERT INTO Ticket (BookingID, SeatInfo, Price) VALUES ?`;
        await new Promise((resolve, reject) => {
          this.db.query(ticketQuery, [tickets], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }

      // 7) Respond with a success message including booking and payment IDs.
      return res.json({
        message: "Booking completed successfully",
        bookingId,
        paymentId,
      });
    } catch (error) {
      console.error("Error completing booking:", error);
      return res.status(500).json({ error: "Error completing booking." });
    }
  }
}

module.exports = BookingController;
