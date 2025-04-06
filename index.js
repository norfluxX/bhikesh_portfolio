const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = 3005;

// Serve static files from the 'assets', 'js', and 'css' directories
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// Paths to your files
const quoteFilePath = path.join(__dirname, 'quote.txt');
const indexPath = path.join(__dirname, 'index.html');

// Ensure the quote ends with a period
const ensurePeriod = quote => quote.endsWith('.') ? quote : quote + '.';

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

