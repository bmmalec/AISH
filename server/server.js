const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { BusinessAnalystAgent } = require('./ba-agent');
const azureDevOpsAPI = require('./azure-devops');
const WireframeGenerator = require('./wireframe-generator');
const Orchestrator = require('./services/orchestrator');
require('dotenv').config();

const app = express();
const port = 3000;
const baAgent = new BusinessAnalystAgent();
const wireframeGenerator = new WireframeGenerator(baAgent);
const orchestrator = new Orchestrator(baAgent); // Pass Grok instance
const WIREFRAMES_DIR = process.env.WIREFRAMES_DIR || './wireframes';

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let projectFile = path.join(__dirname, 'documents/project.json');
let mdFile = path.join(__dirname, 'documents/project.md');

app.post('/api/submit', async (req, res) => {
    try {
        const { projectName, vision, scope } = req.body;
        projectFile = path.join(__dirname, 'documents', `${projectName}.json`);
        mdFile = path.join(__dirname, 'documents', `${projectName}.md`);
        const projectData = await baAgent.processVisionAndScope(projectName, vision, scope);
        await fs.writeJson(projectFile, projectData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, projectData);
        res.status(200).send('Project initialized');
    } catch (error) {
        console.error('Submit Error:', error.message);
        res.status(500).json({ error: 'Failed to process submission' });
    }
});

app.post('/api/answer', async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        const projectData = await fs.readJson(projectFile);
        const updatedData = await baAgent.processAnswer(projectData, questionId, answer);
        await fs.writeJson(projectFile, updatedData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, updatedData);
        res.status(200).send('Answer processed');
    } catch (error) {
        console.error('Answer Error:', error.message);
        res.status(500).json({ error: 'Failed to process answer' });
    }
});

app.post('/api/stop-questions', async (req, res) => {
    try {
        const { questionId } = req.body;
        const projectData = await fs.readJson(projectFile);
        const updatedData = baAgent.stopQuestionLine(projectData, questionId);
        await fs.writeJson(projectFile, updatedData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, updatedData);
        res.status(200).send('Question line stopped');
    } catch (error) {
        console.error('Stop Questions Error:', error.message);
        res.status(500).json({ error: 'Failed to stop questions' });
    }
});

app.post('/api/add-requirements', async (req, res) => {
    try {
        const { prompt } = req.body;
        const projectData = await fs.readJson(projectFile);
        const updatedData = await baAgent.addRequirements(projectData, prompt);
        await fs.writeJson(projectFile, updatedData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, updatedData);
        res.status(200).send('Requirements added');
    } catch (error) {
        console.error('Add Requirements Error:', error.message);
        res.status(500).json({ error: 'Failed to add requirements' });
    }
});

app.post('/api/clarify-requirement', async (req, res) => {
    try {
        const { reqId, prompt } = req.body;
        const projectData = await fs.readJson(projectFile);
        const updatedData = await baAgent.clarifyRequirement(projectData, reqId, prompt);
        await fs.writeJson(projectFile, updatedData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, updatedData);
        res.status(200).send('Requirement clarified');
    } catch (error) {
        console.error('Clarify Requirement Error:', error.message);
        res.status(500).json({ error: 'Failed to clarify requirement' });
    }
});

app.post('/api/add-epic', async (req, res) => {
    try {
        const { epicName, requirementIds } = req.body;
        const projectData = await fs.readJson(projectFile);
        if (!projectData.epics) projectData.epics = [];
        projectData.epics.push({ name: epicName, requirementIds });
        projectData.requirements.forEach(r => {
            if (requirementIds.includes(r.internalId)) r.epic = epicName;
        });
        await fs.writeJson(projectFile, projectData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, projectData);
        res.status(200).send('Epic added');
    } catch (error) {
        console.error('Add Epic Error:', error.message);
        res.status(500).json({ error: 'Failed to add epic' });
    }
});

app.get('/api/review', async (req, res) => {
    try {
        const projectData = await fs.readJson(projectFile);
        res.json({
            projectName: projectData.projectName,
            requirements: projectData.requirements,
            questions: projectData.questions,
            epics: projectData.epics || [],
            promptHistory: projectData.promptHistory
        });
    } catch (error) {
        console.error('Review Error:', error.message);
        res.status(500).json({ error: 'Failed to load review data' });
    }
});

app.get('/api/list-projects', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, 'documents'));
        const jsonFiles = files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
        res.json(jsonFiles);
    } catch (error) {
        console.error('List Projects Error:', error.message);
        res.status(500).json({ error: 'Failed to list projects' });
    }
});

app.post('/api/load-existing', async (req, res) => {
    try {
        const { projectName } = req.body;
        projectFile = path.join(__dirname, 'documents', `${projectName}.json`);
        mdFile = path.join(__dirname, 'documents', `${projectName}.md`);
        if (await fs.pathExists(projectFile)) {
            res.status(200).send('Project loaded');
        } else {
            res.status(404).json({ error: `Project ${projectName} not found` });
        }
    } catch (error) {
        console.error('Load Existing Error:', error.message);
        res.status(500).json({ error: 'Failed to load existing project' });
    }
});


