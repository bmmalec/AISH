const axios = require('axios');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class BusinessAnalystAgent {
    constructor() {
        this.apiKey = process.env.XAI_API_KEY;
        this.baseUrl = 'https://api.x.ai/v1';
        this.model = process.env.GROK_MODEL || 'grok-2-1212';
        this.requirementCounter = 0;
        this.questionCounter = 0;
        this.stoppedTopics = new Set();
    }

    async processVisionAndScope(projectName, vision, scope) {
        try {
            const prompt = `
                You are a Business Analyst aligning with SAFe principles. Given the vision: "${vision}" and scope: "${scope}", create a set of detailed requirements to support the application’s functionality. Each requirement must specify:
                - "text": A description of the requirement, including entities (e.g., User, Chore), processes (e.g., Log Chore), or attributes (e.g., Chore Name) where applicable.
                - "benefit": A measurable outcome (why it matters, e.g., "Reduces task assignment time by 20%").
                - "objective": The goal it achieves (what it accomplishes, e.g., "Streamline task delegation").
                - "value": How it contributes to the business or user (e.g., "Improves family coordination").
                Include a process, associated entity, and use case where relevant. Do not limit the number of requirements.

                Additionally, create follow-up questions about the logical requirements (not technical implementation) and assign each to either the "Stakeholder" or an agent ("UX Designer", "Solution Architect", "Tech Advisor"). Limit questions to no more than 2 per logical topic (e.g., user management, data handling). For each question, provide up to 5 potential answer options.

                Return a plain JSON object with two top-level keys:
                - "requirements": an array of objects with "text", "benefit", "objective", "value", and optionally "process", "entity", "useCase".
                - "questions": an array of objects with "text", "to", "topic", and "options" (an array of up to 5 potential answer strings).
                Ensure "requirements" and "questions" are separate arrays at the root level, and the output is strictly valid JSON with no extra text, Markdown, or comments.
            `;
            const response = await this.callGrok(prompt);
            console.log('Grok Response (Vision/Scope):', response.data);

            let content = response.data.choices[0].message.content.trim();
            console.log('Raw Content (Vision/Scope):', content);

            content = content.replace(/```json\s*/, '').replace(/\s*```/, '').trim();
            let data;
            try {
                data = JSON.parse(content);
                console.log('Parsed Data (Vision/Scope):', data);
            } catch (parseError) {
                console.error('JSON Parse Error (Vision/Scope):', parseError.message);
                throw new Error('Grok returned invalid JSON');
            }

            if (!data.requirements || !data.questions) {
                console.warn('Grok returned incomplete data:', data);
                throw new Error('Grok response missing required elements');
            }

            return {
                projectName,
                vision,
                scope,
                requirements: data.requirements.map(r => ({ 
                    internalId: uuidv4(),
                    id: `R-${++this.requirementCounter}`, 
                    text: r.text, 
                    benefit: r.benefit || 'Not specified',
                    objective: r.objective || 'Not specified',
                    value: r.value || 'Not specified',
                    process: r.process || '', 
                    entity: r.entity || '', 
                    useCase: r.useCase || '' 
                })),
                questions: data.questions.map(q => ({ 
                    internalId: uuidv4(),
                    id: `Q-${++this.questionCounter}`, 
                    text: q.text, 
                    to: q.to, 
                    topic: q.topic, 
                    options: Array.isArray(q.options) ? q.options : [], 
                    status: 'Open' 
                })),
                stoppedTopics: [],
                promptHistory: []
            };
        } catch (error) {
            console.error('Error in processVisionAndScope:', error.message, error.stack);
            throw new Error('Failed to process vision and scope');
        }
    }

    async processAnswer(projectData, questionId, answer) {
        try {
            const question = projectData.questions.find(q => q.internalId === questionId);
            if (!question) throw new Error('Question not found');
            question.status = 'Resolved';
            question.answer = answer;

            if (this.stoppedTopics.has(question.topic)) return projectData;

            const prompt = `
                Given the resolved question "${question.text}" assigned to "${question.to}" with answer "${answer}", analyze the logical impact on the application using SAFe principles. Generate new requirements or questions as needed, focusing on logical aspects (entities, processes, attributes). For requirements, specify:
                - "text": The requirement description, including entities, processes, or attributes where applicable.
                - "benefit": A measurable outcome (why it matters).
                - "objective": The goal it achieves.
                - "value": How it contributes to the business or user.
                Include a process, associated entity, and use case where relevant. Assign questions to either "Stakeholder" or an agent ("UX Designer", "Solution Architect", "Tech Advisor"), and specify the "topic". Limit new questions to 1 per topic. For each new question, provide up to 5 potential answer options.

                Return a plain JSON object with two top-level keys:
                - "requirements": an array of objects with "text", "benefit", "objective", "value", and optionally "process", "entity", "useCase".
                - "questions": an array of objects with "text", "to", "topic", and "options" (an array of up to 5 potential answer strings).
                Ensure "requirements" and "questions" are separate arrays at the root level, and the output is strictly valid JSON with no extra text, Markdown, or comments.
            `;
            const response = await this.callGrok(prompt);
            console.log('Grok Answer Response:', response.data);

            let content = response.data.choices[0].message.content.trim();
            console.log('Raw Content (Answer):', content);

            content = content.replace(/```json\s*/, '').replace(/\s*```/, '').trim();
            let newData;
            try {
                newData = JSON.parse(content);
                console.log('Parsed newData (Answer):', newData);
            } catch (parseError) {
                console.error('JSON Parse Error in Answer:', parseError.message);
                throw new Error('Grok returned invalid JSON for answer');
            }

            const requirements = Array.isArray(newData.requirements) ? newData.requirements : [];
            const questions = Array.isArray(newData.questions) ? newData.questions : [];

            console.log('Processed Requirements:', requirements);
            console.log('Processed Questions:', questions);

            if (requirements.length > 0) {
                projectData.requirements.push(...requirements.map(r => ({ 
                    internalId: uuidv4(),
                    id: `R-${++this.requirementCounter}`, 
                    text: r.text, 
                    benefit: r.benefit || 'Not specified',
                    objective: r.objective || 'Not specified',
                    value: r.value || 'Not specified',
                    process: r.process || '', 
                    entity: r.entity || '', 
                    useCase: r.useCase || '' 
                })));
            }
            if (questions.length > 0) {
                projectData.questions.push(...questions.map(q => ({ 
                    internalId: uuidv4(),
                    id: `Q-${++this.questionCounter}`, 
                    text: q.text, 
                    to: q.to, 
                    topic: q.topic, 
                    options: Array.isArray(q.options) ? q.options : [], 
                    status: 'Open' 
                })));
            }
            console.log('Updated projectData before Markdown:', projectData);
            return projectData;
        } catch (error) {
            console.error('Error in processAnswer:', error.message, error.stack);
            throw new Error('Failed to process answer');
        }
    }

    async addRequirements(projectData, promptText) {
        try {
            const prompt = `
                Given the existing project with vision: "${projectData.vision}" and scope: "${projectData.scope}", and the additional prompt: "${promptText}", generate new requirements to enhance the application using SAFe principles. Specify:
                - "text": The requirement description, including entities (e.g., User, Chore), processes (e.g., Log Chore), or attributes (e.g., Chore Name) where applicable.
                - "benefit": A measurable outcome (why it matters).
                - "objective": The goal it achieves.
                - "value": How it contributes to the business or user.
                Include a process, associated entity, and use case if relevant.

                Return a plain JSON object with one top-level key:
                - "requirements": an array of objects with "text", "benefit", "objective", "value", and optionally "process", "entity", "useCase".
                Ensure the output is strictly valid JSON with no extra text, Markdown, or comments.
            `;
            const response = await this.callGrok(prompt);
            console.log('Grok Prompt Response:', response.data);

            let content = response.data.choices[0].message.content.trim();
            console.log('Raw Content (Prompt):', content);

            content = content.replace(/```json\s*/, '').replace(/\s*```/, '').trim();
            let newData;
            try {
                newData = JSON.parse(content);
                console.log('Parsed newData (Prompt):', newData);
            } catch (parseError) {
                console.error('JSON Parse Error in Prompt:', parseError.message);
                throw new Error('Grok returned invalid JSON for prompt');
            }

            const requirements = Array.isArray(newData.requirements) ? newData.requirements : [];
            if (requirements.length > 0) {
                projectData.requirements.push(...requirements.map(r => ({ 
                    internalId: uuidv4(),
                    id: `R-${++this.requirementCounter}`, 
                    text: r.text, 
                    benefit: r.benefit || 'Not specified',
                    objective: r.objective || 'Not specified',
                    value: r.value || 'Not specified',
                    process: r.process || '', 
                    entity: r.entity || '', 
                    useCase: r.useCase || '' 
                })));
                projectData.promptHistory.push(promptText);
            }
            return projectData;
        } catch (error) {
            console.error('Error in addRequirements:', error.message, error.stack);
            throw new Error('Failed to add requirements');
        }
    }

    async clarifyRequirement(projectData, reqId, promptText) {
        try {
            const requirement = projectData.requirements.find(r => r.internalId === reqId);
            if (!requirement) throw new Error('Requirement not found');
            const prompt = `
                Given the requirement "${requirement.text}" (Benefit: ${requirement.benefit}, Objective: ${requirement.objective}, Value: ${requirement.value})${requirement.process ? ' (Process: ' + requirement.process + ')' : ''}${requirement.entity ? ' (Entity: ' + requirement.entity + ')' : ''}${requirement.useCase ? ' (Use Case: ' + requirement.useCase + ')' : ''}, and the clarification prompt: "${promptText}", provide additional details or refinements to this requirement using SAFe principles. Specify:
                - "text": The refined requirement description.
                - "benefit": A measurable outcome.
                - "objective": The goal it achieves.
                - "value": How it contributes to the business or user.
                Include a process, associated entity, and use case where applicable.

                Return a plain JSON object with one top-level key:
                - "requirements": an array of objects with "text", "benefit", "objective", "value", and optionally "process", "entity", "useCase".
                Ensure the output is strictly valid JSON with no extra text, Markdown, or comments.
            `;
            const response = await this.callGrok(prompt);
            console.log('Grok Clarify Response:', response.data);

            let content = response.data.choices[0].message.content.trim();
            console.log('Raw Content (Clarify):', content);

            content = content.replace(/```json\s*/, '').replace(/\s*```/, '').trim();
            let newData;
            try {
                newData = JSON.parse(content);
                console.log('Parsed newData (Clarify):', newData);
            } catch (parseError) {
                console.error('JSON Parse Error in Clarify:', parseError.message);
                throw new Error('Grok returned invalid JSON for clarification');
            }

            const requirements = Array.isArray(newData.requirements) ? newData.requirements : [];
            if (requirements.length > 0) {
                projectData.requirements.push(...requirements.map(r => ({ 
                    internalId: uuidv4(),
                    id: `R-${++this.requirementCounter}`, 
                    text: r.text, 
                    benefit: r.benefit || 'Not specified',
                    objective: r.objective || 'Not specified',
                    value: r.value || 'Not specified',
                    process: r.process || '', 
                    entity: r.entity || '', 
                    useCase: r.useCase || '' 
                })));
                projectData.promptHistory.push(`Clarification for ${requirement.id}: ${promptText}`);
            }
            return projectData;
        } catch (error) {
            console.error('Error in clarifyRequirement:', error.message, error.stack);
            throw new Error('Failed to clarify requirement');
        }
    }

    stopQuestionLine(projectData, questionId) {
        const question = projectData.questions.find(q => q.internalId === questionId);
        if (question) {
            this.stoppedTopics.add(question.topic);
            projectData.stoppedTopics = Array.from(this.stoppedTopics);
        }
        return projectData;
    }

    async callGrok(prompt) {
        try {
            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: parseInt(process.env.MAX_TOKENS, 10)
            }, {
                headers: { 
                    'Authorization': `Bearer ${this.apiKey}`, 
                    'Content-Type': 'application/json' 
                }
            });
            return response;
        } catch (error) {
            console.error('Grok API Call Failed:', error.message, error.response?.data);
            throw error;
        }
    }

    async updateMarkdown(filePath, projectData) {
        try {
            console.log('Generating Markdown for projectData:', projectData);
            const mdContent = `# Project: ${projectData.projectName}\n\n## Vision\n${projectData.vision}\n\n## Scope\n${projectData.scope}\n\n## Requirements\n${projectData.requirements.map(r => 
                `- ${r.id}: ${r.text}${r.epic ? ' [Epic: ' + r.epic + ']' : ''}\n  - Benefit: ${r.benefit}\n  - Objective: ${r.objective}\n  - Value: ${r.value}${r.process ? '\n  - Process: ' + r.process : ''}${r.entity ? '\n  - Entity: ' + r.entity : ''}${r.useCase ? '\n  - Use Case: ' + r.useCase : ''}`
            ).join('\n')}\n\n## Questions\n${projectData.questions.map(q => {
                const options = Array.isArray(q.options) ? q.options : [];
                return `- ${q.id}: ${q.text} (To: ${q.to}, Topic: ${q.topic}, ${q.status}${q.answer ? ', Answer: ' + q.answer : ''}${options.length ? ', Options: ' + options.join(', ') : ''})`;
            }).join('\n')}\n\n## Epics\n${(projectData.epics || []).map(e => `- ${e.name}: ${e.requirementIds.map(id => projectData.requirements.find(r => r.internalId === id)?.id).join(', ')}`).join('\n')}\n\n## Prompt History\n${projectData.promptHistory.join('\n')}\n\n## Stopped Topics\n${projectData.stoppedTopics.join(', ')}`;
            await fs.writeFile(filePath, mdContent);
        } catch (error) {
            console.error('Error in updateMarkdown:', error.message, error.stack);
            throw error;
        }
    }
}

module.exports = { BusinessAnalystAgent };