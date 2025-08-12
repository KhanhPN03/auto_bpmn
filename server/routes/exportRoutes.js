const express = require('express');
const router = express.Router();
const {
  exportAsPng,
  exportAsSvg,
  exportAsXml
} = require('../controllers/exportController');

// Export as PNG
router.post('/png', exportAsPng);

// Export as SVG
router.post('/svg', exportAsSvg);

// Export as XML
router.post('/xml', exportAsXml);

module.exports = router;
