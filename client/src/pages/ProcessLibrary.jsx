import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Library, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  ArrowRight,
  Calendar,
  Tag,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllProcesses, deleteProcess } from '../services/api';

const ProcessLibrary = () => {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'general', label: 'General' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'optimized', label: 'Optimized First' }
  ];

  useEffect(() => {
    loadProcesses();
  }, [searchTerm, selectedIndustry, sortBy, pagination.current]);

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        page: pagination.current,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedIndustry !== 'all' && { industry: selectedIndustry }),
        sort: sortBy
      };

      const response = await getAllProcesses(params);
      
      if (response.success) {
        setProcesses(response.data.processes);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading processes:', error);
      toast.error('Failed to load processes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (processId) => {
    if (!window.confirm('Are you sure you want to delete this process?')) {
      return;
    }

    try {
      const response = await deleteProcess(processId);
      
      if (response.success) {
        toast.success('Process deleted successfully');
        loadProcesses(); // Reload the list
      }
    } catch (error) {
      console.error('Error deleting process:', error);
      toast.error('Failed to delete process');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  const getIndustryColor = (industry) => {
    switch (industry) {
      case 'manufacturing':
        return 'bg-blue-600/20 text-blue-400';
      case 'healthcare':
        return 'bg-green-600/20 text-green-400';
      case 'finance':
        return 'bg-yellow-600/20 text-yellow-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = !searchTerm || 
      process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || process.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600/20 p-4 rounded-full">
              <Library className="h-10 w-10 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Process Library
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Manage and explore all your created BPMN processes in one central location.
          </p>
        </div>

        {/* Controls */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search processes..."
                className="pl-10 input-field"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-dark-400" />
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="input-field min-w-[150px]"
                >
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-[150px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Create New Button */}
            <Link
              to="/"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Process
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-dark-300">
            {isLoading ? 'Loading...' : (
              <>
                Showing {filteredProcesses.length} of {pagination.total} processes
                {searchTerm && ` for "${searchTerm}"`}
                {selectedIndustry !== 'all' && ` in ${selectedIndustry}`}
              </>
            )}
          </p>
        </div>

        {/* Process Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-4 bg-dark-600 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-dark-600 rounded w-full mb-2"></div>
                <div className="h-3 bg-dark-600 rounded w-2/3 mb-4"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="h-6 bg-dark-600 rounded-full w-16"></div>
                  <div className="h-6 bg-dark-600 rounded-full w-12"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-dark-600 rounded flex-1"></div>
                  <div className="h-8 bg-dark-600 rounded w-8"></div>
                  <div className="h-8 bg-dark-600 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="text-center py-16">
            <Library className="h-16 w-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No processes found
            </h3>
            <p className="text-dark-300 mb-6 max-w-md mx-auto">
              {searchTerm || selectedIndustry !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first BPMN process.'
              }
            </p>
            <Link to="/" className="btn-primary inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Process
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProcesses.map((process) => (
              <div key={process._id} className="card group hover:border-primary-600 transition-colors duration-200">
                {/* Process Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors duration-200">
                    {process.title}
                  </h3>
                  <p className="text-dark-300 text-sm line-clamp-2">
                    {process.description}
                  </p>
                </div>

                {/* Process Meta */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getIndustryColor(process.industry)}`}>
                    {process.industry}
                  </span>
                  
                  {process.isOptimized && (
                    <span className="inline-flex items-center px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-medium">
                      <Zap className="h-3 w-3 mr-1" />
                      Optimized
                    </span>
                  )}
                </div>

                {/* Process Date */}
                <div className="flex items-center text-dark-400 text-sm mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {new Date(process.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/process/${process._id}`}
                    className="btn-primary flex-1 inline-flex items-center justify-center text-sm"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Link>
                  
                  <Link
                    to={`/process/${process._id}`}
                    className="btn-secondary p-2"
                    title="Edit Process"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(process._id)}
                    className="p-2 text-red-400 hover:bg-red-600/20 rounded transition-colors duration-200"
                    title="Delete Process"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-12">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(pagination.pages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 rounded transition-colors duration-200 ${
                    pageNumber === pagination.current
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-16 bg-gradient-to-r from-primary-600/10 to-purple-600/10 rounded-xl p-8 border border-primary-600/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Create More Processes?
            </h2>
            <p className="text-dark-300 mb-6 max-w-2xl mx-auto">
              Use our AI-powered tools to quickly generate new BPMN diagrams or optimize existing ones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/text-input"
                className="btn-primary inline-flex items-center"
              >
                Describe Your Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <Link
                to="/guided-builder"
                className="btn-outline inline-flex items-center"
              >
                Use Guided Builder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessLibrary;
