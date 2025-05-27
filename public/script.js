let currentToFilter = 'Stakeholder';
let currentStatusFilter = 'Open';
let selectedAnswers = [];
let currentProcessFilter = null;
let currentEntityFilter = null;
let promptHistory = [];
let selectedRequirements = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadProjectOptions();
});

async function loadProjectOptions() {
    try {
        const response = await fetch('/api/list-projects');
        if (!response.ok) throw new Error(await response.text());
        const projects = await response.json();
        const select = document.getElementById('load-existing');
        select.innerHTML = '<option value="">Select a project</option>' + projects.map(p => `<option value="${p}">${p}</option>`).join('');
    } catch (error) {
        console.error('Load Projects Error:', error);
        alert('Failed to load project list: ' + error.message);
    }
}

document.getElementById('load-existing').addEventListener('change', async (e) => {
    const projectName = e.target.value;
    if (!projectName) return;

    try {
        const response = await fetch('/api/load-existing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName })
        });
        if (!response.ok) throw new Error(await response.text());
        document.getElementById('input-section').style.display = 'none';
        document.getElementById('review-section').style.display = 'block';
        await loadReview();
    } catch (error) {
        console.error('Load Error:', error);
        alert('Failed to load project: ' + error.message);
    }
});

document.getElementById('start-over').addEventListener('click', () => {
    document.getElementById('vision-form').style.display = 'block';
    document.getElementById('load-existing').style.display = 'none';
    document.getElementById('start-over').style.display = 'none';
});

document.getElementById('vision-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectNameInput = document.getElementById('project-name').value.trim();
    const vision = document.getElementById('vision').value;
    const scope = document.getElementById('scope').value;

    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(projectNameInput) || projectNameInput === '') {
        alert('Project name cannot contain < > : " / \\ | ? * or be empty');
        return;
    }
    const projectName = projectNameInput.replace(/\s+/g, '_');

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName, vision, scope })
        });
        if (!response.ok) throw new Error(await response.text());
        document.getElementById('input-section').style.display = 'none';
        document.getElementById('review-section').style.display = 'block';
        await loadReview();
    } catch (error) {
        console.error('Submit Error:', error);
        alert('Failed to submit: ' + error.message);
    }
});

document.getElementById('answer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const questionId = document.getElementById('question-select').value;
    const customAnswer = document.getElementById('answer').value.trim();
    const answer = selectedAnswers.length > 0 ? selectedAnswers.join(', ') : (customAnswer || alert('Please select at least one option or enter an answer'));

    if (answer) {
        try {
            const response = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, answer })
            });
            if (!response.ok) throw new Error(await response.text());
            selectedAnswers = [];
            document.getElementById('answer').value = '';
            document.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'));
            await loadReview();
        } catch (error) {
            console.error('Answer Error:', error);
            alert('Failed to answer: ' + error.message);
        }
    }
});

document.getElementById('stop-questions').addEventListener('click', async () => {
    const questionId = document.getElementById('question-select').value;
    try {
        const response = await fetch('/api/stop-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId })
        });
        if (!response.ok) throw new Error(await response.text());
        await loadReview();
    } catch (error) {
        console.error('Stop Questions Error:', error);
        alert('Failed to stop questions: ' + error.message);
    }
});

document.getElementById('submit-prompt').addEventListener('click', async () => {
    const promptText = document.getElementById('new-prompt').value.trim();
    if (!promptText) {
        alert('Please enter a prompt');
        return;
    }
    try {
        const response = await fetch('/api/add-requirements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptText })
        });
        if (!response.ok) throw new Error(await response.text());
        promptHistory.push(promptText);
        document.getElementById('new-prompt').value = '';
        updatePromptHistory();
        await loadReview();
    } catch (error) {
        console.error('Prompt Error:', error);
        alert('Failed to submit prompt: ' + error.message);
    }
});

document.getElementById('req-prompt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reqId = document.getElementById('selected-req-id').value;
    const promptText = document.getElementById('req-prompt').value.trim();
    if (!promptText) {
        alert('Please enter a prompt');
        return;
    }
    try {
        const response = await fetch('/api/clarify-requirement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reqId, prompt: promptText })
        });
        if (!response.ok) throw new Error(await response.text());
        promptHistory.push(`Clarification for ${reqId}: ${promptText}`);
        document.getElementById('req-prompt').value = '';
        document.getElementById('req-prompt-form').style.display = 'none';
        updatePromptHistory();
        await loadReview();
    } catch (error) {
        console.error('Req Prompt Error:', error);
        alert('Failed to submit requirement prompt: ' + error.message);
    }
});

