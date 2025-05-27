const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
require('dotenv').config();

const WIREFRAMES_DIR = process.env.WIREFRAMES_DIR || './wireframes';

class WireframeGenerator {
    constructor(grok) {
        this.grok = grok;
        fs.ensureDirSync(WIREFRAMES_DIR);
    }

    async generateWireframe(requirement, wireframeName, previousVersion = null) {
        const prompt = previousVersion 
            ? `Given the previous wireframe version at "${previousVersion}" and the requirement: "${requirement.description}" (Benefit: ${requirement.benefit}, Objective: ${requirement.objective}, Value: ${requirement.value}), refine the wireframe HTML5 code based on the correction prompt provided in the requirement. Use a simple, standard web design layout with a header, sidebar, main content, and footer. Return only the HTML5 code with inline CSS as a plain string, no extra text or comments.`
            : `Given the requirement: "${requirement.description}" (Benefit: ${requirement.benefit}, Objective: ${requirement.objective}, Value: ${requirement.value}), generate a wireframe HTML5 page for a web application. Use a simple, standard web design layout with a header, sidebar (for navigation or context), main content (for primary interaction), and footer. Include inline CSS for basic styling (e.g., layout, colors). Return only the HTML5 code as a plain string, no extra text or comments.`;

        const response = await this.grok.callGrok(prompt);
        const htmlContent = response.data.choices[0].message.content.trim();

        // Sanitize and use wireframeName as base filename
        const baseFilename = wireframeName
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, '') // Remove special characters
            .substring(0, 30); // Limit to 30 characters
        const version = await this.getNextVersion(baseFilename);
        const filename = `${baseFilename}-v${version}.html`;
        const filepath = path.join(WIREFRAMES_DIR, filename);

        await fs.writeFile(filepath, htmlContent);

        const screenshotFilename = `${baseFilename}-v${version}.png`;
        const screenshotPath = await this.captureScreenshot(filepath, screenshotFilename);

        return { filename, screenshotFilename, version };
    }

    async getNextVersion(baseFilename) {
        const files = await fs.readdir(WIREFRAMES_DIR);
        const versions = files
            .filter(f => f.startsWith(baseFilename) && f.endsWith('.html'))
            .map(f => parseInt(f.match(/v(\d+)\.html$/)[1]))
            .sort((a, b) => b - a);
        return versions.length ? versions[0] + 1 : 1;
    }

    async captureScreenshot(htmlPath, screenshotFilename) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(`file://${path.resolve(htmlPath)}`, { waitUntil: 'networkidle0' });
        const screenshotPath = path.join(WIREFRAMES_DIR, screenshotFilename);
        await page.screenshot({ path: screenshotPath });
        await browser.close();
        return screenshotPath;
    }

    async listVersions(baseFilename) {
        const files = await fs.readdir(WIREFRAMES_DIR);
        return files
            .filter(f => f.startsWith(baseFilename) && f.endsWith('.html'))
            .map(f => ({
                filename: f,
                version: parseInt(f.match(/v(\d+)\.html$/)[1]),
                screenshot: f.replace('.html', '.png')
            }))
            .sort((a, b) => a.version - b.version);
    }
}

module.exports = WireframeGenerator;