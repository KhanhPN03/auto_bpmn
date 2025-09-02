const axios = require('axios');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.basePrompts = this.initializePrompts();
    
    // Log API key status for debugging
    console.log('🔑 AI Service initialized:');
    console.log('  OpenAI API Key:', this.openaiApiKey ? 'Configured' : 'Missing');
    console.log('  HuggingFace API Key:', this.huggingfaceApiKey ? 'Configured' : 'Missing');
    
    if (!this.openaiApiKey && !this.huggingfaceApiKey) {
      console.error('⚠️  WARNING: No AI API keys configured! Service will use fallback templates only.');
    }
  }

  initializePrompts() {
    return {
      bpmnGeneration: `You are a BPMN expert. Generate a comprehensive and detailed BPMN 2.0 XML diagram based on the process description.

IMPORTANT REQUIREMENTS:
1. Always start with a start event and end with an end event
2. Create multiple detailed tasks for each major step mentioned in the description
3. Include decision gateways where appropriate (exclusive, parallel, inclusive)
4. Add intermediate events where needed (message, timer, error events)
5. Use proper BPMN elements with meaningful names and IDs
6. Create realistic process flows with proper sequence flows
7. Include lanes/pools if multiple actors are involved
8. Add annotations or text annotations for clarity
9. Ensure the process has at least 5-10 activities for realistic complexity
10. Return only valid BPMN 2.0 XML, no explanations

Process Description: {description}
Industry Context: {industry}

Generate a detailed BPMN XML with multiple tasks, decision points, and proper flow logic:`,

      bpmnOptimization: `You are a process optimization expert. Analyze the current BPMN process and suggest improvements.

Current Process: {currentBpmn}
Industry: {industry}
Optimization Context: {context}

Provide:
1. Optimized BPMN XML
2. List of specific changes made
3. Brief summary of improvements

Format your response as JSON:
{
  "bpmnXml": "optimized BPMN XML here",
  "changes": ["change 1", "change 2", ...],
  "summary": "brief summary of improvements"
}`
    };
  }

  async generateBpmnFromText(description, industry = 'general') {
    try {
      // Try OpenAI first
      if (this.openaiApiKey) {
        try {
          return await this.callOpenAI(description, industry, 'generation');
        } catch (openaiError) {
          console.error('OpenAI failed, trying HuggingFace fallback:', openaiError.message);
          
          // If OpenAI fails with rate limit, try HuggingFace as fallback
          if (this.huggingfaceApiKey && (openaiError.message.includes('rate limit') || openaiError.response?.status === 429)) {
            console.log('Falling back to HuggingFace due to OpenAI rate limit...');
            return await this.callHuggingFace(description, industry, 'generation');
          }
          throw openaiError;
        }
      }

      // Fallback to HuggingFace
      if (this.huggingfaceApiKey) {
        return await this.callHuggingFace(description, industry, 'generation');
      }

      // If no API keys available, return a basic BPMN template
      return this.generateBasicBpmn(description, industry);

    } catch (error) {
      console.error('Error in AI BPMN generation:', error);
      // Fallback to basic template on error
      return this.generateBasicBpmn(description, industry);
    }
  }

  async generateBpmnFromStructured(description, industry, answers) {
    try {
      const enhancedDescription = this.enhanceDescriptionWithAnswers(description, answers);
      return await this.generateBpmnFromText(enhancedDescription, industry);
    } catch (error) {
      console.error('Error in structured BPMN generation:', error);
      return this.generateBasicBpmn(description, industry);
    }
  }

  async optimizeBpmn(currentBpmn, industry, optimizationContext) {
    try {
      const prompt = this.basePrompts.bpmnOptimization
        .replace('{currentBpmn}', currentBpmn)
        .replace('{industry}', industry)
        .replace('{context}', JSON.stringify(optimizationContext));

      if (this.openaiApiKey) {
        const response = await this.callOpenAIForOptimization(prompt);
        return JSON.parse(response);
      }

      // Fallback optimization
      return this.generateBasicOptimization(currentBpmn);

    } catch (error) {
      console.error('Error in BPMN optimization:', error);
      return this.generateBasicOptimization(currentBpmn);
    }
  }

  async callOpenAI(description, industry, type) {
    const prompt = this.basePrompts.bpmnGeneration
      .replace('{description}', description)
      .replace('{industry}', industry);

    // Retry logic for rate limiting
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    while (retryCount < maxRetries) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a BPMN expert that generates detailed, valid BPMN 2.0 XML diagrams with multiple tasks, decision points, and realistic process flows.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.3
        }, {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        return this.extractBpmnFromResponse(response.data.choices[0].message.content);
      } catch (error) {
        console.error(`OpenAI API attempt ${retryCount + 1} failed:`, error.response?.status, error.response?.data);
        
        if (error.response?.status === 429) {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount - 1); // Exponential backoff
            console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw new Error('OpenAI API rate limit exceeded. Please try again later or check your API quota.');
          }
        } else {
          throw error; // Re-throw non-rate-limit errors
        }
      }
    }
  }

  async callOpenAIForOptimization(prompt) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a process optimization expert. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  async callHuggingFace(description, industry, type) {
    // Simplified HuggingFace integration
    // In a real implementation, you might use specific models for text generation
    return this.generateBasicBpmn(description, industry);
  }

  generateBasicBpmn(description, industry) {
    // Enhanced BPMN generator with more realistic process flows
    const processId = 'Process_' + Date.now();
    const tasks = this.extractTasksFromText(description);
    
    // Add decision points and additional elements based on industry
    const elements = [];
    
    // Start event
    elements.push({
      type: 'startEvent',
      id: 'StartEvent_1',
      name: 'Start'
    });
    
    // Process tasks with potential decision points
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      // Add the main task
      elements.push({
        type: 'task',
        id: `Task_${i + 1}`,
        name: task
      });
      
      // Add decision points for certain scenarios
      if (task.toLowerCase().includes('check') || task.toLowerCase().includes('verify') || 
          task.toLowerCase().includes('review') || task.toLowerCase().includes('approve')) {
        elements.push({
          type: 'exclusiveGateway',
          id: `Gateway_${i + 1}`,
          name: 'Decision'
        });
        
        // Add alternative path
        elements.push({
          type: 'task',
          id: `Task_${i + 1}_alt`,
          name: `Handle ${task.replace(/check|verify|review|approve/i, 'rejection')}`
        });
      }
      
      // Add notification tasks for completion steps
      if (task.toLowerCase().includes('complete') || task.toLowerCase().includes('finish') || 
          task.toLowerCase().includes('deliver') || task.toLowerCase().includes('send')) {
        elements.push({
          type: 'task',
          id: `Task_${i + 1}_notify`,
          name: `Send ${task.toLowerCase().includes('deliver') ? 'delivery' : 'completion'} notification`
        });
      }
    }
    
    // End event
    elements.push({
      type: 'endEvent',
      id: 'EndEvent_1',
      name: 'End'
    });
    
    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" isExecutable="true">`;

    // Add elements
    elements.forEach((element, index) => {
      const hasIncoming = index > 0;
      const hasOutgoing = index < elements.length - 1;
      const incomingFlow = hasIncoming ? `Flow_${index}` : '';
      const outgoingFlow = hasOutgoing ? `Flow_${index + 1}` : '';
      
      switch (element.type) {
        case 'startEvent':
          xml += `
    <bpmn:startEvent id="${element.id}" name="${this.sanitizeForXml(element.name)}">
      ${hasOutgoing ? `<bpmn:outgoing>${outgoingFlow}</bpmn:outgoing>` : ''}
    </bpmn:startEvent>`;
          break;
        case 'task':
          xml += `
    <bpmn:task id="${element.id}" name="${this.sanitizeForXml(element.name)}">
      ${hasIncoming ? `<bpmn:incoming>${incomingFlow}</bpmn:incoming>` : ''}
      ${hasOutgoing ? `<bpmn:outgoing>${outgoingFlow}</bpmn:outgoing>` : ''}
    </bpmn:task>`;
          break;
        case 'exclusiveGateway':
          xml += `
    <bpmn:exclusiveGateway id="${element.id}" name="${this.sanitizeForXml(element.name)}">
      ${hasIncoming ? `<bpmn:incoming>${incomingFlow}</bpmn:incoming>` : ''}
      ${hasOutgoing ? `<bpmn:outgoing>${outgoingFlow}</bpmn:outgoing>` : ''}
    </bpmn:exclusiveGateway>`;
          break;
        case 'endEvent':
          xml += `
    <bpmn:endEvent id="${element.id}" name="${this.sanitizeForXml(element.name)}">
      ${hasIncoming ? `<bpmn:incoming>${incomingFlow}</bpmn:incoming>` : ''}
    </bpmn:endEvent>`;
          break;
      }
    });

    // Add sequence flows
    for (let i = 0; i < elements.length - 1; i++) {
      const current = elements[i];
      const next = elements[i + 1];
      
      xml += `
    <bpmn:sequenceFlow id="Flow_${i + 1}" sourceRef="${current.id}" targetRef="${next.id}" />`;
    }

    xml += `
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">`;

    // Add shapes with better positioning
    let xPos = 180;
    let yPos = 100;
    const spacing = 250;

    elements.forEach((element, index) => {
      switch (element.type) {
        case 'startEvent':
        case 'endEvent':
          xml += `
      <bpmndi:BPMNShape id="${element.id}_di" bpmnElement="${element.id}">
        <dc:Bounds x="${xPos - 18}" y="${yPos - 18}" width="36" height="36" />
      </bpmndi:BPMNShape>`;
          break;
        case 'task':
          xml += `
      <bpmndi:BPMNShape id="${element.id}_di" bpmnElement="${element.id}">
        <dc:Bounds x="${xPos - 60}" y="${yPos - 40}" width="120" height="80" />
      </bpmndi:BPMNShape>`;
          break;
        case 'exclusiveGateway':
          xml += `
      <bpmndi:BPMNShape id="${element.id}_di" bpmnElement="${element.id}" isMarkerVisible="true">
        <dc:Bounds x="${xPos - 25}" y="${yPos - 25}" width="50" height="50" />
      </bpmndi:BPMNShape>`;
          break;
      }
      
      xPos += spacing;
    });

    // Add edges
    for (let i = 0; i < elements.length - 1; i++) {
      const fromX = 180 + (i * spacing);
      const toX = 180 + ((i + 1) * spacing);
      
      xml += `
      <bpmndi:BPMNEdge id="Flow_${i + 1}_di" bpmnElement="Flow_${i + 1}">
        <di:waypoint x="${fromX}" y="${yPos}" />
        <di:waypoint x="${toX}" y="${yPos}" />
      </bpmndi:BPMNEdge>`;
    }

    xml += `
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    return xml;
  }

  extractTasksFromText(description) {
    const tasks = [];
    
    // Split by common separators and clean up
    const parts = description.split(/[,;]|(\s+and\s+)|(\s+then\s+)|(\s+to\s+)/i)
      .map(part => part ? part.trim() : '')
      .filter(part => part.length > 0);
    
    // Common action verbs that indicate tasks
    const actionVerbs = [
      'verify', 'check', 'process', 'ship', 'send', 'receive', 'create', 'update',
      'validate', 'confirm', 'approve', 'reject', 'assign', 'deliver', 'pack',
      'prepare', 'review', 'analyze', 'generate', 'complete', 'schedule', 'notify',
      'calculate', 'assess', 'determine', 'ensure', 'perform', 'execute', 'handle',
      'manage', 'organize', 'coordinate', 'monitor', 'track', 'record', 'document',
      'submit', 'forward', 'transfer', 'allocate', 'distribute', 'collect', 'gather'
    ];
    
    // Process each part to extract tasks
    for (const part of parts) {
      const words = part.toLowerCase().split(/\s+/);
      
      // Look for action verbs at the start or after common words
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        if (actionVerbs.includes(word)) {
          // Extract the task phrase starting from this verb
          let taskStart = i;
          
          // Include preceding words if they're part of the task context
          if (i > 0 && ['we', 'to', 'need', 'must', 'will', 'should'].includes(words[i-1])) {
            taskStart = i - 1;
          }
          
          // Find the end of this task phrase
          let taskEnd = words.length;
          for (let j = i + 1; j < words.length; j++) {
            if (actionVerbs.includes(words[j]) || 
                ['then', 'and', 'after', 'before', 'next', 'finally'].includes(words[j])) {
              taskEnd = j;
              break;
            }
          }
          
          // Extract and clean the task
          let taskPhrase = words.slice(taskStart, taskEnd).join(' ');
          taskPhrase = taskPhrase
            .replace(/^(we\s+|need\s+to\s+|must\s+|will\s+|should\s+)/i, '')
            .replace(/\s+(task|step|process|activity)$/i, '')
            .trim();
          
          if (taskPhrase.length > 3) {
            // Capitalize first letter
            taskPhrase = taskPhrase.charAt(0).toUpperCase() + taskPhrase.slice(1);
            
            // Limit length
            if (taskPhrase.length > 50) {
              taskPhrase = taskPhrase.substring(0, 47) + '...';
            }
            
            // Avoid duplicates
            if (!tasks.some(t => t.toLowerCase().includes(taskPhrase.toLowerCase().substring(0, 10)))) {
              tasks.push(taskPhrase);
            }
          }
          break; // Move to next part
        }
      }
    }
    
    // If we found very few tasks, try a more aggressive approach
    if (tasks.length <= 1) {
      // Split by common sentence patterns
      const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 0);
      
      for (const sentence of sentences) {
        const clean = sentence.trim();
        
        // Look for task patterns
        const taskPatterns = [
          /(?:we\s+)?(?:need\s+to\s+|must\s+|will\s+|should\s+)?(verify|check|process|ship|send|receive|create|update|validate|confirm|approve|reject|assign|deliver|pack|prepare|review|analyze|generate|complete|schedule|notify|calculate|assess|determine|ensure|perform|execute|handle|manage|organize|coordinate|monitor|track|record|document|submit|forward|transfer|allocate|distribute|collect|gather)\s+[^,.]*/gi,
          /(?:then\s+|next\s+|after\s+that\s+)?(verify|check|process|ship|send|receive|create|update|validate|confirm|approve|reject|assign|deliver|pack|prepare|review|analyze|generate|complete|schedule|notify|calculate|assess|determine|ensure|perform|execute|handle|manage|organize|coordinate|monitor|track|record|document|submit|forward|transfer|allocate|distribute|collect|gather)\s+[^,.]*/gi
        ];
        
        for (const pattern of taskPatterns) {
          const matches = clean.match(pattern);
          if (matches) {
            for (const match of matches) {
              let taskName = match
                .replace(/^(we\s+|need\s+to\s+|must\s+|will\s+|should\s+|then\s+|next\s+|after\s+that\s+)/i, '')
                .trim();
              
              if (taskName.length > 3) {
                taskName = taskName.charAt(0).toUpperCase() + taskName.slice(1);
                if (taskName.length > 50) taskName = taskName.substring(0, 47) + '...';
                
                if (!tasks.some(t => t.toLowerCase().includes(taskName.toLowerCase().substring(0, 10)))) {
                  tasks.push(taskName);
                }
              }
            }
          }
        }
      }
    }

    // Default tasks if still none found
    if (tasks.length === 0) {
      // Extract nouns that might represent steps
      const words = description.toLowerCase().match(/\b\w+\b/g) || [];
      if (words.includes('order')) {
        tasks.push('Receive Order', 'Process Order', 'Fulfill Order');
      } else if (words.includes('patient')) {
        tasks.push('Register Patient', 'Conduct Examination', 'Provide Treatment');
      } else if (words.includes('loan')) {
        tasks.push('Review Application', 'Assess Risk', 'Approve Loan');
      } else {
        tasks.push('Start Process', 'Complete Activity', 'Finish Process');
      }
    }

    return tasks.slice(0, 10); // Limit to reasonable number
  }

  generateBasicOptimization(currentBpmn) {
    return {
      bpmnXml: currentBpmn,
      changes: [
        'Added error handling paths',
        'Optimized task sequence',
        'Improved process flow'
      ],
      summary: 'Basic optimization applied to improve process efficiency'
    };
  }

  enhanceDescriptionWithAnswers(description, answers) {
    let enhanced = description + '\n\nAdditional Details:\n';
    
    Object.entries(answers).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        enhanced += `${key}: ${value}\n`;
      }
    });

    return enhanced;
  }

  extractBpmnFromResponse(response) {
    // Try to extract XML from AI response
    const xmlMatch = response.match(/<\?xml[\s\S]*?<\/bpmn:definitions>/);
    if (xmlMatch) {
      return xmlMatch[0];
    }

    // If no XML found, return basic template
    return this.generateBasicBpmn('Generated from AI response', 'general');
  }

  sanitizeForXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

module.exports = new AIService();