document.getElementById('epic-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const epicName = document.getElementById('epic-name').value.trim();
    if (!epicName || selectedRequirements.length === 0) {
        alert('Please enter an epic name and select at least one requirement');
        return;
    }
    try {
        const response = await fetch('/api/add-epic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ epicName, requirementIds: selectedRequirements })
        });
        if (!response.ok) throw new Error(await response.text());
        selectedRequirements = [];
        document.getElementById('epic-name').value = '';
        document.querySelectorAll('.epic-req-checkbox').forEach(cb => cb.checked = false);
        await loadReview();
    } catch (error) {
        console.error('Epic Error:', error);
        alert('Failed to add epic: ' + error.message);
    }
});

document.getElementById('question-select').addEventListener('change', (e) => {
    const questionInternalId = e.target.value;
    const optionsDiv = document.getElementById('answer-options');
    optionsDiv.innerHTML = '';

    if (questionInternalId) {
        fetch('/api/review')
            .then(res => res.json())
            .then(data => {
                const question = data.questions.find(q => q.internalId === questionInternalId);
                if (question && question.options && question.options.length) {
                    optionsDiv.innerHTML = '<label class="form-label">Answer Options (Select multiple):</label><br>' + question.options.map(option => 
                        `<div class="answer-option" data-answer="${option}">${option}</div>`
                    ).join('');
                    document.querySelectorAll('.answer-option').forEach(option => {
                        option.addEventListener('click', () => {
                            const value = option.dataset.answer;
                            if (selectedAnswers.includes(value)) {
                                selectedAnswers = selectedAnswers.filter(v => v !== value);
                                option.classList.remove('selected');
                            } else {
                                selectedAnswers.push(value);
                                option.classList.add('selected');
                            }
                            document.getElementById('answer').value = selectedAnswers.join(', ');
                        });
                    });
                }
            });
    }
});

document.getElementById('download-json').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/api/download/json';
});

document.getElementById('download-md').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/api/download/md';
});

document.getElementById('status-filter').addEventListener('change', (e) => {
    currentStatusFilter = e.target.value;
    loadReview();
});

