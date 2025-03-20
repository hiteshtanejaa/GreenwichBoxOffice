// src/controllers/auth.controller.js
class AuthController {
    constructor(db) {
      this.db = db;
      // Bind methods if you plan to use them as callbacks
      this.register = this.register.bind(this);
      this.login = this.login.bind(this);
    }
  
    async register(req, res) {
      const { Name, EmailID, PhoneNumber, PostCode, Address, CustomerType, Username, Password } = req.body;
  
      // 1) Check if username already exists
      const checkQuery = `SELECT * FROM UserLogin WHERE Username = ?`;
      this.db.query(checkQuery, [Username], (err, results) => {
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
        this.db.query(userQuery, [Name, EmailID, PhoneNumber, PostCode, Address, CustomerType], (err, userResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error inserting user.' });
          }
          const newUserId = userResult.insertId;
  
          // 3) Insert into UserLogin table
          const loginQuery = `
            INSERT INTO UserLogin (UserID, Username, PasswordHash)
            VALUES (?, ?, ?)
          `;
          this.db.query(loginQuery, [newUserId, Username, Password], (err) => {
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
    }
  
    async login(req, res) {
      const { Username, Password } = req.body;
      const query = `
        SELECT UserLogin.*, User.Name
        FROM UserLogin
        JOIN User ON UserLogin.UserID = User.UserID
        WHERE Username = ?
      `;
      this.db.query(query, [Username], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error during login.' });
        }
        if (results.length === 0) {
          return res.status(400).json({ error: 'Invalid username or password.' });
        }
        const userLoginRow = results[0];
        // Compare password
        if (userLoginRow.PasswordHash !== Password) {
          return res.status(400).json({ error: 'Invalid username or password.' });
        }
        res.json({
          message: 'Login successful',
          userId: userLoginRow.UserID,
          name: userLoginRow.Name,
        });
      });
    }
  }
  
  module.exports = AuthController;
  