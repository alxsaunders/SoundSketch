const express = require('express');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
    console.log('Created downloads directory at:', downloadsDir);
}

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[\/\\?%*:|"<>]/g, '') // Remove invalid characters
        .replace(/[🎵🎶🎤🎧🔥💯👑]/g, '') // Remove emojis
        .replace(/["'"]/g, '') // Remove quotes
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 80); // Limit length
}

app.post('/convert', async (req, res) => {
    console.log('Received request body:', req.body);
    const { url } = req.body;

    if (!url) {
        console.log('Invalid URL received:', url);
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        console.log('Getting video info for:', url);
        
        // First, get video information to extract title
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noDownload: true,
            noWarnings: true
        });

        console.log('Video title:', info.title);
        
        // Generate filename using title
        const timestamp = Date.now();
        const sanitizedTitle = sanitizeFilename(info.title || 'unknown_video');
        const filename = `${sanitizedTitle}_${timestamp}.mp3`;
        const outputPath = path.join(downloadsDir, filename);

        // Download and convert to MP3
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath
        });

        console.log('Download complete:', outputPath);
        
        res.json({
            success: true,
            downloadPath: `http://localhost:3001/download/${filename}`,
            title: info.title, // Send original title to frontend
            filename: filename
        });

    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadsDir, filename);
    console.log('Download requested for:', filePath);

    if (fs.existsSync(filePath)) {
        // Create a cleaner download name (remove timestamp and clean up)
        const cleanName = filename
            .replace(/_\d+\.mp3$/, '.mp3') // Remove timestamp
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim(); // Remove leading/trailing spaces
        
        console.log('Download filename:', cleanName);
        
        // Set proper headers for download
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(cleanName)}`);
        res.setHeader('Content-Type', 'audio/mpeg');
        
        res.download(filePath, cleanName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to download the file' });
                }
            }
            // Delete file after download
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
                else console.log('File deleted after download:', filePath);
            });
        });
    } else {
        console.log('File not found:', filePath);
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});