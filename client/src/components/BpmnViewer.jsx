import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import BpmnJS from 'bpmn-js/lib/Viewer';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const BpmnViewer = forwardRef(({ bpmnXml, height = '500px', editable = false }, ref) => {
  const [viewer, setViewer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useImperativeHandle(ref, () => ({
    exportDiagram: async (format) => {
      if (!viewer) return;
      
      try {
        if (format === 'svg') {
          const { svg } = await viewer.saveSVG();
          downloadFile(svg, 'diagram.svg', 'image/svg+xml');
          toast.success('SVG exported successfully');
        } else if (format === 'png') {
          // For PNG export, we need to convert SVG to PNG
          const { svg } = await viewer.saveSVG();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'diagram.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success('PNG exported successfully');
            });
          };
          
          const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
          img.src = URL.createObjectURL(svgBlob);
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export diagram');
      }
    },
    getViewer: () => viewer,
    zoomIn: () => handleZoomIn(),
    zoomOut: () => handleZoomOut(),
    resetZoom: () => handleResetZoom()
  }));

  useEffect(() => {
    const container = document.getElementById('bpmn-container');
    if (!container) return;

    // Create BPMN viewer instance
    const bpmnViewer = new BpmnJS({
      container: container,
      width: '100%',
      height: height,
    });

    setViewer(bpmnViewer);

    // Cleanup on unmount
    return () => {
      if (bpmnViewer) {
        bpmnViewer.destroy();
      }
    };
  }, [height]);

  useEffect(() => {
    if (viewer && bpmnXml) {
      loadDiagram();
    }
  }, [viewer, bpmnXml]);

  const loadDiagram = async () => {
    if (!viewer || !bpmnXml) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await viewer.importXML(bpmnXml);
      
      // Fit diagram to viewport
      const canvas = viewer.get('canvas');
      canvas.zoom('fit-viewport');
      setZoomLevel(canvas.zoom());
      
    } catch (err) {
      console.error('Error loading BPMN diagram:', err);
      setError('Failed to load BPMN diagram. The XML might be invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (!viewer) return;
    const canvas = viewer.get('canvas');
    const newZoom = Math.min(zoomLevel * 1.2, 4);
    canvas.zoom(newZoom);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    if (!viewer) return;
    const canvas = viewer.get('canvas');
    const newZoom = Math.max(zoomLevel * 0.8, 0.1);
    canvas.zoom(newZoom);
    setZoomLevel(newZoom);
  };

  const handleResetZoom = () => {
    if (!viewer) return;
    const canvas = viewer.get('canvas');
    canvas.zoom('fit-viewport');
    setZoomLevel(canvas.zoom());
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-dark-800 text-white rounded-lg border border-dark-600 hover:bg-dark-700 transition-colors duration-200"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-dark-800 text-white rounded-lg border border-dark-600 hover:bg-dark-700 transition-colors duration-200"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-dark-800 text-white rounded-lg border border-dark-600 hover:bg-dark-700 transition-colors duration-200"
          title="Fit to Screen"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-dark-800 text-white px-3 py-1 rounded-lg border border-dark-600 text-sm">
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-dark-600">Loading diagram...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20">
          <div className="text-center text-red-600 p-8">
            <p className="font-medium mb-2">Error Loading Diagram</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => loadDiagram()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* BPMN Container */}
      <div
        id="bpmn-container"
        className="bpmn-container border border-dark-600 rounded-lg overflow-hidden"
        style={{ height }}
      />

      {/* No Diagram State */}
      {!bpmnXml && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-700 z-10">
          <div className="text-center text-dark-300">
            <p className="text-lg font-medium mb-2">No diagram to display</p>
            <p className="text-sm">Generate a BPMN diagram to view it here</p>
          </div>
        </div>
      )}
    </div>
  );
});

BpmnViewer.displayName = 'BpmnViewer';

export default BpmnViewer;
