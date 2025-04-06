require('dotenv').config();
const path = require('path');
const axios = require('axios');
const IPINFO_TOKEN = process.env.IPINFO_TOKEN;
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3005;

// Serve static files from the 'assets', 'js', and 'css' directories
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.set('trust proxy', true);

// Paths to your files
const indexPath = path.join(__dirname, 'index.html');

// Helper to get real IP
async function getClientIP(req) {
  let ip = req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : req.socket.remoteAddress;

  // If localhost or internal Docker IP, fallback to public IP
  if (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('::ffff:172.')
  ) {
    try {
      const res = await axios.get('https://api.ipify.org?format=json');
      ip = res.data.ip;
    } catch (err) {
      console.error('Failed to fetch public IP:', err.message);
    }
  }

  return ip;
}


// Serve the index.html file
app.get('/', async (req, res) => {

  const indexPath = path.join(__dirname, 'index.html');

  try {
    const ip = await getClientIP(req);
    const geoRes = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    const { city = 'Unknown', country = 'Unknown' } = geoRes.data;

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const logLine = `${timestamp} - IP: ${ip}, City: ${city}, Country: ${country}\n`;

    const filePath = path.join(__dirname, 'visitors.txt');
    fs.appendFile(filePath, logLine, (err) => {
      if (err) console.error('Error writing to file:', err.message);
    });
  } catch (err) {
    console.error('Geo lookup failed:', err.message);
  }
  // real file 
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
