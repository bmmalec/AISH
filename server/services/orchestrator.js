const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Define the wireframes directory
const WIREFRAMES_DIR = path.join(__dirname, 'wireframe');

class Orchestrator {
    constructor(grok) {
        this.queue = [];
        this.baseUrl = 'http://localhost:3000'; // Adjust as needed
        this.grok = grok; // Grok instance passed from server.js
        // Ensure the wireframes directory exists
        fs.ensureDirSync(WIREFRAMES_DIR);
    }

    enqueue(task) {
        this.queue.push(task);
    }

    async processQueue() {
        const results = {};
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            console.log(`Executing task: ${task.name} with data:`, task.data);
            try {
                const result = await this.executeTask(task, results);
                results[task.name] = result;
                console.log(`Result for ${task.name}:`, result);

                // Write result to Markdown file
                await this.writeToMarkdown(task, result);

                if (task.next) {
                    let previousResult = result;
                    let previousRequirements = task.name.includes('analyze') ? result : null;
                    for (const nextTask of task.next) {
                        const updatedData = { ...nextTask.data };
                        if (nextTask.data.requirements === null) {
                            updatedData.requirements = previousRequirements || results[`analyze-${task.name.split('-')[1]}`];
                        }
                        if (nextTask.data.components === null && task.name.includes('decompose')) {
                            updatedData.components = previousResult;
                        }
                        if (nextTask.data.screens === null && task.name.includes('identify')) {
                            updatedData.screens = previousResult;
                        }

                        nextTask.data = updatedData;
                        console.log(`Processing next task: ${nextTask.name} with updated data:`, nextTask.data);

                        const nextResult = await this.executeTask(nextTask, results);
                        results[nextTask.name] = nextResult;
                        console.log(`Result for ${nextTask.name}:`, nextResult);

                        // Write next task result to Markdown file
                        await this.writeToMarkdown(nextTask, nextResult);

                        previousResult = nextResult;

                        if (nextTask.next) {
                            let nestedPreviousResult = nextResult;
                            for (const nestedTask of nextTask.next) {
                                const nestedData = { ...nestedTask.data };
                                if (nestedData.requirements === null) {
                                    nestedData.requirements = previousRequirements || results[`analyze-${task.name.split('-')[1]}`];
                                }
                                if (nestedData.components === null && nextTask.name.includes('decompose')) {
                                    nestedData.components = nestedPreviousResult;
                                }
                                if (nestedData.screens === null && nextTask.name.includes('identify')) {
                                    nestedData.screens = nestedPreviousResult;
                                }

                                nestedTask.data = nestedData;
                                console.log(`Processing nested task: ${nestedTask.name} with updated data:`, nestedTask.data);
                                const nestedResult = await this.executeTask(nestedTask, results);
                                results[nestedTask.name] = nestedResult;
                                console.log(`Result for ${nestedTask.name}:`, nestedResult);

                                // Write nested task result to Markdown file
                                await this.writeToMarkdown(nestedTask, nestedResult);

                                nestedPreviousResult = nestedResult;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed task ${task.name}:`, error.response ? error.response.data : error.message);
                throw error;
            }
        }
        return results;
    }

    async writeToMarkdown(task, result) {
        // Use epicName from task.data, default to 'default-epic' if not provided
        const epicName = task.data.epicName || 'default-epic';
        const filePath = path.join(WIREFRAMES_DIR, `${epicName}.md`);

        // Format the result as a string (handle JSON or plain text)
        let resultString = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;

        // Prepare Markdown content
        const markdownContent = `## ${task.name}\n\`\`\`\n${resultString}\n\`\`\`\n\n`;

        // Append to the file (creates it if it doesn't exist)
        await fs.appendFile(filePath, markdownContent);
        console.log(`Wrote ${task.name} result to ${filePath}`);
    }

    async executeTask(task, previousResults) {
        const { name, data } = task;
        let prompt;

        switch (true) {
            case name.includes('analyze'):
                prompt = `Given the requirement: "${data.requirement.description}" (Benefit: ${data.requirement.benefit}, Objective: ${data.requirement.objective}, Value: ${data.requirement.value}), categorize it by functionality (e.g., UI, Data, Integration). Return only the JSON array with one object containing id, category, description, benefit, objective, and value. Preserve the original id if provided.`;
                break;
            case name.includes('decompose'):
                prompt = `Given the requirements: ${JSON.stringify(data.requirements)}, decompose the system into components (frontend, backend, database). Return a JSON array of component objects with frontend (e.g., screen.html), backend (e.g., service.js), and database (e.g., model name) fields.`;
                break;
            case name.includes('map'):
                prompt = `Given the requirements: ${JSON.stringify(data.requirements)} and components: ${JSON.stringify(data.components)}, create a traceability matrix linking each requirement to its components. Return a JSON array of objects with reqId and component fields.`;
                break;
            case name.includes('identify'):
                prompt = `Given the requirements: ${JSON.stringify(data.requirements)} and components: ${JSON.stringify(data.components)}, identify UI screens needed. Return a JSON array of screen objects with name, purpose, and reqId fields for UI-related requirements.`;
                break;
            case name.includes('generate'):
                prompt = `Given the screens: ${JSON.stringify(data.screens)}, generate an HTML5 wireframe with inline CSS for the first screen. Follow a simple layout with header, sidebar, main content, and footer. Return the HTML code as a plain string. Save it to public/${data.screens[0].name}-v1.html.`;
                break;
            default:
                throw new Error(`Unknown task: ${name}`);
        }

        try {
            const response = await this.grok.callGrok(prompt);
            const result = response.data.choices[0].message.content.trim().replace(/```json\n|```/g, '');

            // For generate task, save wireframe to file (keeping original behavior)
            if (name.includes('generate')) {
                const filename = `${data.screens[0].name}-v1.html`;
                await fs.writeFile(`public/${filename}`, result);
                return { filename };
            }

            return result;
        } catch (error) {
            throw new Error(`Task ${name} failed: ${error.message}`);
        }
    }
}

module.exports = Orchestrator;