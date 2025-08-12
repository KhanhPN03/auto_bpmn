import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateFromText } from '../services/api';

const TextInput = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);

  const industries = [
    { value: 'general', label: 'General Business Process' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.description.length < 10) {
      toast.error('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await generateFromText(formData);
      
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
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exampleDescriptions = [
    {
      title: 'Customer Order Processing',
      description: 'When a customer places an order, we need to verify payment, check inventory, process the order, ship the product, and send confirmation to the customer.',
      industry: 'general'
    },
    {
      title: 'Patient Admission Process',
      description: 'Patient arrives at hospital, checks in at reception, insurance verification, medical history review, room assignment, and admission completion with documentation.',
      industry: 'healthcare'
    },
    {
      title: 'Loan Approval Process',
      description: 'Customer submits loan application, credit check is performed, income verification, risk assessment, manager approval for high amounts, and loan disbursement.',
      industry: 'finance'
    }
  ];

  const loadExample = (example) => {
    setFormData(example);
    toast.success('Example loaded! Feel free to modify and generate.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600/20 p-4 rounded-full">
              <FileText className="h-10 w-10 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Describe Your Process
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Simply describe your business process in natural language, and our AI will transform it into a professional BPMN diagram.
          </p>
        </div>

        {/* Main Form */}
        <div className="card max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Process Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Process Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Customer Order Processing"
                className="input-field"
                required
              />
            </div>

            {/* Industry Selection */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-white mb-2">
                Industry Context
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="input-field"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-dark-400 mt-1">
                Select the industry for more relevant optimization suggestions
              </p>
            </div>

            {/* Process Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Process Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your process step by step. Include triggers, main activities, decision points, participants, and outcomes. The more detail you provide, the better the resulting BPMN diagram will be."
                className="textarea-field min-h-[200px]"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-dark-400">
                  Minimum 10 characters required
                </p>
                <span className="text-sm text-dark-400">
                  {formData.description.length} characters
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary inline-flex items-center text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Generating BPMN...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate BPMN Diagram
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Example Processes */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Need Inspiration? Try These Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exampleDescriptions.map((example, index) => (
              <div
                key={index}
                className="card-hover group cursor-pointer"
                onClick={() => loadExample(example)}
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-400 text-xs font-medium rounded-full">
                    {industries.find(ind => ind.value === example.industry)?.label}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-200">
                  {example.title}
                </h3>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">
                  {example.description.substring(0, 120)}...
                </p>
                <div className="flex items-center text-primary-400 text-sm font-medium">
                  <span>Load this example</span>
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-16 bg-dark-800/50 rounded-xl p-6 border border-dark-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
            Tips for Better Results
          </h3>
          <ul className="space-y-2 text-dark-300">
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Include clear start and end conditions for your process</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Mention decision points and different paths the process can take</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Specify who is responsible for each step (roles/departments)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Include any systems, tools, or documents involved</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Describe what happens when things go wrong (error handling)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextInput;
