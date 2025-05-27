exports.identifyScreens = async (req, res) => {
    const { requirements, components } = req.body;
    if (!requirements || !Array.isArray(requirements) || !components || !Array.isArray(components)) {
        return res.status(400).json({ error: 'Requirements and components must be non-empty arrays' });
    }
    const screens = requirements
        .filter(r => r.category === 'UI')
        .map(r => ({
            name: `${r.description.split(' ')[0].toLowerCase()}-screen`,
            purpose: `Support ${r.description}`,
            reqId: r.id
        }));
    res.status(200).json(screens);
};