async function loadReview() {
    try {
        const response = await fetch('/api/review');
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();

        document.getElementById('project-title').textContent = `Project: ${data.projectName}`;
        document.getElementById('req-count').textContent = data.requirements.length;

        const processValues = [...new Set(data.requirements.map(r => r.process).filter(p => p))];
        const entityValues = [...new Set(data.requirements.map(r => r.entity).filter(e => e))];

        const processCounts = {};
        const entityCounts = {};
        data.requirements.forEach(r => {
            processCounts[r.process] = (processCounts[r.process] || 0) + 1;
            entityCounts[r.entity] = (entityCounts[r.entity] || 0) + 1;
        });

        const processFilters = document.getElementById('process-filters');
        processFilters.innerHTML = processValues.map(process => 
            `<button class="btn btn-outline-secondary btn-sm filter-req-process${process === currentProcessFilter ? ' active' : ''}" data-process="${process}">${process} (${processCounts[process] || 0})</button>`
        ).join('');
        
        const entityFilters = document.getElementById('entity-filters');
        entityFilters.innerHTML = entityValues.map(entity => 
            `<button class="btn btn-outline-secondary btn-sm filter-req-entity${entity === currentEntityFilter ? ' active' : ''}" data-entity="${entity}">${entity} (${entityCounts[entity] || 0})</button>`
        ).join('');

        document.querySelectorAll('.filter-req-process').forEach(button => {
            button.addEventListener('click', (e) => {
                currentProcessFilter = e.target.dataset.process;
                document.querySelectorAll('.filter-req-process').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                loadReview();
            });
        });

        document.querySelectorAll('.filter-req-entity').forEach(button => {
            button.addEventListener('click', (e) => {
                currentEntityFilter = e.target.dataset.entity;
                document.querySelectorAll('.filter-req-entity').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                loadReview();
            });
        });

        document.getElementById('filter-req-all-process').addEventListener('click', () => {
            currentProcessFilter = null;
            document.querySelectorAll('.filter-req-process').forEach(btn => btn.classList.remove('active'));
            loadReview();
        });

        document.getElementById('filter-req-all-entity').addEventListener('click', () => {
            currentEntityFilter = null;
            document.querySelectorAll('.filter-req-entity').forEach(btn => btn.classList.remove('active'));
            loadReview();
        });

        const filteredRequirements = data.requirements.filter(r => 
            (currentProcessFilter ? r.process === currentProcessFilter : true) && 
            (currentEntityFilter ? r.entity === currentEntityFilter : true)
        );
        document.getElementById('requirements').innerHTML = filteredRequirements.map(r => 
            `<div class="req-item" data-req-id="${r.internalId}">
                <p>${r.id}: ${r.text}${r.epic ? ' [Epic: ' + r.epic + ']' : ''}</p>
                <div class="req-details">
                    <span>Benefit: ${r.benefit}</span><br>
                    <span>Objective: ${r.objective}</span><br>
                    <span>Value: ${r.value}</span><br>
                    ${r.process ? `<span>Process: ${r.process}</span><br>` : ''}
                    ${r.entity ? `<span>Entity: ${r.entity}</span><br>` : ''}
                    ${r.useCase ? `<span>Use Case: ${r.useCase}</span>` : ''}
                </div>
            </div>`
        ).join('');

        document.getElementById('open-q-count').textContent = data.questions.filter(q => q.status === 'Open').length;
        document.getElementById('all-q-count').textContent = data.questions.length;
        
        const toValues = [...new Set(data.questions.map(q => q.to))];
        const toCounts = {};
        data.questions.forEach(q => toCounts[q.to] = (toCounts[q.to] || 0) + 1);

        const toFilters = document.getElementById('to-filters');
        toFilters.innerHTML = toValues.map(to => 
            `<button class="btn btn-outline-secondary btn-sm filter-to${to === currentToFilter ? ' active' : ''}" data-to="${to}">${to} (${toCounts[to]})</button>`
        ).join('');

        document.querySelectorAll('.filter-to').forEach(button => {
            button.addEventListener('click', (e) => {
                currentToFilter = e.target.dataset.to;
                document.querySelectorAll('.filter-to').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                loadReview();
            });
        });

        document.getElementById('filter-all').addEventListener('click', () => {
            currentToFilter = null;
            document.querySelectorAll('.filter-to').forEach(btn => btn.classList.remove('active'));
            loadReview();
        });

        const filteredQuestions = data.questions.filter(q => 
            (currentToFilter ? q.to === currentToFilter : true) && 
            q.status === currentStatusFilter
        );
        document.getElementById('questions').innerHTML = filteredQuestions.map(q => 
            `<p class="question-item" data-question-id="${q.internalId}">${q.id}: ${q.text} (To: ${q.to}, Topic: ${q.topic}, ${q.status})</p>`
        ).join('');

        const select = document.getElementById('question-select');
        select.innerHTML = '<option value="">Select a question</option>' + filteredQuestions
            .filter(q => q.status === 'Open')
            .map(q => `<option value="${q.internalId}">${q.id}: ${q.text} (To: ${q.to})</option>`).join('');

        const unassignedRequirements = data.requirements.filter(r => !r.epic);
        document.getElementById('epic-req-count').textContent = unassignedRequirements.length;
        document.getElementById('epic-requirements').innerHTML = unassignedRequirements.map(r => 
            `<div class="epic-req-item">
                <input type="checkbox" class="epic-req-checkbox" data-req-id="${r.internalId}" ${selectedRequirements.includes(r.internalId) ? 'checked' : ''}>
                ${r.id}: ${r.text}
            </div>`
        ).join('');

        document.querySelectorAll('.epic-req-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const reqId = e.target.dataset.reqId;
                if (e.target.checked) {
                    if (!selectedRequirements.includes(reqId)) selectedRequirements.push(reqId);
                } else {
                    selectedRequirements = selectedRequirements.filter(id => id !== reqId);
                }
            });
        });

        const epicsList = document.getElementById('epics-list');
        const epics = data.epics || [];
        epicsList.innerHTML = epics.map(e => 
            `<div class="epic-list-item">
                ${e.name}: ${e.requirementIds.map(id => data.requirements.find(r => r.internalId === id)?.id || 'Unknown').join(', ')}
                ${e.devOpsId ? `<button class="btn btn-success btn-sm add-to-devops-btn" disabled>Synced (ID: ${e.devOpsId})</button>` : `<button class="btn btn-primary btn-sm add-to-devops-btn" data-epic-name="${e.name}" data-req-ids="${e.requirementIds.join(',')}">Add to DevOps</button>`}
                <button class="btn btn-info btn-sm queue-epic-btn" data-epic-name="${e.name}" data-req-ids="${e.requirementIds.join(',')}">Queue Epic</button>
                <button class="btn btn-warning btn-sm create-workitems-btn" data-epic-name="${e.name}">Create Work Items</button>
            </div>`
        ).join('');

        document.querySelectorAll('.add-to-devops-btn:not(:disabled)').forEach(button => {
            button.addEventListener('click', async (e) => {
                const epicName = e.target.dataset.epicName;
                const requirementIds = e.target.dataset.reqIds.split(',');
                try {
                    const response = await fetch('/api/add-epic-to-devops', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ epicName, requirementIds })
                    });
                    if (!response.ok) throw new Error(await response.text());
                    await loadReview();
                } catch (error) {
                    console.error('Add to DevOps Error:', error);
                    alert('Failed to add epic to DevOps: ' + error.message);
                }
            });
        });

        document.querySelectorAll('.queue-epic-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const epicName = e.target.dataset.epicName;
                const requirementIds = e.target.dataset.reqIds.split(',');
                // Collect full requirement objects including id
                const requirements = data.requirements
                    .filter(r => requirementIds.includes(r.internalId))
                    .map(r => ({
                        id: r.id, // Include the requirement ID
                        description: r.text || '',
                        benefit: r.benefit || 'Unknown',
                        objective: r.objective || 'Unknown',
                        value: r.value || 'Unknown'
                    }));

                if (requirements.length === 0) {
                    alert('No valid requirements found for this Epic');
                    return;
                }

                try {
                    console.log(`Queuing Epic ${epicName} with requirements:`, requirements);
                    const response = await fetch('/api/orchestrate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requirements })
                    });
                    if (!response.ok) throw new Error(await response.text());
                    const results = await response.json();
                    console.log(`Orchestration Results for ${epicName}:`, results);
                    alert(`Epic ${epicName} queued successfully! Check console for results.`);
                } catch (error) {
                    console.error('Queue Epic Error:', error);
                    alert('Failed to queue epic: ' + error.message);
                }
            });
        });

        document.querySelectorAll('.create-workitems-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const epicName = e.target.dataset.epicName;
                try {
                    const response = await fetch('/api/create-workitems', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ epicName })
                    });
                    if (!response.ok) throw new Error(await response.text());
                    const result = await response.json();
                    alert(`Work items created for epic ${epicName}: ${result.message}`);
                } catch (error) {
                    console.error('Create Work Items Error:', error);
                    alert('Failed to create work items: ' + error.message);
                }
            });
        });
        
        document.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', () => {
                const questionId = item.dataset.questionId;
                select.value = questionId;
                select.dispatchEvent(new Event('change'));
            });
        });

        document.querySelectorAll('.req-item').forEach(item => {
            item.addEventListener('click', () => {
                const reqId = item.dataset.reqId;
                document.getElementById('selected-req-id').value = reqId;
                document.getElementById('req-prompt-form').style.display = 'block';
            });
        });
    } catch (error) {
        console.error('Review Error:', error);
        alert('Failed to load review: ' + error.message);
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function openMainTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('maintabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.querySelectorAll('.nav-tabs.card-header-tabs .nav-link');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
}

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.querySelectorAll('.nav-tabs.card-header-tabs .nav-link:not(.card-header-tabs .nav-link)');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
}

function updatePromptHistory() {
    const list = document.getElementById('prompt-list');
    list.innerHTML = promptHistory.map(p => `<li class="list-group-item">${p}</li>`).join('');
}

document.getElementById('submit-question').addEventListener('click', async () => {
    const question = document.getElementById('question-prompt').value.trim();
    if (!question) {
        alert('Please enter a question');
        return;
    }
    try {
        const response = await fetch('/api/ask-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        if (!response.ok) throw new Error(await response.text());
        const result = await response.json();
        document.getElementById('question-response').innerHTML = `<p>${result.answer}</p>`;
    } catch (error) {
        console.error('Ask Question Error:', error);
        alert('Failed to ask question: ' + error.message);
    }
});

loadReview();
