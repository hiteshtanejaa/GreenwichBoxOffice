// src/controllers/events.controller.js

/**
 * EventsController handles operations related to events such as
 * creating a new event, retrieving events, retrieving a specific event,
 * and updating an event.
 */
class EventsController {
    /**
     * Constructs a new EventsController instance.
     * @param {object} db - The database connection object.
     */
    constructor(db) {
      this.db = db;
      // Bind methods to ensure correct 'this' context in callbacks
      this.createEvent = this.createEvent.bind(this);
      this.getAllEvents = this.getAllEvents.bind(this);
      this.getEventById = this.getEventById.bind(this);
      this.updateEvent = this.updateEvent.bind(this);
    }
  
    /**
     * Creates a new event.
     * @param {object} req - Express request object containing event details in req.body.
     * @param {object} res - Express response object.
     */
    createEvent(req, res) {
      // Destructure event details from the request body
      const { Title, Genre, Description, Duration, StartDate, EndDate } = req.body;
      // SQL query to insert the event into the 'events' table
      const query = `
        INSERT INTO events (Title, Genre, Description, Duration, StartDate, EndDate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      // Execute the query with provided values
      this.db.query(query, [Title, Genre, Description, Duration, StartDate, EndDate], (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Database error while creating event.' });
        }
        // Respond with a success message and the newly generated event ID
        res.json({ message: 'Event created successfully!', eventId: result.insertId });
      });
    }
  
    /**
     * Retrieves all events from the database.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getAllEvents(req, res) {
      // SQL query to select all events from the 'events' table
      const query = "SELECT * FROM events";
      this.db.query(query, (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving events.' });
        }
        // Respond with the list of events
        res.json(results);
      });
    }
  
    /**
     * Retrieves a specific event by its EventID.
     * @param {object} req - Express request object containing eventId as a URL parameter.
     * @param {object} res - Express response object.
     */
    getEventById(req, res) {
      const eventId = req.params.eventId;
      // SQL query to select a specific event based on EventID
      const query = "SELECT * FROM events WHERE EventID = ?";
      this.db.query(query, [eventId], (err, results) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: 'Database error while retrieving event.' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Event not found.' });
        }
        // Respond with the found event record
        res.json(results[0]);
      });
    }
  
    /**
     * Updates an existing event.
     * @param {object} req - Express request object containing eventId in URL and updated event details in req.body.
     * @param {object} res - Express response object.
     */
    updateEvent(req, res) {
      const eventId = req.params.eventId;
      // Destructure the updated event details from the request body
      const { Title, Genre, Description, Duration, StartDate, EndDate } = req.body;
      // SQL query to update event details in the 'events' table for a specific EventID
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
        // Respond with a success message after updating the event
        res.json({ message: 'Event updated successfully' });
      });
    }
  }
  
  module.exports = EventsController;
  