# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Start the server:**
```bash
npm start
```

**Install dependencies:**
```bash
npm install
```

The application runs on http://localhost:3000 by default.

## Architecture Overview

AISH (AI Stakeholder Helper) is a web-based platform for managing software project requirements through AI-powered business analysis. The system consists of:

### Core Components

**Frontend (Single Page Application):**
- `public/index.html` - Main interface with tabbed layout for requirements, epics, and questions
- `public/script.js` - Client-side logic handling project management, requirement processing, and API interactions
- Bootstrap-based responsive UI with sidebar navigation

**Backend (Express.js Server):**
- `server/server.js` - Main API server with RESTful endpoints
- `server/ba-agent.js` - Business Analyst Agent with multi-provider AI support for requirement analysis
- `server/services/ai-provider.js` - Multi-provider AI service supporting Claude, Grok, and OpenAI
- `server/services/orchestrator.js` - Task orchestration system for multi-step workflows
- `server/wireframe-generator.js` - HTML wireframe generation using Puppeteer for screenshots

### Key Workflows

**Project Initialization:**
1. User submits project vision and scope
2. BA Agent generates initial requirements and follow-up questions via selected AI provider
3. Data stored as JSON in `server/documents/` with corresponding Markdown files

**Requirement Management:**
- Interactive Q&A system with stakeholders
- AI-powered requirement clarification and expansion
- Epic creation by grouping related requirements
- Integration with Azure DevOps for work item creation

**Wireframe Generation:**
- AI-generated HTML wireframes based on requirements
- Automated screenshot capture using Puppeteer
- Version control for iterative wireframe refinement
- Files stored in `wireframe/` directory

### Data Flow

1. **Project Data:** JSON files in `server/documents/` (e.g., `ProjectName.json`)
2. **Wireframes:** HTML files and PNG screenshots in `wireframe/`
3. **API Integration:** Multi-provider AI support (Claude/Grok/OpenAI), Azure DevOps for work item management

### Environment Variables

Required in `.env`:
- `AI_PROVIDER` - Choose AI provider: 'claude', 'grok', or 'openai' (default: 'claude')
- `MAX_TOKENS` - Maximum tokens for AI responses (default: 4096)
- `WIREFRAMES_DIR` - Directory for wireframe storage (default: './wireframes')

**Claude Configuration:**
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `CLAUDE_MODEL` - Claude model version (default: 'claude-3-5-sonnet-20241022')

**Grok Configuration:**
- `XAI_API_KEY` - X.AI Grok API key
- `GROK_MODEL` - Grok model version (default: 'grok-2-1212')

**OpenAI Configuration:**
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - OpenAI model version (default: 'gpt-4-turbo-preview')

**Azure DevOps Integration:**
- Azure DevOps credentials for work item management

### Agent Controllers

The `server/controllers/` directory contains specialized agents:
- `requirement-analyst.js` - Requirement categorization
- `system-design.js` - System decomposition and mapping
- `screen-design.js` - Screen identification
- `artifact-generation.js` - Wireframe generation

### AI Provider Management

**Multi-Provider Support:**
- Switch between Claude, Grok, and OpenAI via `AI_PROVIDER` environment variable
- Runtime provider switching via API endpoints
- Automatic cost tracking and usage logging for all providers

**Cost Tracking:**
- Token usage logging in `server/logs/ai-usage.log`
- Global statistics in `server/logs/ai-stats.json`
- Per-provider cost calculations based on current pricing
- API endpoints: `GET /api/ai-stats` and `POST /api/ai-provider`

**Supported Models:**
- Claude: claude-3-5-sonnet-20241022 (default)
- Grok: grok-2-1212 (default)
- OpenAI: gpt-4-turbo-preview (default)

### Project Structure Note

The application maintains project state through JSON files that are continuously updated as users interact with the system. Each project has both structured JSON data and human-readable Markdown output for documentation purposes.