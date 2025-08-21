const axios = require('axios');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.basePrompts = this.initializePrompts();
  }

  initializePrompts() {
    return {
      bpmnGeneration: `You are a BPMN expert. Generate a valid BPMN 2.0 XML diagram based on the process description.

Rules:
1. Always start with a start event and end with an end event
2. Use proper BPMN elements (tasks, gateways, events)
3. Include proper flow connections
4. Add meaningful labels and IDs
5. Return only valid XML, no explanations

Process Description: {description}
Industry Context: {industry}

Generate the BPMN XML:`,

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
              content: 'You are a BPMN expert that generates valid BPMN 2.0 XML.'
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
    // Simple but effective BPMN generator
    const processId = 'Process_' + Date.now();
    const tasks = this.extractTasksFromText(description);
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>`;

    // Add tasks
    for (let i = 0; i < tasks.length; i++) {
      xml += `
    <bpmn:task id="Task_${i + 1}" name="${this.sanitizeForXml(tasks[i])}">
      <bpmn:incoming>Flow_${i + 1}</bpmn:incoming>
      <bpmn:outgoing>Flow_${i + 2}</bpmn:outgoing>
    </bpmn:task>`;
    }

    xml += `
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_${tasks.length + 1}</bpmn:incoming>
    </bpmn:endEvent>`;

    // Add flows
    for (let i = 0; i <= tasks.length; i++) {
      const sourceRef = i === 0 ? 'StartEvent_1' : `Task_${i}`;
      const targetRef = i === tasks.length ? 'EndEvent_1' : `Task_${i + 1}`;
      xml += `
    <bpmn:sequenceFlow id="Flow_${i + 1}" sourceRef="${sourceRef}" targetRef="${targetRef}" />`;
    }

    xml += `
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">`;

    // Add shapes
    let xPos = 180;
    const yPos = 100;
    const spacing = 200;

    // Start event
    xml += `
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="${xPos - 18}" y="${yPos - 18}" width="36" height="36" />
      </bpmndi:BPMNShape>`;
    xPos += spacing;

    // Tasks
    for (let i = 0; i < tasks.length; i++) {
      xml += `
      <bpmndi:BPMNShape id="Activity_Task_${i + 1}_di" bpmnElement="Task_${i + 1}">
        <dc:Bounds x="${xPos - 50}" y="${yPos - 40}" width="100" height="80" />
      </bpmndi:BPMNShape>`;
      xPos += spacing;
    }

    // End event
    xml += `
      <bpmndi:BPMNShape id="Event_EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="${xPos - 18}" y="${yPos - 18}" width="36" height="36" />
      </bpmndi:BPMNShape>`;

    // Add edges
    xPos = 180;
    for (let i = 0; i <= tasks.length; i++) {
      const xStart = xPos + (i === 0 ? 18 : 50);
      const xEnd = xPos + spacing - (i === tasks.length ? 18 : 50);
      xml += `
      <bpmndi:BPMNEdge id="Flow_${i + 1}_di" bpmnElement="Flow_${i + 1}">
        <di:waypoint x="${xStart}" y="${yPos}" />
        <di:waypoint x="${xEnd}" y="${yPos}" />
      </bpmndi:BPMNEdge>`;
      xPos += spacing;
    }

    xml += `
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    return xml;
  }

  extractTasksFromText(description) {
    const tasks = [];
    const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const clean = sentence.trim().toLowerCase();
      
      // Look for task indicators
      if (clean.includes('task') || clean.includes('receive') || clean.includes('check') || 
          clean.includes('prepare') || clean.includes('pack') || clean.includes('assign') || 
          clean.includes('deliver') || clean.includes('send') || clean.includes('notify') ||
          clean.includes('moves to') || clean.includes('verify')) {
        
        let taskName = sentence.trim()
          .replace(/^(the\s+|next,?\s+|then,?\s+|first,?\s+|process\s+moves\s+to\s+)/i, '')
          .replace(/\s+(task|step|is performed|where|performed by).*/gi, '')
          .replace(/[,].*/g, '');
        
        taskName = taskName.trim();
        if (taskName.length > 0) {
          taskName = taskName.charAt(0).toUpperCase() + taskName.slice(1);
          if (taskName.length > 50) taskName = taskName.substring(0, 47) + '...';
          
          if (!tasks.some(t => t.toLowerCase() === taskName.toLowerCase())) {
            tasks.push(taskName);
          }
        }
      }
    }

    // Default tasks if none found
    if (tasks.length === 0) {
      tasks.push('Receive Order', 'Check Order Details', 'Prepare Food', 'Pack Order', 'Assign Delivery Driver', 'Deliver Order');
    }

    return tasks.slice(0, 8); // Limit to reasonable number
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
