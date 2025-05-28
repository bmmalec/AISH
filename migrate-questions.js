const fs = require('fs-extra');
const path = require('path');

/**
 * Migration script to move questions from separate array into nested arrays within requirements
 */
class QuestionMigration {
    constructor() {
        this.documentsDir = path.join(__dirname, 'server/documents');
    }

    async migrateAllProjects() {
        console.log('Starting migration of questions to nested structure...');
        
        try {
            const files = await fs.readdir(this.documentsDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            
            for (const file of jsonFiles) {
                await this.migrateProject(file);
            }
            
            console.log('Migration completed successfully!');
        } catch (error) {
            console.error('Migration failed:', error);
        }
    }

    async migrateProject(filename) {
        const filepath = path.join(this.documentsDir, filename);
        console.log(`Migrating ${filename}...`);

        try {
            const projectData = await fs.readJson(filepath);
            
            // Skip if already migrated (no separate questions array)
            if (!projectData.questions || !Array.isArray(projectData.questions)) {
                console.log(`${filename} already migrated or has no questions`);
                return;
            }

            // Initialize questions array for each requirement
            if (projectData.requirements) {
                projectData.requirements.forEach(req => {
                    if (!req.questions) {
                        req.questions = [];
                    }
                });
            }

            // Process existing questions
            const orphanedQuestions = [];
            
            if (projectData.questions.length > 0) {
                for (const question of projectData.questions) {
                    const associatedReq = this.findAssociatedRequirement(question, projectData.requirements);
                    
                    if (associatedReq) {
                        // Update question ID to include requirement reference
                        const newQuestionId = `Q-${associatedReq.id}-${associatedReq.questions.length + 1}`;
                        const migratedQuestion = {
                            ...question,
                            id: newQuestionId
                        };
                        associatedReq.questions.push(migratedQuestion);
                        console.log(`  Moved question ${question.id} to requirement ${associatedReq.id}`);
                    } else {
                        // Keep orphaned questions for manual review
                        orphanedQuestions.push(question);
                        console.log(`  Question ${question.id} could not be associated with a requirement`);
                    }
                }
            }

            // Handle orphaned questions by creating a general requirement or keeping them separate
            if (orphanedQuestions.length > 0) {
                console.log(`  ${orphanedQuestions.length} orphaned questions found`);
                // For now, we'll keep them in a separate section for manual review
                projectData.orphanedQuestions = orphanedQuestions;
            }

            // Create backup
            const backupPath = filepath.replace('.json', '_backup.json');
            await fs.copy(filepath, backupPath);
            console.log(`  Backup created: ${backupPath}`);

            // Remove the old questions array
            delete projectData.questions;
            
            // Save migrated data
            await fs.writeJson(filepath, projectData, { spaces: 2 });
            console.log(`  ${filename} migrated successfully`);

        } catch (error) {
            console.error(`Failed to migrate ${filename}:`, error);
        }
    }

    findAssociatedRequirement(question, requirements) {
        if (!requirements || !question.topic) return null;

        // Try to find requirement by topic matching
        const topicMatches = {
            'user management': ['user', 'account', 'registration', 'member'],
            'family management': ['family', 'invite', 'member'],
            'chore management': ['chore', 'task', 'assign', 'priority'],
            'data handling': ['sync', 'data', 'storage', 'offline'],
            'common chores': ['chore', 'list', 'household']
        };

        const topicKeywords = topicMatches[question.topic.toLowerCase()] || [question.topic.toLowerCase()];
        
        // Find requirement that contains related keywords
        for (const req of requirements) {
            const reqText = req.text.toLowerCase();
            if (topicKeywords.some(keyword => reqText.includes(keyword))) {
                return req;
            }
        }

        // If no topic match, try to match by question content
        const questionText = question.text.toLowerCase();
        for (const req of requirements) {
            const reqText = req.text.toLowerCase();
            // Look for common words (excluding common stop words)
            const questionWords = questionText.split(' ').filter(word => 
                word.length > 3 && !['should', 'would', 'could', 'what', 'how', 'when', 'where', 'the', 'and', 'for', 'with'].includes(word)
            );
            
            if (questionWords.some(word => reqText.includes(word))) {
                return req;
            }
        }

        return null;
    }
}

// Run migration if called directly
if (require.main === module) {
    const migration = new QuestionMigration();
    migration.migrateAllProjects();
}

module.exports = QuestionMigration;