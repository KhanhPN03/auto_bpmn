import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Download, 
  Zap, 
  Eye, 
  Save, 
  ArrowLeft, 
  Loader,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import BpmnViewer from '../components/BpmnViewer';
import { getProcess, updateProcess, exportAsXml } from '../services/api';

const ProcessViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const bpmnViewerRef = useRef();

  useEffect(() => {
    if (id) {
      loadProcess();
    }
  }, [id]);

  const loadProcess = async () => {
    try {
      setIsLoading(true);
      const response = await getProcess(id);
      
      if (response.success) {
        setProcess(response.data.process);
        setEditedTitle(response.data.process.title);
        setEditedDescription(response.data.process.description);
      } else {
        toast.error('Process not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading process:', error);
      toast.error('Failed to load process');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData = {
        title: editedTitle,
        description: editedDescription,
      };

      const response = await updateProcess(id, updateData);
      
      if (response.success) {
        setProcess(response.data.process);
        setIsEditing(false);
        toast.success('Process updated successfully');
      } else {
        toast.error('Failed to update process');
      }
    } catch (error) {
      console.error('Error updating process:', error);
      toast.error('Failed to update process');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format) => {
    try {
      if (!process) return;
      
      if (format === 'xml') {
        const response = await exportAsXml({ 
          processId: process._id, 
          bpmnXml: process.bpmnXml 
        });
        
        // Create download link
        const blob = new Blob([response], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${process.title.replace(/\s+/g, '_')}.bpmn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('BPMN XML exported successfully');
      } else {
        // For PNG/SVG, use the viewer's export functionality
        if (bpmnViewerRef.current) {
          bpmnViewerRef.current.exportDiagram(format);
        }
      }
    } catch (error) {
      console.error('Error exporting process:', error);
      toast.error('Failed to export process');
    }
  };

  const handleOptimize = () => {
    navigate(`/optimize?processId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-300">Loading process...</p>
        </div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Process not found</p>
          <p className="text-dark-300 mb-6">The process you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-dark-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="input-field text-2xl font-bold bg-transparent border-0 border-b-2 border-primary-500 focus:ring-0"
                    placeholder="Process Title"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{process.title}</h1>
                )}
                
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    process.industry === 'manufacturing' ? 'bg-blue-600/20 text-blue-400' :
                    process.industry === 'healthcare' ? 'bg-green-600/20 text-green-400' :
                    process.industry === 'finance' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {process.industry}
                  </span>
                  
                  {process.isOptimized && (
                    <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-medium">
                      Optimized
                    </span>
                  )}
                  
                  <span className="text-sm text-dark-400">
                    Created {new Date(process.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(process.title);
                      setEditedDescription(process.description);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary inline-flex items-center"
                  >
                    {isSaving ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary inline-flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                  
                  <div className="relative inline-block text-left">
                    <button className="btn-secondary inline-flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </button>
                    <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleExport('png')}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-dark-700"
                      >
                        Export as PNG
                      </button>
                      <button
                        onClick={() => handleExport('svg')}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-dark-700"
                      >
                        Export as SVG
                      </button>
                      <button
                        onClick={() => handleExport('xml')}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-dark-700"
                      >
                        Export as XML
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleOptimize}
                    className="btn-primary inline-flex items-center"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Optimize Process
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="textarea-field w-full"
                placeholder="Process description"
                rows={3}
              />
            ) : (
              <p className="text-dark-300 max-w-4xl">
                {process.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BPMN Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="bg-dark-700 px-6 py-4 border-b border-dark-600">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                BPMN Diagram
              </h2>
              
              {process.metadata && (
                <div className="flex items-center space-x-4 text-sm text-dark-400">
                  <span>
                    Complexity: {process.metadata.complexity || 'Unknown'}
                  </span>
                  {process.metadata.aiModel && (
                    <span>
                      Generated by: {process.metadata.aiModel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <BpmnViewer
              ref={bpmnViewerRef}
              bpmnXml={process.bpmnXml}
              height="600px"
            />
          </div>
        </div>

        {/* Optimizations History */}
        {process.optimizations && process.optimizations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-6">Optimization History</h3>
            <div className="space-y-4">
              {process.optimizations.map((optimization, index) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      Version {optimization.version}
                    </h4>
                    <span className="text-sm text-dark-400">
                      {new Date(optimization.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-white mb-2">Changes Made:</h5>
                    <ul className="list-disc list-inside space-y-1 text-dark-300">
                      {optimization.changes.map((change, changeIndex) => (
                        <li key={changeIndex}>{change}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      // Switch to this optimization version
                      setProcess(prev => ({
                        ...prev,
                        bpmnXml: optimization.bpmnXml
                      }));
                      toast.success(`Switched to optimization version ${optimization.version}`);
                    }}
                    className="btn-outline text-sm"
                  >
                    View This Version
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessViewer;
