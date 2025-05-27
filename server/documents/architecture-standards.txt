# Architecture Standards Document

## 1. Purpose
This document defines the architectural standards and best practices for creating a modern web application solution using HTML5, JavaScript, Node.js, and MongoDB. It employs a simple MVC (Model-View-Controller) pattern, integrates theming for consistent UI, and emphasizes modularity by separating concerns into distinct directories and isolated modules. The architecture supports stakeholder requirement capture, wireframe generation, and integration with external services (e.g., Azure DevOps).

---

## 2. Technology Stack
- **HTML5**: Structure and semantics for web pages.
- **JavaScript**: Client-side interactivity and server-side logic.
- **Node.js**: Server-side runtime for API and service execution.
- **MongoDB**: NoSQL database for flexible data storage.
- **Theming**: CSS-based design system for consistent look and feel.

---

## 3. General Principles
- **Modularity**: Isolate functionality into reusable modules (e.g., database, services, utilities).
- **Separation of Concerns**: Divide web pages (views), services (controllers), and data (models) into separate directories.
- **Simplicity**: Favor straightforward implementations over complex abstractions unless scalability demands otherwise.
- **Scalability**: Design for easy extension (e.g., new pages, services) without major refactoring.
- **Maintainability**: Use clear naming, consistent structure, and documentation.

---

## 4. Directory Structure
The solution follows a modular MVC structure with separate directories for web pages and services:

project-root/
├── public/              # Static web pages (Views)
│   ├── index.html       # Main requirements page
│   ├── wireframe-viewer.html # Wireframe generation page
│   ├── style.css        # Global theming styles
│   └── script.js        # Client-side JavaScript (shared or per-page)
├── server/              # Server-side code (Controllers & Models)
│   ├── controllers/     # Service logic (API endpoints)
│   │   ├── requirements.js # Handles requirement-related endpoints
│   │   ├── wireframes.js   # Handles wireframe generation endpoints
│   │   └── devops.js       # Azure DevOps integration
│   ├── models/          # Data models and database access
│   │   ├── project.js   # Project schema and MongoDB operations
│   │   └── wireframe.js # Wireframe metadata (optional)
│   ├── services/        # Business logic modules
│   │   ├── db.js        # MongoDB connection and utilities
│   │   └── grok.js      # Grok API interaction
│   └── server.js        # Main server entry point
├── wireframes/          # Generated wireframe files
├── documents/           # Project JSON/Markdown files
├── node_modules/        # Dependencies
├── .env                 # Environment variables
└── package.json         # Project metadata and scripts

## 5. MVC Architecture
### 5.1. Model (Data Layer)
- **Location**: `server/models/`
- **Purpose**: Define data schemas and handle MongoDB interactions.
- **Standards**:
  - Use Mongoose for schema definition and validation.
  - Each model in its own file (e.g., `project.js`).
  - Export CRUD operations (create, read, update, delete).
