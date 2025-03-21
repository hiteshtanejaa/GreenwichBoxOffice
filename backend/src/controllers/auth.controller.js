// src/controllers/auth.controller.js
class AuthController {
    constructor(db) {
      this.db = db;
      
      this.register = this.register.bind(this);
      this.login = this.login.bind(this);
    }
  
    /**
     * Register a new user
     * - Expects in req.body: Name, EmailID, PhoneNumber, PostCode, Address, CustomerType, Username, Password, (optional) role
     * - role defaults to 'user' if not provided
     */
    async register(req, res) {
      const {
        Name,
        EmailID,
        PhoneNumber,
        PostCode,
        Address,
        CustomerType,
        Username,
        Password,
        role = 'user', // default to 'user' if not specified
      } = req.body;
  
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
  
        // 2) Insert into User table (including role)
        const userQuery = `
          INSERT INTO User (Name, EmailID, PhoneNumber, PostCode, Address, CustomerType, role)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        this.db.query(
          userQuery,
          [Name, EmailID, PhoneNumber, PostCode, Address, CustomerType, role],
          (err, userResult) => {
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
                role: role,
              });
            });
          }
        );
      });
    }
  
    /**
     * Login
     * - Expects in req.body: Username, Password
     * - Returns userId, name, isAdmin (if role === 'admin')
     */
    async login(req, res) {
      const { Username, Password } = req.body;
      const query = `
        SELECT UserLogin.*, User.Name, User.role
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
  
        // Determine if admin
        const isAdmin = (userLoginRow.role === 'admin');
  
        res.json({
          message: 'Login successful',
          userId: userLoginRow.UserID,
          name: userLoginRow.Name,
          isAdmin: isAdmin,
        });
      });
    }
  }
  
  module.exports = AuthController;
  