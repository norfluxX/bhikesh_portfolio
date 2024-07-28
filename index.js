const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = 3000;

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

app.get('/add-quote', (req, res) => {
  // Read the quotes from the text file
  fs.readFile(quoteFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the quote file:', err);
      res.status(500).send('Error reading the quote file');
      return;
    }

    // Split the data by newlines, trim each line, ensure it ends with a period, and filter out any empty lines
    const quotes = data.split('\n')
      .map(line => ensurePeriod(line.trim()))
      .filter(line => line && line !== '.');  // Filter out empty lines and lines that are just a period

    // Read the index.html file
    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
      if (err) {
        console.error('Error reading the index file:', err);
        res.status(500).send('Error reading the index file');
        return;
      }

      // Extract existing quotes from the index.html
      const existingQuotes = [];
      const quoteRegex = /<div class="talktext">\s*<p>([^<]+)<\/p>/g;
      let match;
      while ((match = quoteRegex.exec(htmlData)) !== null) {
        existingQuotes.push(match[1].trim());
      }

      // Filter out quotes that already exist in the index.html
      const newQuotes = quotes.filter(quote => !existingQuotes.includes(quote));

      if (newQuotes.length === 0) {
        console.log('All quotes already exist in index.html');
        res.send('All quotes already exist in index.html');
        return;
      }

      // HTML block to be inserted for each new quote
      const newBlocks = newQuotes.map(quote => `
        <div class="talk-bubble">
          <div class="talk-bubble tri-right border-9 round btm-left-in">
            <div class="talktext">
              <p>${quote}</p>
            </div>
          </div>
        </div>
      `).join('\n');

      // Define the position after which the new block will be inserted
      const insertAfter = '<h2 class="mb-5">Conscious Mind</h2>';

      // Find the index where to insert the new blocks
      const insertIndex = htmlData.indexOf(insertAfter);
      if (insertIndex === -1) {
        console.error('The specified insert position was not found.');
        res.status(500).send('The specified insert position was not found.');
        return;
      }

      // Insert the new blocks after the specified line
      const updatedData = [
        htmlData.slice(0, insertIndex + insertAfter.length),
        newBlocks,
        htmlData.slice(insertIndex + insertAfter.length)
      ].join('\n');

      // Write the updated content back to index.html
      fs.writeFile(indexPath, updatedData, 'utf8', err => {
        if (err) {
          console.error('Error writing to the index file:', err);
          res.status(500).send('Error writing to the index file');
          return;
        }

        console.log('Quotes successfully added to index.html');
        res.send('Quotes successfully added to index.html');
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

