const fs = require('fs-extra');
const path = require('path');

exports.generateWireframe = async (req, res) => {
    const { screens } = req.body;
    const wireframe = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${screens[0].name}</title>
    <style>body{background:#f8f9fa}.main{padding:20px}button{background:#007bff;color:#fff}</style>
</head>
<body>
    <div class="main">
        <h2>${screens[0].purpose}</h2>
        <button>Action</button>
    </div>
</body>
</html>`;
    const filename = `${screens[0].name}.html`;
    await fs.writeFile(path.join('public', filename), wireframe);
    res.status(200).json({ filename });
};

// Add similar methods for architecture, specs, tasks, test cases
