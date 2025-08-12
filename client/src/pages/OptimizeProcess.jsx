import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  Loader, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Target,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProcess, getIndustryQuestions, optimizeProcess } from '../services/api';

const OptimizeProcess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processId = searchParams.get('processId');
  
  const [process, setProcess] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const steps = [
    { id: 'process-review', title: 'Review Process', description: 'Confirm current process accuracy' },
    { id: 'optimization-goals', title: 'Optimization Goals', description: 'Define improvement objectives' },
    { id: 'optimization-result', title: 'Optimization Result', description: 'Review optimized process' }
  ];

  useEffect(() => {
    if (processId) {
      loadProcessAndQuestions();
    } else {
      toast.error('No process selected for optimization');
      navigate('/');
    }
  }, [processId]);

  const loadProcessAndQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Load process
      const processResponse = await getProcess(processId);
      if (!processResponse.success) {
        throw new Error('Process not found');
      }
      
      const processData = processResponse.data.process;
      setProcess(processData);
      
      // Load industry-specific optimization questions
      const questionsResponse = await getIndustryQuestions(processData.industry);
      if (questionsResponse.success) {
        setQuestions(questionsResponse.data.questionSet.questions || []);
      }
      
    } catch (error) {
      console.error('Error loading process and questions:', error);
      toast.error('Failed to load optimization data');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
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

  const handleOptimize = async () => {
    try {
      setIsOptimizing(true);
      
      const response = await optimizeProcess({
        processId: process._id,
        industry: process.industry,
        answers
      });
      
      if (response.success) {
        setOptimizationResult(response.data.optimization);
        setCurrentStep(2);
        toast.success('Process optimization completed!');
      } else {
        toast.error(response.message || 'Failed to optimize process');
      }
    } catch (error) {
      console.error('Error optimizing process:', error);
      toast.error('An error occurred during optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleViewOptimizedProcess = () => {
    navigate(`/process/${processId}`);
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
          <p className="text-dark-300">Loading optimization wizard...</p>
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
              <Zap className="h-10 w-10 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Process Optimization Assistant
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Let AI analyze and optimize your business process for better efficiency and performance.
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
          {/* Process Review */}
          {currentStep === 0 && process && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="mr-3 h-6 w-6 text-primary-500" />
                Review Your Current Process
              </h2>
              
              <div className="space-y-6">
                <div className="bg-dark-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {process.title}
                  </h3>
                  <p className="text-dark-300 mb-4">
                    {process.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-3 py-1 rounded-full ${
                      process.industry === 'manufacturing' ? 'bg-blue-600/20 text-blue-400' :
                      process.industry === 'healthcare' ? 'bg-green-600/20 text-green-400' :
                      process.industry === 'finance' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {process.industry}
                    </span>
                    
                    {process.metadata?.complexity && (
                      <span className="text-dark-400">
                        Complexity: {process.metadata.complexity}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-400 mb-2">
                    Please confirm this process is accurate before optimization
                  </h4>
                  <p className="text-dark-300 text-sm">
                    Make sure the current process description and diagram accurately represent 
                    your actual workflow. You can edit the process if needed before optimization.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => navigate(`/process/${processId}`)}
                  className="btn-outline"
                >
                  Edit Process First
                </button>
                
                <button
                  onClick={handleNext}
                  className="btn-primary inline-flex items-center"
                >
                  Process is Accurate
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Optimization Goals */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="mr-3 h-6 w-6 text-primary-500" />
                Define Optimization Goals
              </h2>
              
              <p className="text-dark-300 mb-8">
                Answer these questions to help the AI understand what aspects of your process 
                need improvement and what your optimization goals are.
              </p>
              
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-white mb-2">
                      {question.text}
                      {question.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
                
                {/* Default optimization questions */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What are your main optimization goals? *
                  </label>
                  <textarea
                    value={answers.optimization_goals || ''}
                    onChange={(e) => handleAnswerChange('optimization_goals', e.target.value)}
                    placeholder="e.g., Reduce processing time, improve accuracy, eliminate bottlenecks..."
                    className="textarea-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What current pain points or bottlenecks have you identified?
                  </label>
                  <textarea
                    value={answers.pain_points || ''}
                    onChange={(e) => handleAnswerChange('pain_points', e.target.value)}
                    placeholder="Describe any issues, delays, or inefficiencies you've noticed..."
                    className="textarea-field"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  className="btn-secondary inline-flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
                
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !answers.optimization_goals}
                  className="btn-primary inline-flex items-center text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOptimizing ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Optimizing Process...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Optimize Process
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Optimization Result */}
          {currentStep === 2 && optimizationResult && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <CheckCircle className="mr-3 h-6 w-6 text-green-500" />
                Optimization Complete!
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-3">
                    Optimization Summary
                  </h3>
                  <p className="text-dark-300">
                    {optimizationResult.summary}
                  </p>
                </div>
                
                <div className="bg-dark-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Changes Made
                  </h3>
                  <ul className="space-y-2">
                    {optimizationResult.changes.map((change, index) => (
                      <li key={index} className="flex items-start text-dark-300">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-primary-600/10 border border-primary-600/20 rounded-lg p-4">
                  <p className="text-primary-400 text-sm">
                    💡 The optimized BPMN diagram has been saved to your process. 
                    You can view it and make further adjustments as needed.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  className="btn-secondary inline-flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Goals
                </button>
                
                <button
                  onClick={handleViewOptimizedProcess}
                  className="btn-primary inline-flex items-center"
                >
                  View Optimized Process
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizeProcess;
