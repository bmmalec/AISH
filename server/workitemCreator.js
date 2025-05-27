const fs = require('fs');
const path = require('path');
const azureDevOpsAPI = require('./azure-devops');
const WIREFRAMES_DIR = process.env.WIREFRAMES_DIR || './wireframes';

function parseMarkdown(markdown) {
    try{
        const sections = {};
        let currentSection = null;
        const lines = markdown.split('\n');
        
        lines.forEach(line => {
            if (line.startsWith('## ')) {
                currentSection = line.substring(3).trim();
                sections[currentSection] = '';
            } else if (currentSection) {
                sections[currentSection] += line + '\n';
            }
        });
    
        const data = {};
        for (const section in sections) {
            const match = section.match(/(analyze|decompose|map)-(\d+)/);
            if (match) {
                const type = match[1];
                const index = match[2];
                if (!data[index]) data[index] = {};
                const content = sections[section];
                const jsonContent = extractJsonFromSection(content);
                data[index][type] = jsonContent;
            }
        }
        return data;
    
    } catch(error){
        throw new Error(`Failed to reading Markdown: ${error.message}`);
    }
}

function extractJsonFromSection(content) {
    const codeBlockMatch = content.match(/```(.*?)```/s);
    if (!codeBlockMatch) throw new Error('No code block found in section');
    const codeBlock = codeBlockMatch[1].trim();

    // Find JSON boundaries
    const startIndex = codeBlock.search(/[{[]/);
    if (startIndex === -1) throw new Error('No JSON object or array found');
    const endIndex = Math.max(codeBlock.lastIndexOf('}'), codeBlock.lastIndexOf(']'));
    if (endIndex === -1) throw new Error('No closing bracket found');

    const jsonString = codeBlock.substring(startIndex, endIndex + 1);
    console.log('Extracted JSON string:', jsonString); // Log for verification

    try {
        return parseJsonWithComments(jsonString);
    } catch (error) {
        throw new Error(`Failed to parse JSON in section: ${error.message}`);
    }
}

function parseJsonWithComments(jsonString) {
    // Remove single-line comments (// comment)
    const cleanedString = jsonString.replace(/\/\/.*$/gm, '');
    
    // Parse the cleaned JSON
    try {
        return JSON.parse(cleanedString);
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${error.message}`);
    }
}

function getComponentNames(components, key) {
    if (!components[key]) return [];
    return components[key].map(item => typeof item === 'string' ? item : item.name || item.file || 'unknown');
}

async function createWorkItems(epicName) {
    const markdownPath = path.join(WIREFRAMES_DIR, `${epicName}.md`);
    if (!fs.existsSync(markdownPath)) {
        throw new Error(`Markdown file for epic ${epicName} not found`);
    }
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    const data = parseMarkdown(markdown);

    // Create Epic
    const epicDescription = 'Build a system to manage family chores, enabling user registration, family creation, chore logging, assignment, and visibility control, with offline support and custom lists for enhanced coordination and privacy.';
    const epic = await azureDevOpsAPI.createWorkItem('Epic', epicName, epicDescription, 'Product Owner');
    const epicId = epic.id;

    // Create Feature under Epic
    const featureDescription = 'Deliver the core capabilities of the Family Chore Management System, including user authentication, family management, chore management, and system features like offline support and data privacy.';
    const feature = await azureDevOpsAPI.createWorkItem('Feature', 'Implement Core Functionalities', featureDescription, 'Product Owner', epicId);
    const featureId = feature.id;

    // Process each requirement
    for (const index in data) {
        const requirement = data[index]['analyze'][0]; // Assuming single requirement per section
        const components = data[index]['decompose'][0]; // Assuming single decomposition per section

        // Create User Story
        const userStoryTitle = `Implement requirement ${requirement.id}: ${requirement.description}`;
        const userStoryDescription = `
Requirement ID: ${requirement.id}
Category: ${requirement.category}
Description: ${requirement.description}
Benefit: ${requirement.benefit}
Objective: ${requirement.objective}
Value: ${requirement.value}
        `.trim();
        const userStory = await azureDevOpsAPI.createWorkItem('User Story', userStoryTitle, userStoryDescription, 'Product Owner', featureId);
        const userStoryId = userStory.id;

        // Extract component names
        const frontendNames = getComponentNames(components, 'frontend');
        const backendNames = getComponentNames(components, 'backend');
        const databaseNames = getComponentNames(components, 'database');

        // Create Tasks
        await azureDevOpsAPI.createWorkItem('Task', 'Create Wireframes', `Design wireframes for ${frontendNames.join(', ')}`, 'UX Designer', userStoryId);
        await azureDevOpsAPI.createWorkItem('Task', 'Define System Architecture', `Outline components: frontend (${frontendNames.join(', ')}), backend (${backendNames.join(', ')}), database (${databaseNames.join(', ')})`, 'Solution Architect', userStoryId);
        await azureDevOpsAPI.createWorkItem('Task', 'Create Technical Specifications', `Specify services and models based on decomposition`, 'Tech Lead', userStoryId);
        await azureDevOpsAPI.createWorkItem('Task', 'Implement Frontend', `Develop ${frontendNames.join(', ')}`, 'Developer Lead', userStoryId);
        await azureDevOpsAPI.createWorkItem('Task', 'Implement Backend', `Develop ${backendNames.join(', ')}`, 'Developer Lead', userStoryId);
        await azureDevOpsAPI.createWorkItem('Task', 'Set Up Database', `Create models: ${databaseNames.join(', ')}`, 'Developer Lead', userStoryId);
        await azureDevOpsAPI.createWorkItem('Task', 'Create Test Cases', `Develop test scenarios based on requirement ${requirement.id}`, 'QA Lead', userStoryId);
    }

    return { message: 'Work items created successfully' };
}

module.exports = { createWorkItems };