import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import TextInput from './pages/TextInput';
import GuidedBuilder from './pages/GuidedBuilder';
import ProcessViewer from './pages/ProcessViewer';
import OptimizeProcess from './pages/OptimizeProcess';
import ProcessLibrary from './pages/ProcessLibrary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-white">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text-input" element={<TextInput />} />
            <Route path="/guided-builder" element={<GuidedBuilder />} />
            <Route path="/process/:id" element={<ProcessViewer />} />
            <Route path="/optimize" element={<OptimizeProcess />} />
            <Route path="/library" element={<ProcessLibrary />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
            },
            success: {
              iconTheme: {
                primary: '#0ea5e9',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
