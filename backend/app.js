const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Base routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Project routes
// ... your existing project routes

// Import email functionality
const { createProjectEmail, sendProjectEmail, ingestEmails } = require('./mailer');

// Create and return new project-specific Gmail account
app.post('/email/create', async (req, res) => {
  try {
    const { userName, password } = req.body;
    
    if (!userName || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userName and password' 
      });
    }
    
    const result = await createProjectEmail(userName, password);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating email account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send from project mailbox
app.post('/email/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and body' 
      });
    }
    
    await sendProjectEmail(to, subject, body);
    res.json({
      success: true,
      message: `Email sent to ${to}`
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ingest & analyze incoming mail
app.post('/email/ingest', async (req, res) => {
  try {
    await ingestEmails();
    res.json({
      success: true,
      message: 'Emails ingested and analyzed successfully'
    });
  } catch (error) {
    console.error('Error ingesting emails:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
