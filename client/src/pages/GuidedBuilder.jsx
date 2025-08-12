import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowRight, Loader, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBpmnQuestions, getIndustryQuestions, generateFromGuided } from '../services/api';

const GuidedBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('general');

  const industries = [
    { value: 'general', label: 'General Business Process', description: 'Standard business processes' },
    { value: 'manufacturing', label: 'Manufacturing', description: 'Production and manufacturing workflows' },
    { value: 'healthcare', label: 'Healthcare', description: 'Medical and patient care processes' },
    { value: 'finance', label: 'Finance', description: 'Financial and banking processes' }
  ];

  const steps = [
    { id: 'industry', title: 'Select Industry', description: 'Choose your industry for tailored questions' },
    { id: 'basic', title: 'Basic Information', description: 'Core process details' },
    { id: 'industry-specific', title: 'Industry Details', description: 'Specialized questions for your industry' },
    { id: 'review', title: 'Review & Generate', description: 'Review answers and generate BPMN' }
  ];

  useEffect(() => {
    loadInitialQuestions();
  }, []);

  const loadInitialQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await getBpmnQuestions();
      if (response.success) {
        setQuestions(response.data.questionSet.questions || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndustryQuestions = async (industry) => {
    try {
      setIsLoading(true);
      const response = await getIndustryQuestions(industry);
      if (response.success) {
        const industryQuestions = response.data.questionSet.questions || [];
        setQuestions(prev => [...prev, ...industryQuestions]);
      }
    } catch (error) {
      console.error('Error loading industry questions:', error);
      toast.error('Failed to load industry-specific questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndustrySelect = async (industry) => {
    setSelectedIndustry(industry);
    setAnswers(prev => ({ ...prev, industry }));
    
    if (industry !== 'general') {
      await loadIndustryQuestions(industry);
    }
    
    setCurrentStep(1);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getFilteredQuestions = () => {
    if (currentStep === 1) {
      return questions.filter(q => q.category === 'basic' || !q.category);
    } else if (currentStep === 2) {
      return questions.filter(q => 
        q.category !== 'basic' && 
        q.category !== 'outcomes' && 
        q.category
      );
    }
    return [];
  };

  const isStepComplete = (stepIndex) => {
    if (stepIndex === 0) return selectedIndustry;
    if (stepIndex === 1) {
      const basicQuestions = questions.filter(q => q.category === 'basic' || !q.category);
      return basicQuestions.every(q => !q.required || answers[q.id]);
    }
    if (stepIndex === 2) {
      const industryQuestions = questions.filter(q => 
        q.category !== 'basic' && 
        q.category !== 'outcomes' && 
        q.category
      );
      return industryQuestions.every(q => !q.required || answers[q.id]);
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    const title = answers.process_name || 'Guided Process';
    
    if (!title.trim()) {
      toast.error('Process name is required');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await generateFromGuided({
        title,
        industry: selectedIndustry,
        answers
      });
      
      if (response.success) {
        toast.success('BPMN diagram generated successfully!');
        navigate(`/process/${response.data.process.id}`);
      } else {
        toast.error(response.message || 'Failed to generate BPMN diagram');
      }
    } catch (error) {
      console.error('Error generating BPMN:', error);
      toast.error('An error occurred while generating the diagram');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestion = (question) => {
    const value = answers[question.id] || '';

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="textarea-field"
            required={question.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="input-field"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                  required={question.required}
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="input-field"
            required={question.required}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-300">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600/20 p-4 rounded-full">
              <HelpCircle className="h-10 w-10 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Guided BPMN Builder
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Answer step-by-step questions to build a comprehensive BPMN diagram tailored to your industry.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index < currentStep ? 'bg-primary-600 border-primary-600' :
                  index === currentStep ? 'border-primary-600 text-primary-600' :
                  'border-dark-600 text-dark-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-dark-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center" style={{ width: `${100 / steps.length}%` }}>
                <p className={`text-sm font-medium ${
                  index <= currentStep ? 'text-white' : 'text-dark-400'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs ${
                  index <= currentStep ? 'text-dark-300' : 'text-dark-500'
                }`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="card max-w-3xl mx-auto">
          {/* Industry Selection */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Select Your Industry
              </h2>
              <p className="text-dark-300 mb-8">
                Choose the industry that best matches your process for more relevant questions and optimization suggestions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industries.map((industry) => (
                  <button
                    key={industry.value}
                    onClick={() => handleIndustrySelect(industry.value)}
                    className={`p-6 rounded-lg border-2 text-left transition-colors duration-200 ${
                      selectedIndustry === industry.value
                        ? 'border-primary-600 bg-primary-600/10'
                        : 'border-dark-600 hover:border-primary-600/50'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {industry.label}
                    </h3>
                    <p className="text-dark-300 text-sm">
                      {industry.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          {(currentStep === 1 || currentStep === 2) && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                {currentStep === 1 ? 'Basic Process Information' : 'Industry-Specific Details'}
              </h2>
              
              <div className="space-y-6">
                {getFilteredQuestions().map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-white mb-2">
                      {question.text}
                      {question.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="btn-secondary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep)}
                  className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Review and Generate */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Review Your Answers
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Industry</h3>
                  <p className="text-dark-300">
                    {industries.find(ind => ind.value === selectedIndustry)?.label}
                  </p>
                </div>
                
                {Object.entries(answers).map(([key, value]) => {
                  const question = questions.find(q => q.id === key);
                  if (!question || !value) return null;
                  
                  return (
                    <div key={key} className="bg-dark-700/50 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-2">
                        {question.text}
                      </h3>
                      <p className="text-dark-300">
                        {typeof value === 'string' && value.length > 100 
                          ? `${value.substring(0, 100)}...`
                          : value
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  className="btn-secondary inline-flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary inline-flex items-center text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Generating BPMN...
                    </>
                  ) : (
                    <>
                      Generate BPMN Diagram
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedBuilder;
