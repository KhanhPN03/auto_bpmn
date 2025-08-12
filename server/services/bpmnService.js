class BpmnService {
  constructor() {
    this.bpmnNamespaces = {
      bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
      bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
      dc: 'http://www.omg.org/spec/DD/20100524/DC',
      di: 'http://www.omg.org/spec/DD/20100524/DI'
    };
  }

  async validateBpmn(bpmnXml) {
    try {
      // Basic XML validation
      if (!bpmnXml || typeof bpmnXml !== 'string') {
        throw new Error('Invalid BPMN XML: must be a non-empty string');
      }

      // Check for required BPMN elements
      if (!bpmnXml.includes('<bpmn:definitions')) {
        throw new Error('Invalid BPMN XML: missing bpmn:definitions element');
      }

      // Ensure XML is well-formed (basic check)
      const hasStartTag = bpmnXml.includes('<bpmn:definitions');
      const hasEndTag = bpmnXml.includes('</bpmn:definitions>');
      
      if (!hasStartTag || !hasEndTag) {
        throw new Error('Invalid BPMN XML: malformed XML structure');
      }

      // Clean and format the BPMN
      return this.cleanBpmnXml(bpmnXml);

    } catch (error) {
      console.error('BPMN validation error:', error);
      throw error;
    }
  }

  cleanBpmnXml(bpmnXml) {
    // Remove extra whitespace and normalize line endings
    return bpmnXml
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n');
  }

  assessComplexity(bpmnXml) {
    try {
      // Count different BPMN elements to assess complexity
      const taskCount = (bpmnXml.match(/<bpmn:task/g) || []).length;
      const gatewayCount = (bpmnXml.match(/<bpmn:\w*[Gg]ateway/g) || []).length;
      const eventCount = (bpmnXml.match(/<bpmn:\w*[Ee]vent/g) || []).length;
      
      const totalElements = taskCount + gatewayCount + eventCount;

      if (totalElements <= 5) return 'low';
      if (totalElements <= 15) return 'medium';
      return 'high';

    } catch (error) {
      console.error('Error assessing BPMN complexity:', error);
      return 'medium'; // Default fallback
    }
  }

  answersToDescription(answers) {
    const sections = [];

    // Process basic information
    if (answers.process_name) {
      sections.push(`Process Name: ${answers.process_name}`);
    }
    
    if (answers.process_purpose) {
      sections.push(`Purpose: ${answers.process_purpose}`);
    }

    if (answers.process_trigger) {
      sections.push(`Trigger: ${answers.process_trigger}`);
    }

    // Main process flow
    if (answers.main_steps) {
      sections.push(`Main Steps: ${answers.main_steps}`);
    }

    if (answers.decision_points) {
      sections.push(`Decision Points: ${answers.decision_points}`);
    }

    // Participants and resources
    if (answers.participants) {
      sections.push(`Participants: ${answers.participants}`);
    }

    if (answers.systems_used) {
      sections.push(`Systems Used: ${answers.systems_used}`);
    }

    if (answers.documents_data) {
      sections.push(`Documents/Data: ${answers.documents_data}`);
    }

    // Outcomes
    if (answers.process_output) {
      sections.push(`Expected Output: ${answers.process_output}`);
    }

    if (answers.success_criteria) {
      sections.push(`Success Criteria: ${answers.success_criteria}`);
    }

    // Industry-specific additions
    this.addIndustrySpecificSections(answers, sections);

    return sections.join('\n\n');
  }

  addIndustrySpecificSections(answers, sections) {
    // Manufacturing specific
    if (answers.production_type) {
      sections.push(`Production Type: ${answers.production_type}`);
    }
    if (answers.quality_checkpoints) {
      sections.push(`Quality Checkpoints: ${answers.quality_checkpoints}`);
    }
    if (answers.equipment_dependencies) {
      sections.push(`Equipment Dependencies: ${answers.equipment_dependencies}`);
    }
    if (answers.safety_requirements) {
      sections.push(`Safety Requirements: ${answers.safety_requirements}`);
    }

    // Healthcare specific
    if (answers.care_type) {
      sections.push(`Care Type: ${answers.care_type}`);
    }
    if (answers.patient_safety) {
      sections.push(`Patient Safety: ${answers.patient_safety}`);
    }
    if (answers.clinical_protocols) {
      sections.push(`Clinical Protocols: ${answers.clinical_protocols}`);
    }
    if (answers.healthcare_providers) {
      sections.push(`Healthcare Providers: ${answers.healthcare_providers}`);
    }

    // Finance specific
    if (answers.financial_process_type) {
      sections.push(`Financial Process Type: ${answers.financial_process_type}`);
    }
    if (answers.regulatory_requirements) {
      sections.push(`Regulatory Requirements: ${answers.regulatory_requirements}`);
    }
    if (answers.approval_levels) {
      sections.push(`Approval Levels: ${answers.approval_levels}`);
    }
    if (answers.risk_factors) {
      sections.push(`Risk Factors: ${answers.risk_factors}`);
    }
  }

  extractProcessMetadata(bpmnXml) {
    try {
      const metadata = {
        processCount: 0,
        taskCount: 0,
        gatewayCount: 0,
        eventCount: 0,
        flowCount: 0
      };

      // Count processes
      metadata.processCount = (bpmnXml.match(/<bpmn:process/g) || []).length;

      // Count tasks
      metadata.taskCount = (bpmnXml.match(/<bpmn:task/g) || []).length;

      // Count gateways
      metadata.gatewayCount = (bpmnXml.match(/<bpmn:\w*[Gg]ateway/g) || []).length;

      // Count events
      metadata.eventCount = (bpmnXml.match(/<bpmn:\w*[Ee]vent/g) || []).length;

      // Count sequence flows
      metadata.flowCount = (bpmnXml.match(/<bpmn:sequenceFlow/g) || []).length;

      return metadata;

    } catch (error) {
      console.error('Error extracting process metadata:', error);
      return null;
    }
  }

  generateProcessId() {
    return `Process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateElementId(prefix = 'Element') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  addDiagramElements(bpmnXml) {
    // Check if diagram elements are already present
    if (bpmnXml.includes('<bpmndi:BPMNDiagram')) {
      return bpmnXml;
    }

    // This is a simplified diagram addition
    // In a full implementation, you would parse the process elements
    // and generate appropriate diagram information
    const basicDiagram = `
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;

    // Insert before closing definitions tag
    return bpmnXml.replace('</bpmn:definitions>', basicDiagram + '\n</bpmn:definitions>');
  }

  sanitizeXmlContent(content) {
    if (!content) return '';
    
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  validateBpmnStructure(bpmnXml) {
    const requiredElements = [
      'bpmn:definitions',
      'bpmn:process',
      'bpmn:startEvent',
      'bpmn:endEvent'
    ];

    const missingElements = requiredElements.filter(element => 
      !bpmnXml.includes(`<${element}`)
    );

    if (missingElements.length > 0) {
      throw new Error(`BPMN validation failed: missing required elements: ${missingElements.join(', ')}`);
    }

    return true;
  }
}

module.exports = new BpmnService();
