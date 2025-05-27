const axios = require('axios');
require('dotenv').config();

const AZURE_DEVOPS_ORG = process.env.AZURE_DEVOPS_ORG;
const AZURE_DEVOPS_PROJECT = process.env.AZURE_DEVOPS_PROJECT;
const AZURE_DEVOPS_PAT = process.env.AZURE_DEVOPS_PAT;
const BASE_URL = `https://dev.azure.com/${AZURE_DEVOPS_ORG}`;

const headers = {
    'Authorization': `Basic ${Buffer.from(`:${AZURE_DEVOPS_PAT}`).toString('base64')}`,
    'Content-Type': 'application/json-patch+json'
};

class AzureDevOpsAPI {
    async createWorkItem(type, title, description = '', assignedAIAgent = null, parentId = null) {
        const url = `${BASE_URL}/${AZURE_DEVOPS_PROJECT}/_apis/wit/workitems/$${type}?api-version=7.1`;
        const body = [
            { op: 'add', path: '/fields/System.Title', value: title },
            { op: 'add', path: '/fields/System.Description', value: description }
        ];

        if (assignedAIAgent) {
            body.push({ op: 'add', path: '/fields/Custom.AssignedAIAgent', value: assignedAIAgent });
        }

        if (parentId) {
            const parentUrl = `${BASE_URL}/_apis/wit/workItems/${parentId}`;
            body.push({
                op: 'add',
                path: '/relations/-',
                value: {
                    rel: 'System.LinkTypes.Hierarchy-Reverse',
                    url: parentUrl,
                    attributes: { comment: 'Parent relation' }
                }
            });
        }

        try {
            const response = await axios.post(url, body, { headers });
            return response.data;
        } catch (error) {
            console.error('Error creating work item:', error.response?.data || error.message);
            throw error;
        }
    }

    async getWorkItem(id) {
        const url = `${BASE_URL}/${AZURE_DEVOPS_PROJECT}/_apis/wit/workitems/${id}?api-version=7.1`;
        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            console.error('Error retrieving work item:', error.response?.data || error.message);
            throw error;
        }
    }

    async updateWorkItem(id, updates) {
        const url = `${BASE_URL}/${AZURE_DEVOPS_PROJECT}/_apis/wit/workitems/${id}?api-version=7.1`;
        try {
            const response = await axios.patch(url, updates, { headers });
            return response.data;
        } catch (error) {
            console.error('Error updating work item:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new AzureDevOpsAPI();