const DiscountService = require('../services/discount.service');
class BookingController {
    constructor(db) {
      this.db = db;
      this.discountService = new DiscountService(db);
      this.completeBooking = this.completeBooking.bind(this);
    }
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
          // We'll store some booking details in an object
          const bookingData = {
            bookingId: bookingRow.BookingID,
            eventTitle: bookingRow.EventTitle,
            performanceDate: bookingRow.PerformanceDate,
            totalAmount: bookingRow.TotalAmount,
            tickets: [] // We'll fill this after fetching tickets
          };
      
          // 2) Fetch tickets for this booking
          const ticketQuery = `
            SELECT t.TicketID, t.SeatInfo, t.Price
            -- If you store user type or band in the DB, include them here, e.g.:
            -- t.UserType, t.Band
            FROM Ticket t
            WHERE t.BookingID = ?
          `;
          this.db.query(ticketQuery, [bookingId], (ticketErr, ticketResults) => {
            if (ticketErr) {
              console.error('Error fetching tickets:', ticketErr);
              return res.status(500).json({ error: 'Database error while fetching tickets.' });
            }
      
            // Build an array of ticket objects
            bookingData.tickets = ticketResults.map((t) => ({
              ticketID: t.TicketID,
              seatInfo: t.SeatInfo,
              price: t.Price,
              // If your DB has columns for band, userType, etc., include them here:
              // band: t.Band,
              // userType: t.UserType
            }));
      
            // 3) Send the combined response
            res.json(bookingData);
          });
        });
      }

    async completeBooking(req, res) {
        try {
          const {
            userId,
            performanceId,
            eventId,
            totalAmount,
            discountApplied = 0,
            payment,
            shipping,
            categories, // e.g. { adults: { band, qty }, children: { band, qty }, ... }
            performanceDetails, // e.g. { Band1: 25, Band2: 15, Band3: 10 }
          } = req.body;
    
          // 1) Calculate discount amounts
          let discountTotal = 0;
    
          // Count total tickets
          let totalTickets = 0;
    
          // For each category (adults, children, oap, social)
          for (const cat of Object.keys(categories)) {
            const { band, qty } = categories[cat];
            if (!band || qty <= 0) continue;
    
            totalTickets += qty;
    
            // base ticket price for this band
            const ticketPrice = performanceDetails[band] || 0;
    
            // figure out discount type
            let discountType = null;
            if (cat === "children") discountType = "Children";
            else if (cat === "oap") discountType = "Old Age Pensioners";
            else if (cat === "social") discountType = "Social Group";
            // else "adults" => no discount
    
            if (discountType) {
              const baseDiscount = await this.discountService.getDiscountPercentage(discountType);
              // discount for each ticket
              const discountPerTicket = this.discountService.calculateDiscount(ticketPrice, baseDiscount);
              discountTotal += discountPerTicket * qty;
            }
          }
    
          // 2) If totalTickets > 20, apply extra 5% discount on the (totalAmount - discountTotal)
          let additionalDiscount = 0;
          if (totalTickets > 20) {
            const leftover = totalAmount - discountTotal;
            additionalDiscount = leftover * 0.05; // 5%
          }
    
          const finalDiscount = discountTotal + additionalDiscount;
          const finalTotal = totalAmount - finalDiscount;
    
          // 3) Insert booking record with final discount and final total
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
    
          // 4) Insert payment details
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
    
          // 5) Update booking with paymentId
          const updateBookingQuery = `UPDATE Booking SET PaymentID = ? WHERE BookingID = ?`;
          await new Promise((resolve, reject) => {
            this.db.query(updateBookingQuery, [paymentId, bookingId], (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
    
          // 6) Insert tickets
          const tickets = [];
          for (const cat of Object.keys(categories)) {
            const { band, qty } = categories[cat];
            if (!band || qty <= 0) continue;
    
            // base price from performanceDetails
            const ticketPrice = performanceDetails[band] || 0;
            for (let i = 0; i < qty; i++) {
              const randomSeatNumber = Math.floor(Math.random() * 100) + 1;
              tickets.push([bookingId, `Seat ${randomSeatNumber}`, ticketPrice]);
            }
          }
    
          if (tickets.length > 0) {
            const ticketQuery = `INSERT INTO Ticket (BookingID, SeatInfo, Price) VALUES ?`;
            await new Promise((resolve, reject) => {
              this.db.query(ticketQuery, [tickets], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          }
    
          // 7) Respond
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
  