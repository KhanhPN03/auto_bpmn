const Process = require('../models/Process');

// Export as PNG
const exportAsPng = async (req, res) => {
  try {
    const { processId, bpmnXml } = req.body;

    if (!bpmnXml) {
      return res.status(400).json({
        success: false,
        message: 'BPMN XML is required'
      });
    }

    // In a real implementation, you would use a library like puppeteer
    // to render the BPMN and convert to PNG
    // For now, we'll return the XML for the frontend to handle conversion
    
    res.json({
      success: true,
      data: {
        format: 'png',
        bpmnXml,
        message: 'Use frontend rendering for PNG export'
      }
    });

  } catch (error) {
    console.error('Error exporting as PNG:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export as PNG'
    });
  }
};

// Export as SVG
const exportAsSvg = async (req, res) => {
  try {
    const { processId, bpmnXml } = req.body;

    if (!bpmnXml) {
      return res.status(400).json({
        success: false,
        message: 'BPMN XML is required'
      });
    }

    // Return the XML for frontend SVG conversion
    res.json({
      success: true,
      data: {
        format: 'svg',
        bpmnXml,
        message: 'Use frontend rendering for SVG export'
      }
    });

  } catch (error) {
    console.error('Error exporting as SVG:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export as SVG'
    });
  }
};

// Export as XML
const exportAsXml = async (req, res) => {
  try {
    const { processId, bpmnXml } = req.body;

    if (!bpmnXml) {
      return res.status(400).json({
        success: false,
        message: 'BPMN XML is required'
      });
    }

    // Set appropriate headers for XML download
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="process.bpmn"');
    
    res.send(bpmnXml);

  } catch (error) {
    console.error('Error exporting as XML:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export as XML'
    });
  }
};

module.exports = {
  exportAsPng,
  exportAsSvg,
  exportAsXml
};
