exports.categorizeRequirement = async (req, res) => {
    const { requirement } = req.body;
    if (!requirement || !requirement.description) {
        return res.status(400).json({ error: 'Requirement with description is required' });
    }
    const categorized = {
        id: requirement.id || `R-${Date.now()}`, // Use existing id if provided, else generate
        category: requirement.description.includes('interface') ? 'UI' : 'Data',
        description: requirement.description,
        benefit: requirement.benefit || 'Unknown',
        objective: requirement.objective || 'Unknown',
        value: requirement.value || 'Unknown'
    };
    res.status(200).json([categorized]);
};