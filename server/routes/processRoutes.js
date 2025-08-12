const express = require('express');
const router = express.Router();
const {
  generateFromText,
  generateFromGuided,
  optimizeProcess,
  getProcess,
  updateProcess,
  deleteProcess,
  getAllProcesses
} = require('../controllers/processController');

// Generate BPMN from text description
router.post('/generate', generateFromText);

// Generate BPMN from guided questionnaire
router.post('/guided', generateFromGuided);

// Optimize existing process
router.post('/optimize', optimizeProcess);

// Get all processes (with pagination)
router.get('/', getAllProcesses);

// Get specific process
router.get('/:id', getProcess);

// Update process
router.put('/:id', updateProcess);

// Delete process
router.delete('/:id', deleteProcess);

module.exports = router;
