// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// REGISTER AND LOGIN
// -----------------------------

// 1) REGISTER
app.post('/api/register', (req, res) => {
  const { Name, EmailID, PhoneNumber, PostCode, Address, CustomerType, Username, Password } = req.body;

  // 1) Check if username or email already exists
  const checkQuery = `SELECT * FROM UserLogin WHERE Username = ?`;
  db.query(checkQuery, [Username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error checking username.' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // 2) Insert into User table
    const userQuery = `
      INSERT INTO User (Name, EmailID, PhoneNumber, PostCode, Address, CustomerType)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(userQuery, [Name, EmailID, PhoneNumber, PostCode, Address, CustomerType], (err, userResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error inserting user.' });
      }
      const newUserId = userResult.insertId;

      // 3) Insert into UserLogin table
      // For security, you should hash 'Password' with bcrypt before storing
      const loginQuery = `
        INSERT INTO UserLogin (UserID, Username, PasswordHash)
        VALUES (?, ?, ?)
      `;
      db.query(loginQuery, [newUserId, Username, Password], (err, loginResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error inserting user login.' });
        }
        return res.json({
          message: 'Registration successful',
          userId: newUserId,
          name: Name,
        });
      });
    });
  });
});

// 2) LOGIN
app.post('/api/login', (req, res) => {
  const { Username, Password } = req.body;

  const query = `
    SELECT UserLogin.*, User.Name
    FROM UserLogin
    JOIN User ON UserLogin.UserID = User.UserID
    WHERE Username = ?
  `;
  db.query(query, [Username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error during login.' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    const userLoginRow = results[0];

    // Compare password (in real code, use bcrypt.compare(Password, userLoginRow.PasswordHash))
    if (userLoginRow.PasswordHash !== Password) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // If valid, return some user info
    res.json({
      message: 'Login successful',
      userId: userLoginRow.UserID,
      name: userLoginRow.Name,
    });
  });
});



// -----------------------------
// EVENTS
// -----------------------------

// 1) CREATE Event (POST)
app.post('/api/events', (req, res) => {
  const { Title, Genre, Description, Duration, StartDate, EndDate } = req.body;
  const query = `
    INSERT INTO events (Title, Genre, Description, Duration, StartDate, EndDate)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Title, Genre, Description, Duration, StartDate, EndDate], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).send({ error: 'Database error while creating event.' });
    }
    // Return the newly created event's ID so the frontend can link to add_performance
    res.send({ message: 'Event created successfully!', eventId: result.insertId });
  });
});

// 2) READ All Events (GET)
app.get('/api/events', (req, res) => {
  const query = "SELECT * FROM events";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).send({ error: 'Database error while retrieving events.' });
    }
    // results is an array of event objects, each with EventID, Title, Genre, etc.
    res.send(results);
  });
});

// 3) READ One Event by EventID (GET)
app.get('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const query = "SELECT * FROM events WHERE EventID = ?";
  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).send({ error: 'Database error while retrieving event.' });
    }
    if (results.length === 0) {
      return res.status(404).send({ error: 'Event not found.' });
    }
    // Return the single event object
    res.send(results[0]);
  });
});

// 4) UPDATE Event (PUT)
app.put('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const { Title, Genre, Description, Duration, StartDate, EndDate } = req.body;

  const query = `
    UPDATE events
    SET Title = ?, Genre = ?, Description = ?, Duration = ?, StartDate = ?, EndDate = ?
    WHERE EventID = ?
  `;
  db.query(
    query,
    [Title, Genre, Description, Duration, StartDate, EndDate, eventId],
    (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).send({ error: 'Database error while updating event.' });
      }
      res.send({ message: 'Event updated successfully' });
    }
  );
});

// -----------------------------
// PERFORMANCES
// -----------------------------

// 1) CREATE Performance (POST)
app.post('/api/performance', (req, res) => {
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

  db.query(
    query,
    [EventID, PerformanceDate, StartTime, EndTime, Band1, Band2, Band3, Space],
    (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).send({ error: 'Database error while adding performance.' });
      }
      res.send({ message: 'Performance added successfully!', performanceId: result.insertId });
    }
  );
});

// 2) READ Performances (GET all)
app.get('/api/performance', (req, res) => {
  const query = "SELECT * FROM performance";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).send({ error: 'Database error while retrieving performances.' });
    }
    res.send(results);
  });
});

// 3) READ Performances by EventID (GET)
app.get('/api/performance/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const query = "SELECT * FROM performance WHERE EventID = ?";
  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).send({ error: 'Database error while retrieving performances.' });
    }
    if (results.length === 0) {
      return res.status(404).send({ error: 'No performances found for this event.' });
    }
    res.send(results);
  });
});

// 4) UPDATE Performance (PUT)
app.put('/api/performance/:performanceId', (req, res) => {
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

  db.query(
    query,
    [PerformanceDate, StartTime, EndTime, Band1, Band2, Band3, Space, performanceId],
    (err, result) => {
      if (err) {
        console.error('Update performance error:', err);
        return res.status(500).send({ error: 'Database error while updating performance.' });
      }
      res.send({ message: 'Performance updated successfully' });
    }
  );
});

// -----------------------------
// Start the server
// -----------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