- **Example**: `server/models/project.js`
  ```javascript
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const ProjectSchema = new Schema({
      projectName: { type: String, required: true },
      vision: String,
      scope: String,
      requirements: [{ description: String, benefit: String, objective: String, value: String, epic: String }]
  });

  module.exports = mongoose.model('Project', ProjectSchema);

  5.2. View (Presentation Layer)

 Location: public/
 Purpose: Render HTML5 pages with client-side interactivity.
 Standards:
 Use HTML5 semantic tags (<header>, <main>, <footer>).
 Leverage Bootstrap 5 for responsive design and components.
 Inline or external CSS (via style.css) for theming.
 Client-side JS in script.js or per-page scripts.
 Theming:
 Colors: #f8f9fa (background), #343a40 (sidebar), #007bff (accent).
 Typography: 'Segoe UI', Arial, sans-serif, 14px body, 20px headings.
 Components: Buttons (blue, 100x40px), cards (shadowed, white).

<div class="wrapper">
    <nav id="sidebar" class="sidebar">...</nav>
    <div id="content" class="container-fluid">...</div>
</div>

5.3. Controller (Logic Layer)
Location: server/controllers/
Purpose: Handle API requests, orchestrate services, and interact with models.
Standards:
Each controller in its own file (e.g., requirements.js).
RESTful endpoints (e.g., POST /api/submit, GET /api/review).
Use async/await for handling asynchronous operations.
Example: server/controllers/requirements.js

const Project = require('../models/project');

exports.submitProject = async (req, res) => {
    const { projectName, vision, scope } = req.body;
    const project = new Project({ projectName, vision, scope });
    await project.save();
    res.status(200).send('Project created');
};

6. Module Isolation
Services: server/services/
db.js: MongoDB connection and utility functions.
javascript
const mongoose = require('mongoose');
module.exports.connect = async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
};
grok.js: Grok API interaction module.
javascript
const axios = require('axios');
module.exports.callGrok = async (prompt) => {
    return axios.post('https://api.x.ai/v1/chat/completions', { messages: [{ role: 'user', content: prompt }], ... });
};
Standards:
Export single-purpose functions or classes.
Avoid tight coupling with controllers/models where possible.
Use environment variables (via .env) for configuration.

## 7. Theming Standards
- **File**: `public/style.css`
- **Rules**:
  - Base: Light gray background (#f8f9fa), dark gray sidebar (#343a40).
  - Accent: Blue (#007bff) for buttons/links, hover #e9ecef.
  - Typography: `'Segoe UI', Arial, sans-serif`, 14px body, 20px h1, 16px h3.
  - Responsive: Media queries collapse sidebar <768px.
- **Example**:
  ```css
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; }
  .sidebar { background: #343a40; color: #fff; width: 250px; }
  .content { flex: 1; padding: 20px; }
  button { background: #007bff; color: #fff; }
  @media (max-width: 768px) { .sidebar { display: none; } }
### Section 8: Web Pages
## 8. Web Pages
- **Location**: `public/`
- **Pages**:
  - `index.html`: Requirements capture and review.
  - `wireframe-viewer.html`: Wireframe generation and preview.
- **Standards**:
  - Semantic HTML5 structure.
  - Bootstrap 5 for layout/components (via CDN).
  - Single-page design with tabs (e.g., Requirements, Epics).
  - Client-side JS handles interactivity and API calls.
## 9. Services (API Endpoints)
- **Location**: `server/controllers/`
- **Standards**:
  - RESTful: GET for retrieval, POST for creation/updates.
  - JSON responses with status codes (200 OK, 500 Error).
  - Error handling with try/catch and meaningful messages.
- **Examples**:
  - `/api/submit`: Create project.
  - `/api/generate-wireframe`: Generate wireframe HTML.
## 10. MongoDB Integration
- **Connection**: Managed in `server/services/db.js`.
- **Schema**: Defined in `server/models/` (e.g., `project.js`).
- **Usage**: Controllers call model methods (e.g., `Project.find()`, `Project.save()`).
- **Standards**:
  - Use environment variable `MONGO_URI` for connection string.
  - Index fields for performance (e.g., `projectName`).
  - Store wireframe metadata if needed (e.g., filename, version).
## 11. Best Practices
- **Code Style**: CamelCase for JS variables/functions, kebab-case for filenames/CSS classes.
- **Error Handling**: Log errors server-side, return user-friendly messages client-side.
- **Environment Variables**: Store sensitive data (e.g., `MONGO_URI`, `XAI_API_KEY`) in `.env`.
- **Modularity**: Isolate reusable logic (e.g., Grok API calls) in services.
- **Documentation**: Inline comments for complex logic, README for setup.
## 12. Usage by AI Agent
- **Context**: Provide this document to the AI agent as architectural guidance.
- **Instruction**: "Generate a solution following the Architecture Standards Document for the given requirement. Include HTML5 pages in `public/`, Node.js services in `server/controllers/`, and MongoDB models in `server/models/`. Use the specified theming and MVC structure."
- **Input**: Requirement (description, benefit, objective, value).
- **Output**: 
  - HTML5 page (e.g., `public/chore-assignment.html`) with inline CSS.
  - Controller (e.g., `server/controllers/chore.js`) with API endpoints.
  - Model (e.g., `server/models/chore.js`) for MongoDB.
## 13. Example Application
### Requirement
- **Description**: "Users can assign chores to family members through a simple interface."
- **Benefit**: "Reduces task assignment time by 20%."
- **Objective**: "Streamline task delegation."
- **Value**: "Improves family coordination."

### Generated Files
#### View: `public/chore-assignment.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chore Assignment</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="wrapper">
        <nav id="sidebar" class="sidebar">
            <div class="sidebar-header"><h3>Chore App</h3></div>
            <ul class="list-unstyled components">
                <li><a href="#">Members</a></li>
            </ul>
        </nav>
        <div id="content" class="container-fluid">
            <h2 class="mt-4">Assign Chore</h2>
            <div class="card p-3">
                <select id="chore"><option>Wash Dishes</option></select>
                <select id="member"><option>John</option></select>
                <button id="assign" class="btn">Assign</button>
            </div>
            <div class="card p-3 mt-3">
                <h3>Recent</h3>
                <ul id="recent"></ul>
            </div>
        </div>
    </div>
    <script src="/script.js"></script>
</body>
</html>

## Controller: server/controllers/chore.js
const Project = require('../models/project');

exports.assignChore = async (req, res) => {
    try {
        const { projectId, chore, member } = req.body;
        const project = await Project.findById(projectId);
        project.requirements.push({ description: `${member}: ${chore}` });
        await project.save();
        res.status(200).json({ message: 'Chore assigned' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
## Model: server/models/project.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    projectName: { type: String, required: true },
    requirements: [{ description: String }]
});

module.exports = mongoose.model('Project', ProjectSchema);
Service: server/services/db.js
javascript
const mongoose = require('mongoose');
module.exports.connect = async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
};

### Notes
- **MVC**: The example shows a simple MVC setup: `chore-assignment.html` (View), `chore.js` (Controller), `project.js` (Model).
- **Theming**: Applied via `style.css` (assumed to match earlier standards: dark sidebar, light content, blue accents).
- **Modularity**: Services (`db.js`) isolate database logic, controllers handle API endpoints.
- **AI Context**: The AI can use this document to structure solutions, placing files in the specified directories.

This Markdown-formatted Architecture Standards Document provides a clear blueprint for your AI agent to generate a themed, MVC-based solution with Node.js, HTML5, JavaScript, and MongoDB. Let me know if you’d like refinements!