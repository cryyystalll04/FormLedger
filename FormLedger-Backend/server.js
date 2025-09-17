const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Import the auth middleware
const authMiddleware = require('./middleware/auth');

// A simple test route
app.get('/', (req, res) => {
  res.send('FormLedger backend is running!');
});

// User Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, username, password, role FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- PASTE THE NEW CODE FOR FORM CREATION HERE ---
// Protected route to create a new form
app.post('/api/forms', authMiddleware, async (req, res) => {
  const { name, form_schema } = req.body;

  // Check if the user is an admin
  if (req.userData.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  // Basic validation
  if (!name || !form_schema) {
    return res.status(400).json({ message: 'Form name and schema are required' });
  }

  try {
    const formId = name.toLowerCase().replace(/\s/g, '-'); // Generate a URL-friendly ID
    const [result] = await db.query(
      'INSERT INTO forms (id, name, form_schema) VALUES (?, ?, ?)',
      [formId, name, JSON.stringify(form_schema)]
    );

    res.status(201).json({ message: 'Form created successfully', formId: formId });
  } catch (error) {
    console.error('Error creating form:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A form with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to list all forms with submission counts
// Endpoint to list all forms for the dashboard
app.get('/api/forms', authMiddleware, async (req, res) => {
  const isAdmin = req.userData.role === 'admin';
  
  try {
    const [forms] = await db.query('SELECT id, name FROM forms');

    if (isAdmin) {
      // If admin, return forms with submission counts
      const formsWithCounts = await Promise.all(
        forms.map(async (form) => {
          const [countResult] = await db.query('SELECT COUNT(*) as count FROM submissions WHERE formId = ?', [form.id]);
          return {
            ...form,
            submissionCount: countResult[0].count,
          };
        })
      );
      return res.status(200).json(formsWithCounts);
    } else {
      // If normal user, just return the forms
      return res.status(200).json(forms);
    }
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to fetch a single form schema
app.get('/api/forms/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id, name, form_schema FROM forms WHERE id = ?',
      [id]
    );

    const form = rows[0];
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Server error' });
  }
}); 

// Endpoint to save a form submission
app.post('/api/forms/:id/submit', authMiddleware, async (req, res) => {
  const { id } = req.params; // formId from URL
  const { form_values } = req.body;
  const userId = req.userData.userId; // userId from auth middleware

  if (!form_values) {
    return res.status(400).json({ message: 'Form values are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO submissions (formId, userId, form_values) VALUES (?, ?, ?)',
      [id, userId, JSON.stringify(form_values)]
    );

    res.status(201).json({ message: 'Submission saved successfully', submissionId: result.insertId });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to list all submissions for a specific form
app.get('/api/forms/:id/submissions', authMiddleware, async (req, res) => {
  const { id } = req.params; // formId from URL

  // Check if the user is an admin
  if (req.userData.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
        s.id AS submissionId,
        s.userId,
        u.username,
        u.email,
        s.form_values,
        s.submittedAt,
        s.status
      FROM submissions s
      JOIN users u ON s.userId = u.id
      WHERE s.formId = ?`,
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT endpoint to update a specific submission
app.put('/api/submissions/:id', authMiddleware, async (req, res) => {
    // Check if the user is an admin
    if (req.userData.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const submissionId = req.params.id;
    const { form_values, status } = req.body;

    if (!form_values) {
        return res.status(400).json({ message: 'Form values are required.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE submissions SET form_values = ?, status = ?, submittedAt = ? WHERE id = ?',
            [JSON.stringify(form_values), status, new Date(), submissionId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        res.status(200).json({ message: 'Submission updated successfully.' });
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
// ----------------------------------------------------

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});