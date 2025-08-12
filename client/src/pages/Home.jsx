import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  HelpCircle, 
  Brain, 
  Zap, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Target,
  Users,
  BarChart3
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Convert natural language descriptions into professional BPMN diagrams using advanced AI'
    },
    {
      icon: Target,
      title: 'Industry-Specific Optimization',
      description: 'Get tailored process improvements for Manufacturing, Healthcare, and Finance sectors'
    },
    {
      icon: Users,
      title: 'Collaborative Editing',
      description: 'Interactive diagram editor with real-time collaboration capabilities'
    },
    {
      icon: BarChart3,
      title: 'Process Analytics',
      description: 'Analyze process complexity and get actionable insights for improvement'
    }
  ];

  const benefits = [
    'Reduce process mapping time by 80%',
    'Identify optimization opportunities automatically',
    'Ensure BPMN 2.0 compliance',
    'Export to multiple formats (PNG, SVG, XML)',
    'Industry-specific best practices included'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-purple-600/20 opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Brain className="h-20 w-20 text-primary-500 animate-pulse-soft" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Auto <span className="text-primary-500">BPMN</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              Transform your business processes into professional BPMN diagrams using AI. 
              Optimize workflows with intelligent recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link
                to="/text-input"
                className="btn-primary inline-flex items-center text-lg px-8 py-4 group"
              >
                <FileText className="mr-2 h-5 w-5" />
                Describe Your Process
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <Link
                to="/guided-builder"
                className="btn-outline inline-flex items-center text-lg px-8 py-4 group"
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                Guided Builder
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Auto BPMN?
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Leverage the power of AI to create, optimize, and manage your business processes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card-hover group text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Accelerate Your Process Optimization
              </h2>
              <p className="text-xl text-dark-300 mb-8">
                Our AI-powered platform helps organizations streamline their workflows 
                and achieve operational excellence through intelligent process design.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-dark-200">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm border border-primary-500/20">
                <div className="text-center">
                  <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-6 animate-bounce" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ready to Transform Your Processes?
                  </h3>
                  <p className="text-dark-300 mb-6">
                    Join thousands of organizations already using Auto BPMN to optimize their workflows.
                  </p>
                  <Link
                    to="/text-input"
                    className="btn-primary inline-flex items-center"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600/10 to-purple-600/10 border-t border-dark-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Building Better Processes Today
          </h2>
          <p className="text-xl text-dark-300 mb-8">
            Choose your preferred method to create professional BPMN diagrams in minutes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              to="/text-input"
              className="card-hover group p-8 text-left"
            >
              <FileText className="h-10 w-10 text-primary-500 mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Text Description
              </h3>
              <p className="text-dark-300">
                Simply describe your process in natural language and let AI create the diagram
              </p>
            </Link>
            
            <Link
              to="/guided-builder"
              className="card-hover group p-8 text-left"
            >
              <HelpCircle className="h-10 w-10 text-primary-500 mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Guided Questions
              </h3>
              <p className="text-dark-300">
                Answer structured questions to build comprehensive process diagrams
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