app.post('/api/add-epic', async (req, res) => {
    try {
        const { epicName, requirementIds } = req.body;
        const projectData = await fs.readJson(projectFile);
        if (!projectData.epics) projectData.epics = [];
        projectData.epics.push({ name: epicName, requirementIds });
        projectData.requirements.forEach(r => {
            if (requirementIds.includes(r.internalId)) r.epic = epicName;
        });
        await fs.writeJson(projectFile, projectData, { spaces: 2 });
        await baAgent.updateMarkdown(mdFile, projectData);
        res.status(200).send('Epic added');
    } catch (error) {
        console.error('Add Epic Error:', error.message);
        res.status(500).json({ error: 'Failed to add epic' });
    }
});

app.post('/api/add-epic-to-devops', async (req, res) => {
    try {
        const { epicName, requirementIds } = req.body;
        const projectData = await fs.readJson(projectFile);
        const epicRequirements = projectData.requirements.filter(r => requirementIds.includes(r.internalId));
        const description = `Requirements:\n${epicRequirements.map(r => `${r.id}: ${r.text}`).join('\n')}`;
        
        const devOpsEpic = await azureDevOpsAPI.createWorkItem('Epic', epicName, description);
        const epicIndex = projectData.epics.findIndex(e => e.name === epicName);
        if (epicIndex !== -1) {
            projectData.epics[epicIndex].devOpsId = devOpsEpic.id;
            await fs.writeJson(projectFile, projectData, { spaces: 2 });
            await baAgent.updateMarkdown(mdFile, projectData);
        }
        res.status(200).json({ devOpsId: devOpsEpic.id });
    } catch (error) {
        console.error('Add Epic to DevOps Error:', error.message);
        res.status(500).json({ error: 'Failed to add epic to DevOps' });
    }
});

app.post('/api/generate-wireframe', async (req, res) => {
    try {
        const { requirement, wireframeName, previousVersion } = req.body;
        if (!wireframeName) throw new Error('Wireframe name is required');
        const { filename, screenshotFilename, version } = await wireframeGenerator.generateWireframe(requirement, wireframeName, previousVersion);
        res.status(200).json({ filename, screenshotFilename, version });
    } catch (error) {
        console.error('Generate Wireframe Error:', error.message);
        res.status(500).json({ error: 'Failed to generate wireframe' });
    }
});

app.get('/api/wireframe-versions', async (req, res) => {
    try {
        const { baseFilename } = req.query;
        const versions = await wireframeGenerator.listVersions(baseFilename);
        res.status(200).json(versions);
    } catch (error) {
        console.error('List Wireframe Versions Error:', error.message);
        res.status(500).json({ error: 'Failed to list wireframe versions' });
    }
});


// Updated route to serve files from WIREFRAMES_DIR
app.get('/wireframe/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(WIREFRAMES_DIR, filename);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath, { root: process.cwd() });
    } else {
        res.status(404).send('Wireframe not found');
    }
});

// Serve wireframe-viewer page
app.get('/wireframe-viewer', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/wireframe-viewer.html'));
});

// Agent endpoints
const requirementAnalyst = require('./controllers/requirement-analyst');
const systemDesign = require('./controllers/system-design');
const screenDesign = require('./controllers/screen-design');
const artifactGeneration = require('./controllers/artifact-generation');

app.post('/api/analyze-requirement', requirementAnalyst.categorizeRequirement);
app.post('/api/decompose-system', systemDesign.decomposeSystem);
app.post('/api/map-requirements', systemDesign.mapRequirements);
app.post('/api/identify-screens', screenDesign.identifyScreens);
app.post('/api/generate-wireframe', artifactGeneration.generateWireframe);

app.get('/wireframe/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(WIREFRAMES_DIR, filename);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath, { root: process.cwd() });
    } else {
        res.status(404).send('Wireframe not found');
    }
});

// Updated orchestration endpoint to handle multiple requirements
app.post('/api/orchestrate', async (req, res) => {
    const { requirements } = req.body;

    if (!Array.isArray(requirements) || requirements.length === 0) {
        return res.status(400).json({ error: 'Requirements must be a non-empty array' });
    }

    requirements.forEach((requirement, index) => {
        orchestrator.enqueue({
            name: `analyze-${index}`,
            data: { requirement },
            next: [
                {
                    name: `decompose-${index}`,
                    data: { requirements: null },
                    next: [
                        {
                            name: `map-${index}`,
                            data: { requirements: null, components: null },
                            next: [
                                {
                                    name: `identify-${index}`,
                                    data: { requirements: null, components: null },
                                    next: [
                                        {
                                            name: `generate-${index}`,
                                            data: { screens: null }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    });

    try {
        const results = await orchestrator.processQueue();
        res.status(200).json(results);
    } catch (error) {
        console.error('Orchestration Error:', error);
        res.status(500).json({ error: 'Failed to orchestrate tasks', details: error.message });
    }
});

const workitemCreator = require('./workitemCreator');

app.post('/api/create-workitems', async (req, res) => {
    try {
        const { epicName } = req.body;
        if (!epicName) {
            return res.status(400).json({ error: 'epicName is required' });
        }
        const result = await workitemCreator.createWorkItems(epicName);
        res.status(200).json(result);
    } catch (error) {
        console.error('Create Work Items Error:', error.message);
        res.status(500).json({ error: 'Failed to create work items' });
    }
});

app.get('/api/download/json', (req, res) => res.download(projectFile));
app.get('/api/download/md', (req, res) => res.download(mdFile));

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));