// src/controllers/events.controller.js
class EventsController {
    constructor(db) {
      this.db = db;
      this.createEvent = this.createEvent.bind(this);
      this.getAllEvents = this.getAllEvents.bind(this);
      this.getEventById = this.getEventById.bind(this);
      this.updateEvent = this.updateEvent.bind(this);
    }
  
    createEvent(req, res) {
      const { Title, Genre, Description, Duration, StartDate, EndDate } = req.body;
      const query = `
        INSERT INTO events (Title, Genre, Description, Duration, StartDate, EndDate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      this.db.query(query, [Title, Genre, Description, Duration, StartDate, EndDate], (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Database error while creating event.' });
        }
        res.json({ message: 'Event created successfully!', eventId: result.insertId });
      });
    }
  
    getAllEvents(req, res) {
      const query = "SELECT * FROM events";
      this.db.query(query, (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving events.' });
        }
        res.json(results);
      });
    }
  
    getEventById(req, res) {
      const eventId = req.params.eventId;
      const query = "SELECT * FROM events WHERE EventID = ?";
      this.db.query(query, [eventId], (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving event.' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Event not found.' });
        }
        res.json(results[0]);
      });
    }
  
    updateEvent(req, res) {
      const eventId = req.params.eventId;
      const { Title, Genre, Description, Duration, StartDate, EndDate } = req.body;
  
      const query = `
        UPDATE events
        SET Title = ?, Genre = ?, Description = ?, Duration = ?, StartDate = ?, EndDate = ?
        WHERE EventID = ?
      `;
      this.db.query(query, [Title, Genre, Description, Duration, StartDate, EndDate, eventId], (err) => {
        if (err) {
          console.error('Update error:', err);
          return res.status(500).json({ error: 'Database error while updating event.' });
        }
        res.json({ message: 'Event updated successfully' });
      });
    }
  }
  
  module.exports = EventsController;
  