const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Route for main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for enhanced app
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'enhanced-hypeflow-ai-pro.html'));
});

app.listen(port, () => {
    console.log(`HypeFlow AI Pro running on port ${port}`);
});
