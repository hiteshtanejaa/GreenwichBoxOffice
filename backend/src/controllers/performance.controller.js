// src/controllers/performance.controller.js

/**
 * PerformanceController
 * 
 * This controller handles operations related to performance records,
 * including creating a new performance, retrieving performances,
 * retrieving performances for a specific event, and updating a performance.
 */
class PerformanceController {
    /**
     * Constructs a new PerformanceController.
     * @param {object} db - The database connection object.
     */
    constructor(db) {
      this.db = db;
      // Bind methods to ensure 'this' context is maintained in callbacks.
      this.createPerformance = this.createPerformance.bind(this);
      this.getAllPerformances = this.getAllPerformances.bind(this);
      this.getPerformancesByEvent = this.getPerformancesByEvent.bind(this);
      this.updatePerformance = this.updatePerformance.bind(this);
    }
  
    /**
     * Creates a new performance record.
     * @param {object} req - Express request object containing performance details in req.body.
     * @param {object} res - Express response object.
     */
    createPerformance(req, res) {
      // Destructure performance details from the request body.
      const {
        EventID,
        PerformanceDate,
        StartTime,
        EndTime,
        Band1,
        Band2,
        Band3,
        Space
      } = req.body;
  
      // SQL query to insert a new performance record.
      const query = `
        INSERT INTO performance (
          EventID, PerformanceDate, StartTime, EndTime,
          Band1, Band2, Band3, Space
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Execute the query with the provided values.
      this.db.query(
        query,
        [EventID, PerformanceDate, StartTime, EndTime, Band1, Band2, Band3, Space],
        (err, result) => {
          if (err) {
            console.error('Insert error:', err);
            // Respond with a 500 error if the insert fails.
            return res.status(500).json({ error: 'Database error while adding performance.' });
          }
          // On success, return a JSON response with a success message and the new performanceId.
          res.json({ message: 'Performance added successfully!', performanceId: result.insertId });
        }
      );
    }
  
    /**
     * Retrieves all performance records.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getAllPerformances(req, res) {
      // SQL query to fetch all performances.
      const query = "SELECT * FROM performance";
      this.db.query(query, (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving performances.' });
        }
        // Respond with the results array.
        res.json(results);
      });
    }
  
    /**
     * Retrieves all performances for a specific event.
     * @param {object} req - Express request object; expects eventId in req.params.
     * @param {object} res - Express response object.
     */
    getPerformancesByEvent(req, res) {
      // Extract eventId from URL parameters.
      const eventId = req.params.eventId;
      // SQL query to fetch performances associated with the given EventID.
      const query = "SELECT * FROM performance WHERE EventID = ?";
      this.db.query(query, [eventId], (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving performances.' });
        }
        if (results.length === 0) {
          // If no performances found, return a 404 error.
          return res.status(404).json({ error: 'No performances found for this event.' });
        }
        // Return the array of performance records.
        res.json(results);
      });
    }
  
    /**
     * Updates an existing performance record.
     * @param {object} req - Express request object; expects performanceId in req.params and updated details in req.body.
     * @param {object} res - Express response object.
     */
    updatePerformance(req, res) {
      // Extract performanceId from URL parameters.
      const performanceId = req.params.performanceId;
      // Destructure updated performance details from the request body.
      const {
        PerformanceDate,
        StartTime,
        EndTime,
        Band1,
        Band2,
        Band3,
        Space
      } = req.body;
  
      // SQL query to update the performance record.
      const query = `
        UPDATE performance
        SET PerformanceDate = ?, StartTime = ?, EndTime = ?, Band1 = ?, Band2 = ?, Band3 = ?, Space = ?
        WHERE PerformanceID = ?
      `;
      
      // Execute the update query.
      this.db.query(
        query,
        [PerformanceDate, StartTime, EndTime, Band1, Band2, Band3, Space, performanceId],
        (err) => {
          if (err) {
            console.error('Update performance error:', err);
            return res.status(500).json({ error: 'Database error while updating performance.' });
          }
          // On success, respond with a confirmation message.
          res.json({ message: 'Performance updated successfully' });
        }
      );
    }
  }
  
  module.exports = PerformanceController;
  