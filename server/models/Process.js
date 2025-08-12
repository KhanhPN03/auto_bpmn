const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  inputMethod: {
    type: String,
    enum: ['text', 'guided'],
    required: true
  },
  inputData: {
    // For text method: stores the original text
    // For guided method: stores questionnaire answers
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  bpmnXml: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    enum: ['manufacturing', 'healthcare', 'finance', 'general'],
    default: 'general'
  },
  optimizations: [{
    version: Number,
    changes: [String],
    bpmnXml: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isOptimized: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'anonymous'
  },
  tags: [String],
  metadata: {
    aiModel: String,
    processingTime: Number,
    complexity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
processSchema.index({ title: 'text', description: 'text' });
processSchema.index({ industry: 1 });
processSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Process', processSchema);
