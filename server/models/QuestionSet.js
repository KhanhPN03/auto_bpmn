const mongoose = require('mongoose');

const questionSetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bpmn', 'industry'],
    required: true
  },
  industry: {
    type: String,
    required: function() {
      return this.type === 'industry';
    }
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [{
    id: String,
    text: String,
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox'],
      default: 'text'
    },
    options: [String], // For select, radio, checkbox types
    required: {
      type: Boolean,
      default: true
    },
    category: String, // Group questions by category
    order: Number
  }],
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

questionSetSchema.index({ type: 1, industry: 1 });

module.exports = mongoose.model('QuestionSet', questionSetSchema);
