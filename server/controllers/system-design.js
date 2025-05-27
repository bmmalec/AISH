exports.decomposeSystem = async (req, res) => {
    const { requirements } = req.body;
    if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
        return res.status(400).json({ error: 'Requirements must be a non-empty array of objects' });
    }
    if (!requirements.every(r => r.description)) {
        return res.status(400).json({ error: 'Each requirement must have a description' });
    }
    const components = requirements.map(req => ({
        frontend: req.category === 'UI' ? `${req.description.split(' ')[0].toLowerCase()}-screen.html` : null,
        backend: `${req.description.split(' ')[0].toLowerCase()}.js`,
        database: 'Project model'
    }));
    res.status(200).json(components);
};

exports.mapRequirements = async (req, res) => {
    const { requirements, components } = req.body;
    if (!requirements || !Array.isArray(requirements) || !components || !Array.isArray(components)) {
        return res.status(400).json({ error: 'Requirements and components must be non-empty arrays' });
    }
    if (requirements.length !== components.length) {
        return res.status(400).json({ error: 'Requirements and components arrays must have the same length' });
    }
    const matrix = requirements.map((req, i) => ({
        reqId: req.id,
        component: components[i]
    }));
    res.status(200).json(matrix);
};