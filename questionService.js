const fs = require('fs');
const path = require('path');

function getDocumentContent(projectId) {
    const filePath = path.join(__dirname, 'documents', `${projectId}.md`);
    return fs.readFileSync(filePath, 'utf-8');
}

function processQuestion(documentContent, question) {
    // Placeholder for processing logic
    // Implement your logic to analyze the document and answer the question
    return "This is a placeholder answer.";
}

module.exports = {
    getDocumentContent,
    processQuestion
};
