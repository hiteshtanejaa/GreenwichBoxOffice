// src/controllers/performance.controller.js
class PerformanceController {
    constructor(db) {
      this.db = db;
      this.createPerformance = this.createPerformance.bind(this);
      this.getAllPerformances = this.getAllPerformances.bind(this);
      this.getPerformancesByEvent = this.getPerformancesByEvent.bind(this);
      this.updatePerformance = this.updatePerformance.bind(this);
    }
  
    createPerformance(req, res) {
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
  
      const query = `
        INSERT INTO performance (
          EventID, PerformanceDate, StartTime, EndTime,
          Band1, Band2, Band3, Space
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.query(
        query,
        [EventID, PerformanceDate, StartTime, EndTime, Band1, Band2, Band3, Space],
        (err, result) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ error: 'Database error while adding performance.' });
          }
          res.json({ message: 'Performance added successfully!', performanceId: result.insertId });
        }
      );
    }
  
    getAllPerformances(req, res) {
      const query = "SELECT * FROM performance";
      this.db.query(query, (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving performances.' });
        }
        res.json(results);
      });
    }
  
    getPerformancesByEvent(req, res) {
      const eventId = req.params.eventId;
      const query = "SELECT * FROM performance WHERE EventID = ?";
      this.db.query(query, [eventId], (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving performances.' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'No performances found for this event.' });
        }
        res.json(results);
      });
    }
  
    updatePerformance(req, res) {
      const performanceId = req.params.performanceId;
      const {
        PerformanceDate,
        StartTime,
        EndTime,
        Band1,
        Band2,
        Band3,
        Space
      } = req.body;
  
      const query = `
        UPDATE performance
        SET PerformanceDate = ?, StartTime = ?, EndTime = ?, Band1 = ?, Band2 = ?, Band3 = ?, Space = ?
        WHERE PerformanceID = ?
      `;
      this.db.query(
        query,
        [PerformanceDate, StartTime, EndTime, Band1, Band2, Band3, Space, performanceId],
        (err) => {
          if (err) {
            console.error('Update performance error:', err);
            return res.status(500).json({ error: 'Database error while updating performance.' });
          }
          res.json({ message: 'Performance updated successfully' });
        }
      );
    }
  }
  
  module.exports = PerformanceController;
  