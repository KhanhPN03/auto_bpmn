const QuestionSet = require('../models/QuestionSet');

// Get BPMN building questions
const getBpmnQuestions = async (req, res) => {
  try {
    console.log('📝 Fetching BPMN questions...');
    
    let questionSet = await QuestionSet.findOne({ 
      type: 'bpmn', 
      isActive: true 
    }).sort({ version: -1 });

    if (!questionSet) {
      console.log('📝 No BPMN questions found, creating default set...');
      // Create default BPMN question set if none exists
      questionSet = await createDefaultBpmnQuestions();
    }

    console.log('✅ BPMN questions loaded:', questionSet ? questionSet.questions.length : 0, 'questions');

    res.json({
      success: true,
      data: { questionSet }
    });

  } catch (error) {
    console.error('❌ Error fetching BPMN questions:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BPMN questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get industry-specific questions
const getIndustryQuestions = async (req, res) => {
  try {
    const { industry } = req.params;
    console.log(`📝 Fetching questions for industry: ${industry}`);
    
    let questionSet = await QuestionSet.findOne({ 
      type: 'industry', 
      industry: industry.toLowerCase(),
      isActive: true 
    }).sort({ version: -1 });

    if (!questionSet) {
      console.log(`📝 No ${industry} questions found, creating default set...`);
      // Create default industry question set if none exists
      questionSet = await createDefaultIndustryQuestions(industry.toLowerCase());
    }

    console.log(`✅ ${industry} questions loaded:`, questionSet ? questionSet.questions.length : 0, 'questions');

    res.json({
      success: true,
      data: { questionSet }
    });

  } catch (error) {
    console.error(`❌ Error fetching ${req.params.industry} questions:`, error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.industry} questions`,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all question sets
const getAllQuestionSets = async (req, res) => {
  try {
    const questionSets = await QuestionSet.find({ isActive: true })
      .select('type industry title description version')
      .sort({ type: 1, industry: 1, version: -1 });

    res.json({
      success: true,
      data: { questionSets }
    });

  } catch (error) {
    console.error('Error fetching question sets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question sets'
    });
  }
};

// Create new question set
const createQuestionSet = async (req, res) => {
  try {
    const questionSet = new QuestionSet(req.body);
    await questionSet.save();

    res.status(201).json({
      success: true,
      data: { questionSet }
    });

  } catch (error) {
    console.error('Error creating question set:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question set'
    });
  }
};

// Helper function to create default BPMN questions
const createDefaultBpmnQuestions = async () => {
  const bpmnQuestions = new QuestionSet({
    type: 'bpmn',
    title: 'BPMN Process Builder',
    description: 'General questions to understand and build your business process',
    questions: [
      {
        id: 'process_name',
        text: 'What is the name of your process?',
        type: 'text',
        required: true,
        category: 'basic',
        order: 1
      },
      {
        id: 'process_purpose',
        text: 'What is the main purpose or goal of this process?',
        type: 'textarea',
        required: true,
        category: 'basic',
        order: 2
      },
      {
        id: 'process_trigger',
        text: 'What triggers the start of this process?',
        type: 'textarea',
        required: true,
        category: 'flow',
        order: 3
      },
      {
        id: 'main_steps',
        text: 'What are the main steps in this process? (List them in order)',
        type: 'textarea',
        required: true,
        category: 'flow',
        order: 4
      },
      {
        id: 'decision_points',
        text: 'Are there any decision points or conditions in your process?',
        type: 'textarea',
        required: false,
        category: 'flow',
        order: 5
      },
      {
        id: 'participants',
        text: 'Who are the people or roles involved in this process?',
        type: 'textarea',
        required: true,
        category: 'participants',
        order: 6
      },
      {
        id: 'systems_used',
        text: 'What systems, tools, or applications are used in this process?',
        type: 'textarea',
        required: false,
        category: 'resources',
        order: 7
      },
      {
        id: 'documents_data',
        text: 'What documents or data are involved in this process?',
        type: 'textarea',
        required: false,
        category: 'resources',
        order: 8
      },
      {
        id: 'process_output',
        text: 'What is the expected output or result of this process?',
        type: 'textarea',
        required: true,
        category: 'outcomes',
        order: 9
      },
      {
        id: 'success_criteria',
        text: 'How do you know when this process has been completed successfully?',
        type: 'textarea',
        required: false,
        category: 'outcomes',
        order: 10
      }
    ]
  });

  await bpmnQuestions.save();
  return bpmnQuestions;
};

// Helper function to create default industry questions
const createDefaultIndustryQuestions = async (industry) => {
  const industryQuestionSets = {
    manufacturing: {
      title: 'Manufacturing Process Optimization',
      description: 'Questions specific to manufacturing and production processes',
      questions: [
        {
          id: 'production_type',
          text: 'What type of production process is this?',
          type: 'select',
          options: ['Assembly Line', 'Batch Production', 'Continuous Process', 'Job Shop', 'Lean Manufacturing'],
          required: true,
          category: 'production',
          order: 1
        },
        {
          id: 'quality_checkpoints',
          text: 'Where are quality control checkpoints in your process?',
          type: 'textarea',
          required: true,
          category: 'quality',
          order: 2
        },
        {
          id: 'equipment_dependencies',
          text: 'What equipment or machinery is critical to this process?',
          type: 'textarea',
          required: true,
          category: 'resources',
          order: 3
        },
        {
          id: 'safety_requirements',
          text: 'What safety procedures or requirements must be followed?',
          type: 'textarea',
          required: true,
          category: 'safety',
          order: 4
        },
        {
          id: 'inventory_materials',
          text: 'What raw materials or inventory items are needed?',
          type: 'textarea',
          required: true,
          category: 'inventory',
          order: 5
        },
        {
          id: 'cycle_time',
          text: 'What is the typical cycle time for this process?',
          type: 'text',
          required: false,
          category: 'metrics',
          order: 6
        },
        {
          id: 'bottlenecks',
          text: 'What are the current bottlenecks or pain points?',
          type: 'textarea',
          required: false,
          category: 'optimization',
          order: 7
        }
      ]
    },
    healthcare: {
      title: 'Healthcare Process Optimization',
      description: 'Questions specific to healthcare and medical processes',
      questions: [
        {
          id: 'care_type',
          text: 'What type of healthcare process is this?',
          type: 'select',
          options: ['Patient Care', 'Diagnostic', 'Treatment', 'Administrative', 'Emergency', 'Preventive'],
          required: true,
          category: 'care',
          order: 1
        },
        {
          id: 'patient_safety',
          text: 'What patient safety measures are critical in this process?',
          type: 'textarea',
          required: true,
          category: 'safety',
          order: 2
        },
        {
          id: 'clinical_protocols',
          text: 'What clinical protocols or guidelines must be followed?',
          type: 'textarea',
          required: true,
          category: 'compliance',
          order: 3
        },
        {
          id: 'healthcare_providers',
          text: 'Which healthcare providers or specialists are involved?',
          type: 'textarea',
          required: true,
          category: 'participants',
          order: 4
        },
        {
          id: 'medical_equipment',
          text: 'What medical equipment or devices are required?',
          type: 'textarea',
          required: false,
          category: 'resources',
          order: 5
        },
        {
          id: 'documentation_required',
          text: 'What documentation or records must be maintained?',
          type: 'textarea',
          required: true,
          category: 'documentation',
          order: 6
        },
        {
          id: 'patient_outcomes',
          text: 'What are the desired patient outcomes or success metrics?',
          type: 'textarea',
          required: true,
          category: 'outcomes',
          order: 7
        }
      ]
    },
    finance: {
      title: 'Financial Process Optimization',
      description: 'Questions specific to financial and banking processes',
      questions: [
        {
          id: 'financial_process_type',
          text: 'What type of financial process is this?',
          type: 'select',
          options: ['Loan Processing', 'Risk Assessment', 'Compliance Check', 'Investment Analysis', 'Payment Processing', 'Audit'],
          required: true,
          category: 'process_type',
          order: 1
        },
        {
          id: 'regulatory_requirements',
          text: 'What regulatory requirements or compliance standards apply?',
          type: 'textarea',
          required: true,
          category: 'compliance',
          order: 2
        },
        {
          id: 'approval_levels',
          text: 'What are the different approval levels or authorization requirements?',
          type: 'textarea',
          required: true,
          category: 'approvals',
          order: 3
        },
        {
          id: 'risk_factors',
          text: 'What risk factors need to be evaluated in this process?',
          type: 'textarea',
          required: true,
          category: 'risk',
          order: 4
        },
        {
          id: 'financial_data',
          text: 'What financial data or documentation is required?',
          type: 'textarea',
          required: true,
          category: 'data',
          order: 5
        },
        {
          id: 'processing_time',
          text: 'What is the target processing time for this process?',
          type: 'text',
          required: false,
          category: 'metrics',
          order: 6
        },
        {
          id: 'escalation_procedures',
          text: 'What are the escalation procedures for exceptions or issues?',
          type: 'textarea',
          required: false,
          category: 'exceptions',
          order: 7
        }
      ]
    },
    general: {
      title: 'General Process Optimization',
      description: 'Universal questions to optimize any business process',
      questions: [
        {
          id: 'current_challenges',
          text: 'What are the main challenges or pain points in your current process?',
          type: 'textarea',
          required: true,
          category: 'analysis',
          order: 1
        },
        {
          id: 'performance_metrics',
          text: 'How do you currently measure the success of this process?',
          type: 'textarea',
          required: false,
          category: 'metrics',
          order: 2
        },
        {
          id: 'bottlenecks',
          text: 'Where do you see bottlenecks or delays occurring?',
          type: 'textarea',
          required: false,
          category: 'analysis',
          order: 3
        },
        {
          id: 'automation_opportunities',
          text: 'Which steps could potentially be automated or streamlined?',
          type: 'textarea',
          required: false,
          category: 'optimization',
          order: 4
        },
        {
          id: 'stakeholder_feedback',
          text: 'What feedback have you received from users or stakeholders about this process?',
          type: 'textarea',
          required: false,
          category: 'feedback',
          order: 5
        },
        {
          id: 'ideal_outcome',
          text: 'What would an ideal, optimized version of this process look like?',
          type: 'textarea',
          required: false,
          category: 'optimization',
          order: 6
        }
      ]
    }
  };

  const industryData = industryQuestionSets[industry];
  if (!industryData) {
    throw new Error(`No question set available for industry: ${industry}`);
  }

  const questionSet = new QuestionSet({
    type: 'industry',
    industry,
    title: industryData.title,
    description: industryData.description,
    questions: industryData.questions
  });

  await questionSet.save();
  return questionSet;
};

module.exports = {
  getBpmnQuestions,
  getIndustryQuestions,
  getAllQuestionSets,
  createQuestionSet
};
