const express = require('express');
const router = express.Router();

// Simple auth route for future expansion
router.post('/guest', (req, res) => {
  res.json({
    success: true,
    message: 'Guest session created',
    sessionId: 'guest_' + Date.now()
  });
});

module.exports = router;
