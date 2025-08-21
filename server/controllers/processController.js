const Process = require('../models/Process');
const aiService = require('../services/aiService');
const bpmnService = require('../services/bpmnService');
const Joi = require('joi');

// Validation schemas
const textGenerationSchema = Joi.object({
  description: Joi.string().required().min(10).max(5000),
  title: Joi.string().required().min(3).max(200),
  industry: Joi.string().valid('manufacturing', 'healthcare', 'finance', 'general').default('general')
});

const guidedGenerationSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  industry: Joi.string().valid('manufacturing', 'healthcare', 'finance', 'general').required(),
  answers: Joi.object().required()
});

const optimizationSchema = Joi.object({
  processId: Joi.string().required(),
  industry: Joi.string().valid('manufacturing', 'healthcare', 'finance', 'general').required(),
  answers: Joi.object().required()
});

// Generate BPMN from text description
const generateFromText = async (req, res) => {
  try {
    const { error, value } = textGenerationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { description, title, industry } = value;

    // Call AI service to generate BPMN
    const bpmnXml = await aiService.generateBpmnFromText(description, industry);

    // Validate and clean BPMN
    const validatedBpmn = await bpmnService.validateBpmn(bpmnXml);

    // Save to database
    const process = new Process({
      title,
      description,
      inputMethod: 'text',
      inputData: { description },
      bpmnXml: validatedBpmn,
      industry,
      metadata: {
        aiModel: 'openai-gpt',
        complexity: bpmnService.assessComplexity(validatedBpmn)
      }
    });

    await process.save();

    res.status(201).json({
      success: true,
      data: {
        process: {
          id: process._id,
          title: process.title,
          description: process.description,
          bpmnXml: process.bpmnXml,
          industry: process.industry,
          createdAt: process.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error generating BPMN from text:', error);
    
    // Specific error handling for rate limiting
    if (error.message.includes('rate limit') || error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'API rate limit exceeded. Please wait a moment and try again.',
        retryAfter: 60 // seconds
      });
    }
    
    // Handle API quota/billing issues
    if (error.response?.status === 402 || error.message.includes('quota')) {
      return res.status(402).json({
        success: false,
        message: 'API quota exceeded. Please check your OpenAI billing and usage.'
      });
    }
    
    // General server error
    res.status(500).json({
      success: false,
      message: 'Failed to generate BPMN diagram',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate BPMN from guided questionnaire
const generateFromGuided = async (req, res) => {
  try {
    const { error, value } = guidedGenerationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, industry, answers } = value;

    // Convert answers to structured description
    const structuredDescription = bpmnService.answersToDescription(answers);

    // Call AI service to generate BPMN
    const bpmnXml = await aiService.generateBpmnFromStructured(structuredDescription, industry, answers);

    // Validate and clean BPMN
    const validatedBpmn = await bpmnService.validateBpmn(bpmnXml);

    // Save to database
    const process = new Process({
      title,
      description: structuredDescription,
      inputMethod: 'guided',
      inputData: { answers },
      bpmnXml: validatedBpmn,
      industry,
      metadata: {
        aiModel: 'openai-gpt',
        complexity: bpmnService.assessComplexity(validatedBpmn)
      }
    });

    await process.save();

    res.status(201).json({
      success: true,
      data: {
        process: {
          id: process._id,
          title: process.title,
          description: process.description,
          bpmnXml: process.bpmnXml,
          industry: process.industry,
          createdAt: process.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error generating BPMN from guided input:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate BPMN diagram',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optimize existing process
const optimizeProcess = async (req, res) => {
  try {
    const { error, value } = optimizationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { processId, industry, answers } = value;

    // Get existing process
    const process = await Process.findById(processId);
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    // Call AI service to optimize BPMN
    const optimization = await aiService.optimizeBpmn(process.bpmnXml, industry, answers);

    // Validate optimized BPMN
    const validatedBpmn = await bpmnService.validateBpmn(optimization.bpmnXml);

    // Add optimization to process
    process.optimizations.push({
      version: process.optimizations.length + 1,
      changes: optimization.changes,
      bpmnXml: validatedBpmn,
      createdAt: new Date()
    });

    process.isOptimized = true;
    await process.save();

    res.json({
      success: true,
      data: {
        optimization: {
          version: process.optimizations.length,
          bpmnXml: validatedBpmn,
          changes: optimization.changes,
          summary: optimization.summary
        }
      }
    });

  } catch (error) {
    console.error('Error optimizing process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize process',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get specific process
const getProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    res.json({
      success: true,
      data: { process }
    });

  } catch (error) {
    console.error('Error fetching process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch process'
    });
  }
};

// Update process
const updateProcess = async (req, res) => {
  try {
    const { title, description, bpmnXml, tags } = req.body;
    
    const process = await Process.findById(req.params.id);
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    // Update fields if provided
    if (title) process.title = title;
    if (description) process.description = description;
    if (bpmnXml) {
      const validatedBpmn = await bpmnService.validateBpmn(bpmnXml);
      process.bpmnXml = validatedBpmn;
    }
    if (tags) process.tags = tags;

    await process.save();

    res.json({
      success: true,
      data: { process }
    });

  } catch (error) {
    console.error('Error updating process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update process'
    });
  }
};

// Delete process
const deleteProcess = async (req, res) => {
  try {
    const process = await Process.findByIdAndDelete(req.params.id);
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    res.json({
      success: true,
      message: 'Process deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete process'
    });
  }
};

// Get all processes with pagination
const getAllProcesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const processes = await Process.find()
      .select('title description industry isOptimized createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Process.countDocuments();

    res.json({
      success: true,
      data: {
        processes,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching processes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch processes'
    });
  }
};

module.exports = {
  generateFromText,
  generateFromGuided,
  optimizeProcess,
  getProcess,
  updateProcess,
  deleteProcess,
  getAllProcesses
};
