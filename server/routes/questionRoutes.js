const express = require('express');
const router = express.Router();
const {
  getBpmnQuestions,
  getIndustryQuestions,
  getAllQuestionSets,
  createQuestionSet
} = require('../controllers/questionController');

// Get BPMN building questions
router.get('/bpmn', getBpmnQuestions);

// Get industry-specific questions
router.get('/industry/:industry', getIndustryQuestions);

// Get all question sets
router.get('/', getAllQuestionSets);

// Create new question set (admin)
router.post('/', createQuestionSet);

module.exports = router;
